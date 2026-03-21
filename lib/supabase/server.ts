import { createServerClient } from '@supabase/ssr'
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
                        // In Next.js App Router, modifying cookies in a Server Action while
                        // the proxy.ts middleware is also modifying them causes a race condition.
                        // If the proxy refreshed the token, the Server Action may still use the old one,
                        // prompting Supabase to revoke the session and the Server Action to wipe cookies.
                        // We rely strictly on proxy.ts and the browser client for token refresh.
                        // So we intentionally DO NOT set cookies here.
                    } catch (error) {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
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
