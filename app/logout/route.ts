import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        cookieStore.set(name, value, options)
                    })
                },
            },
        }
    )

    // Sign out from Supabase
    await supabase.auth.signOut()

    // Clear all auth-related cookies
    const allCookies = cookieStore.getAll()
    for (const cookie of allCookies) {
        if (cookie.name.includes('supabase') || cookie.name === 'session') {
            cookieStore.delete(cookie.name)
        }
    }

    // Redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
}
