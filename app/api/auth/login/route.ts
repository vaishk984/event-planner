import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function buildLoginErrorResponse(request: NextRequest, message: string, status: number) {
    const wantsJson = request.headers.get('accept')?.includes('application/json')

    if (wantsJson) {
        return NextResponse.json({ error: message }, { status })
    }

    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('error', message)
    return NextResponse.redirect(loginUrl, { status: 303 })
}

export async function POST(request: NextRequest) {
    const formData = await request.formData()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return buildLoginErrorResponse(request, 'Email and password are required', 400)
    }

    const cookieStore = await cookies()

    // Collect cookies to set on response
    const cookiesToSet: Array<{ name: string; value: string; options: Record<string, unknown> }> = []

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(incoming) {
                    // Collect all cookies Supabase wants to set
                    incoming.forEach(({ name, value, options }) => {
                        cookiesToSet.push({ name, value, options: options as Record<string, unknown> })
                    })
                },
            },
        }
    )

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
        return buildLoginErrorResponse(request, error.message, 401)
    }

    if (!data.user) {
        return buildLoginErrorResponse(request, 'Login failed. Please try again.', 401)
    }

    // Determine redirect URL based on role
    const { data: vendorRecord } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', data.user.id)
        .maybeSingle()

    const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle()

    let role = 'planner'
    if (vendorRecord) {
        role = 'vendor'
    } else if (profile?.role) {
        role = profile.role
    }

    const wantsJson = request.headers.get('accept')?.includes('application/json')
    const response = wantsJson
        ? NextResponse.json({ success: true, redirectUrl: `/${role}` })
        : NextResponse.redirect(new URL(`/${role}`, request.url), { status: 303 })

    // Explicitly set all Supabase auth cookies on the OK response
    cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, {
            ...options,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            // NOT httpOnly — @supabase/ssr's browser client must read these
            // cookies via document.cookie to stay in sync with token rotations
            // performed by proxy.ts's getUser() call.
        })
    })

    return response
}
