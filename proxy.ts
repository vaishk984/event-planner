import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export default async function proxy(request: NextRequest) {
    const url = new URL(request.url)
    const path = url.pathname

    let supabaseResponse = NextResponse.next({
        request,
    })

    // Log incoming cookies for debugging
    const incomingCookies = request.cookies.getAll()
    const sbCookies = incomingCookies.filter(c => c.name.startsWith('sb-'))
    console.log(`[Proxy] ${request.method} ${path} | Total cookies: ${incomingCookies.length} | Supabase cookies: ${sbCookies.length}`)
    if (sbCookies.length > 0) {
        console.log(`[Proxy] Supabase cookie names: ${sbCookies.map(c => `${c.name}(${c.value.length}chars)`).join(', ')}`)
    }

    let setAllCalled = false
    let setAllCookieNames: string[] = []

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    setAllCalled = true
                    setAllCookieNames = cookiesToSet.map(c => `${c.name}(${c.value.length}chars)`)
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

    // Keep the Supabase session fresh at the edge
    const { data: { user }, error } = await supabase.auth.getUser()

    console.log(`[Proxy] getUser result: ${user ? `user=${user.id.substring(0, 8)}...` : 'null'} | error: ${error?.message || 'none'} | setAll called: ${setAllCalled}`)
    if (setAllCalled) {
        console.log(`[Proxy] setAll wrote: ${setAllCookieNames.join(', ')}`)
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
