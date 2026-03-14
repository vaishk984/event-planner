import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { cache } from 'react'

// CRITICAL: cache() ensures a single Supabase client per server request.
// Without this, each Server Component creates a separate client. When one
// client's getUser() refreshes the auth token, setAll() silently fails in
// Server Components, so subsequent clients read stale cookies and fail.
// By sharing ONE cached client, all components reuse the same validated token.
export const createClient = cache(async () => {
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
})

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
