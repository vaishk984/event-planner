import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Next.js 16 Proxy (replaces middleware.ts)
 *
 * 1. Forwards / refreshes Supabase auth cookies on every request
 * 2. Protects /planner/*, /vendor/*, /admin/* pages by redirecting
 *    unauthenticated users to /login
 * 3. Allows all public routes through without a session check
 * 4. Adds security headers to all responses
 */

// Routes that require an authenticated session
const PROTECTED_PREFIXES = ['/planner', '/vendor', '/admin']

// Routes that are always public (no session check needed)
const PUBLIC_PREFIXES = [
    '/login',
    '/signup',
    '/forgot-password',
    '/showroom',
    '/client',
    '/portal',
    '/intake',
    '/capture',
    '/api',
    '/forbidden',
    '/privacy',
    '/terms',
    '/logout',
    '/_next',
]

function isProtectedRoute(pathname: string): boolean {
    return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

export default async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    // --- Public routes: pass through immediately ---
    // CRITICAL: Do NOT create a Supabase client for public routes.
    // Creating the SSR client triggers cookie reads and potentially token refresh
    // attempts. If the refresh fails (expired token, network issue), the SSR
    // package clears the auth cookies via setAll(). When the user navigates back
    // to a protected route, the session is gone and they must re-login.
    // This was the root cause of the "re-login after visiting Showroom" bug.
    if (!isProtectedRoute(pathname)) {
        const response = NextResponse.next({ request })
        addSecurityHeaders(response)
        return response
    }

    // --- Protected routes: verify session ---
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, {
                            ...options,
                            httpOnly: false,
                            sameSite: 'lax' as const,
                            secure: process.env.NODE_ENV === 'production',
                            path: '/',
                        })
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(loginUrl)
    }

    addSecurityHeaders(supabaseResponse)
    return supabaseResponse
}

function addSecurityHeaders(response: NextResponse) {
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
