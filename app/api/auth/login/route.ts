import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'
import { sanitizeEmail, truncate } from '@/lib/validation'

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
    try {
        // Rate limit: 5 login attempts per minute per IP
        const ip = getClientIp(request)
        const rateLimitResult = checkRateLimit(ip, RATE_LIMITS.auth)
        if (!rateLimitResult.success) {
            return buildLoginErrorResponse(
                request,
                `Too many login attempts. Please try again in ${rateLimitResult.retryAfterSeconds} seconds.`,
                429
            )
        }

        const formData = await request.formData()
        const rawEmail = formData.get('email')
        const rawPassword = formData.get('password')

        if (!rawEmail || !rawPassword) {
            return buildLoginErrorResponse(request, 'Email and password are required', 400)
        }

        const email = sanitizeEmail(rawEmail)
        const password = truncate(String(rawPassword), 128) // Cap password length

        if (!email) {
            return buildLoginErrorResponse(request, 'Please enter a valid email address', 400)
        }

        const cookieStore = await cookies()

        // Collect cookies to set on response
        const cookiesToSet: Array<{ name: string; value: string; options: Record<string, unknown> }> = []

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseKey) {
            console.error('Login failed: Supabase URL or Anon Key is missing from environment variables')
            return buildLoginErrorResponse(request, 'Server configuration error. Please contact support.', 500)
        }

        const supabase = createServerClient(
            supabaseUrl,
            supabaseKey,
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
        let role = 'planner'
        try {
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

            if (vendorRecord) {
                role = 'vendor'
            } else if (profile?.role) {
                role = profile.role
            }
        } catch (roleError) {
            // If role detection fails, default to planner — don't block login
            console.error('Role detection failed, defaulting to planner:', roleError)
        }

        const wantsJson = request.headers.get('accept')?.includes('application/json')
        const response = wantsJson
            ? NextResponse.json({ success: true, redirectUrl: `/${role}` })
            : NextResponse.redirect(new URL(`/${role}`, request.url), { status: 303 })

        // Explicitly set all Supabase auth cookies on the OK response
        // NOTE: Do NOT set httpOnly: true — the @supabase/ssr browser client
        // needs to read these cookies via document.cookie to include the
        // access token in API requests. Setting httpOnly blocks client-side
        // access, causing 403 errors on /auth/v1/user.
        cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, {
                ...options,
                httpOnly: false,
                sameSite: 'lax' as const,
                secure: process.env.NODE_ENV === 'production',
                path: '/',
            })
        })

        return response
    } catch (err) {
        console.error('Login error:', err)
        const message = err instanceof Error ? err.message : 'An unexpected error occurred'
        return buildLoginErrorResponse(request, `Login service unavailable: ${message}`, 500)
    }
}
