import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export default async function proxy(request: NextRequest) {
    const supabaseResponse = NextResponse.next({
        request,
    })

    // IMPORTANT: We do NOT call supabase.auth.getUser() here.
    // On Vercel, calling getUser() in the Edge proxy can clear valid session
    // cookies if the token format doesn't match what the proxy's Supabase client
    // expects — the setAll callback overwrites the cookie with an empty value.
    // Token refresh is handled by server-side createClient in lib/supabase/server.ts.

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
