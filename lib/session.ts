import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'

async function getAuthenticatedUserFromClient(
    supabase: Awaited<ReturnType<typeof createClient>>
): Promise<User | null> {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        return null
    }

    return user
}

export const getAuthenticatedUser = cache(async () => {
    const supabase = await createClient()
    return getAuthenticatedUserFromClient(supabase)
})

export function normalizeDisplayName(value?: string | null): string | null {
    const trimmed = value?.trim()

    if (!trimmed || trimmed.includes('@')) {
        return null
    }

    return trimmed
}

export function getFallbackDisplayName(role?: string | null): string {
    return role === 'vendor' ? 'Vendor' : 'Planner'
}

export function resolveDisplayName(
    user: Pick<User, 'user_metadata'> | null,
    storedDisplayName?: string | null,
    role?: string | null
): string {
    const metadataDisplayName = normalizeDisplayName(
        typeof user?.user_metadata?.display_name === 'string'
            ? user.user_metadata.display_name
            : typeof user?.user_metadata?.full_name === 'string'
                ? user.user_metadata.full_name
                : typeof user?.user_metadata?.name === 'string'
                    ? user.user_metadata.name
                    : null
    )

    return normalizeDisplayName(storedDisplayName)
        || metadataDisplayName
        || getFallbackDisplayName(role)
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
        return {
            role,
            displayName: resolveDisplayName(user, displayName, role),
        }
    }

    const resolvedRole = existingProfile?.role || role
    const resolvedDisplayName = resolveDisplayName(user, existingProfile?.display_name || displayName, resolvedRole)

    if (!existingProfile) {
        const { error: insertProfileError } = await supabase
            .from('user_profiles')
            .insert({
                id: user.id,
                role: resolvedRole,
                display_name: resolvedDisplayName,
            })

        if (!insertProfileError && resolvedRole === 'planner') {
            await supabase
                .from('planner_profiles')
                .insert({
                    id: user.id,
                    company_name: user.user_metadata?.company_name || 'My Company',
                })
        }

        return {
            role: resolvedRole,
            displayName: resolvedDisplayName,
        }
    }

    if (existingProfile.display_name !== resolvedDisplayName) {
        await supabase
            .from('user_profiles')
            .update({ display_name: resolvedDisplayName })
            .eq('id', user.id)
    }

    return {
        role: resolvedRole,
        displayName: resolvedDisplayName,
    }
}

// CRITICAL: cache() deduplicates this function within a single server request.
// Without it, layout calls getSession() -> getUser() which may rotate the refresh
// token, and then the page component calls getSession() again with stale cookies,
// causing the second getUser() to fail on Vercel's serverless runtime.
export const getSession = cache(async () => {
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
    let displayName = resolveDisplayName(user, null, role)

    if (vendorRecord) {
        role = 'vendor'
        displayName = normalizeDisplayName(vendorRecord.company_name) || getFallbackDisplayName(role)
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
})

export async function getUserId() {
    const session = await getSession()
    return session?.userId || null
}

export async function getUserRole() {
    const session = await getSession()
    return session?.role || null
}
