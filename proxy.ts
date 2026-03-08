import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export default async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl
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
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
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

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getSession(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user

    // Public routes - allow access
    const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password']
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

    // Client proposal routes - public with token
    const isClientRoute = pathname.startsWith('/client/proposal')

    // API routes - handled separately
    const isApiRoute = pathname.startsWith('/api')

    // Static files
    const isStaticRoute = pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon') ||
        pathname.includes('.')

    if (isStaticRoute || isApiRoute) {
        return supabaseResponse
    }

    // If no user and trying to access protected route
    if (!user && !isPublicRoute && !isClientRoute) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // If user exists and trying to access login/signup
    if (user && isPublicRoute) {
        // ... (profile and role fetching logic stays the same)
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        const { data: vendorRecord } = await supabase
            .from('vendors')
            .select('id')
            .eq('user_id', user.id)
            .single()

        const role = vendorRecord ? 'vendor' : (profile?.role || 'planner')
        return NextResponse.redirect(new URL(`/${role}`, request.url))
    }

    // Role-based access control
    if (user) {
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        const { data: vendorRecord } = await supabase
            .from('vendors')
            .select('id')
            .eq('user_id', user.id)
            .single()

        const role = vendorRecord ? 'vendor' : (profile?.role || 'planner')

        if (pathname.startsWith('/planner') && role !== 'planner' && role !== 'admin') {
            return NextResponse.redirect(new URL(`/${role}`, request.url))
        }

        if (pathname.startsWith('/vendor') && role !== 'vendor' && role !== 'admin') {
            return NextResponse.redirect(new URL(`/${role}`, request.url))
        }

        if (pathname.startsWith('/admin') && role !== 'admin') {
            return NextResponse.redirect(new URL(`/${role}`, request.url))
        }
    }

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
