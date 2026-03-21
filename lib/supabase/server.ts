import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// The standard Supabase SSR implementation deliberately does not cache this
// factory function to ensure that each call dynamically retrieves the context's
// cookies. The deduplication of user fetching is handled in lib/session.ts.
export async function createClient() {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        // Route handlers and server actions can persist refreshed
                        // auth cookies here. In plain Server Components, Next.js
                        // will throw because cookies are read-only, and proxy.ts
                        // remains responsible for keeping the session fresh.
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, value, options as CookieOptions)
                        })
                    } catch {
                        // Ignore read-only cookie errors in Server Components.
                    }
                },
            },
        }
    )
}

/**
 * Get current user session
 */
export async function getUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user || null
}

/**
 * Get user profile with role
 */
export async function getUserProfile() {
    const supabase = await createClient()
    const user = await getUser()

    if (!user) return null

    const { data: profile } = await supabase
        .from('user_profiles')
        .select(`
      *,
      role:roles(*)
    `)
        .eq('id', user.id)
        .single()

    return profile
}
