import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

async function getAuthenticatedUserFromClient(
    supabase: Awaited<ReturnType<typeof createClient>>
): Promise<User | null> {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        return null
    }

    return user
}

export async function getAuthenticatedUser() {
    const supabase = await createClient()
    return getAuthenticatedUserFromClient(supabase)
}

async function ensureUserProfile(
    supabase: Awaited<ReturnType<typeof createClient>>,
    user: User,
    role: string,
    displayName: string
) {
    const { data: existingProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, role, display_name')
        .eq('id', user.id)
        .maybeSingle()

    if (profileError) {
        return { role, displayName }
    }

    if (!existingProfile) {
        const { error: insertProfileError } = await supabase
            .from('user_profiles')
            .insert({
                id: user.id,
                role,
                display_name: displayName,
            })

        if (!insertProfileError && role === 'planner') {
            await supabase
                .from('planner_profiles')
                .insert({
                    id: user.id,
                    company_name: user.user_metadata?.company_name || 'My Company',
                })
        }

        return { role, displayName }
    }

    return {
        role: existingProfile.role || role,
        displayName: existingProfile.display_name || displayName,
    }
}

export async function getSession() {
    const supabase = await createClient()
    const user = await getAuthenticatedUserFromClient(supabase)

    if (!user) {
        return null
    }

    // Check if user has a vendor record so dashboards can choose the correct shell.
    const { data: vendorRecord } = await supabase
        .from('vendors')
        .select('id, company_name')
        .eq('user_id', user.id)
        .maybeSingle()

    let role = 'planner'
    let displayName = user.email || 'Planner'

    if (vendorRecord) {
        role = 'vendor'
        displayName = vendorRecord.company_name || user.email || 'Vendor'
    }

    const ensuredProfile = await ensureUserProfile(supabase, user, role, displayName)
    role = ensuredProfile.role
    displayName = ensuredProfile.displayName

    return {
        userId: user.id,
        email: user.email,
        role,
        displayName,
    }
}

export async function getUserId() {
    const session = await getSession()
    return session?.userId || null
}

export async function getUserRole() {
    const session = await getSession()
    return session?.role || null
}
