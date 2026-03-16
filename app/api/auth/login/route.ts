import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
    const formData = await request.formData()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
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
        return NextResponse.json({ error: error.message }, { status: 401 })
    }

    if (!data.user) {
        return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 401 })
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

    const response = NextResponse.json({ success: true, redirectUrl: `/${role}` })

    console.log('[Login API] Attempting to set', cookiesToSet.length, 'cookies from Supabase.')

    // Explicitly set all Supabase auth cookies on the OK response
    cookiesToSet.forEach(({ name, value, options }) => {
        console.log(`[Login API] Setting cookie: ${name}`)
        response.cookies.set(name, value, {
            ...options,
            // Ensure cookies work on Vercel's HTTPS domain
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            path: '/',
        })
    })

    return response
}
