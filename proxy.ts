import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export default async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Create Supabase client for middleware
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({ name, value, ...options })
                    response = NextResponse.next({
                        request: { headers: request.headers },
                    })
                    response.cookies.set({ name, value, ...options })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({ name, value: '', ...options })
                    response = NextResponse.next({
                        request: { headers: request.headers },
                    })
                    response.cookies.set({ name, value: '', ...options })
                },
            },
        }
    )

    // Refresh session if expired
    const { data: { user } } = await supabase.auth.getUser()

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
        return response
    }

    // If no user and trying to access protected route
    if (!user && !isPublicRoute && !isClientRoute) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // If user exists and trying to access login/signup
    if (user && isPublicRoute) {
        // Get user role and redirect to appropriate dashboard
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        // Check if user has a vendor record
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

        // Check if user has a vendor record
        const { data: vendorRecord } = await supabase
            .from('vendors')
            .select('id')
            .eq('user_id', user.id)
            .single()

        const role = vendorRecord ? 'vendor' : (profile?.role || 'planner')

        // Check role-based route access
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
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
