import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
// The standard Supabase SSR implementation deliberately does not cache this
// factory function to ensure that each call dynamically retrieves the context's cookies.
// The deduplication of user fetching is properly handled in lib/session.ts instead.
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
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, value, options)
                        })
                    } catch (error) {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware/proxy refreshing
                        // user sessions.
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
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
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
