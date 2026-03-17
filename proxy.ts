import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export default async function proxy(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    // Create the Supabase client purely to handle cookie forwarding.
    // When createServerClient is initialized, if the session is expired,
    // it will try to refresh it and call setAll(). Or if the client just logged in,
    // it ensures the cookies are readable.
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
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: We DO NOT call supabase.auth.getUser() here.
    // Why? Because getUser() validates the token against the Supabase API.
    // If the token format is slightly unexpected by the SSR package but valid overall
    // (which was happening), getUser() fails, assumes the user is logged out,
    // and calls setAll() with empty values — silently deleting the user's cookies.
    // By skipping getUser() in the edge proxy, we simply pass the cookies forward
    // to the Server Components (layout.tsx) which handle their own validation securely.

    // Add security headers
    supabaseResponse.headers.set('X-Frame-Options', 'DENY')
    supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff')
    supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
