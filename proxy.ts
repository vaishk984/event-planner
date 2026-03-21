import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export default async function proxy(request: NextRequest) {
    const url = new URL(request.url)
    const path = url.pathname

    let supabaseResponse = NextResponse.next({
        request,
    })

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
                    cookiesToSet.forEach(({ name, value, options }) => {
                        supabaseResponse.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    // IMPORTANT WORKAROUND FOR NEXT.JS APP ROUTER + SUPABASE:
    // Only keep the session fresh on actual page navigations.
    // If we call getUser() on Server Actions (which are POSTs) or /api routes,
    // the proxy might refresh the token while the Next.js Server Action is
    // simultaneously using the OLD token from cookies().
    // Supabase will detect token reuse, revoke the session entirely,
    // and the Server Action will wipe all cookies.
    if (!path.startsWith('/api') && request.method === 'GET') {
        const { error } = await supabase.auth.getUser()
        // If there's a hard error, we don't necessarily clear here —
        // we let the Server Components redirect to /login
    }

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
