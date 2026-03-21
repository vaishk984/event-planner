import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Routes that require an authenticated session
const PROTECTED_PREFIXES = ['/planner', '/vendor', '/admin']

function isProtectedRoute(pathname: string): boolean {
    return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

export default async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Public routes should not instantiate the SSR auth client. Creating the
    // client on every route can trigger refresh/cleanup behavior that wipes
    // otherwise valid auth cookies during navigation to public pages.
    if (!isProtectedRoute(pathname)) {
        const response = NextResponse.next({ request })
        addSecurityHeaders(response)
        return response
    }

    const accumulatedCookies = new Map<string, { value: string; options: Record<string, unknown> }>()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => {
                        request.cookies.set(name, value)
                    })

                    cookiesToSet.forEach(({ name, value, options }) => {
                        accumulatedCookies.set(name, { value, options: options as Record<string, unknown> })
                    })
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

    const response = NextResponse.next({ request })

    for (const [name, { value, options }] of accumulatedCookies) {
        response.cookies.set(name, value, options)
    }

    addSecurityHeaders(response)
    return response
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
