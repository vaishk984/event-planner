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
    let displayName = user.email

    if (vendorRecord) {
        role = 'vendor'
        displayName = vendorRecord.company_name || user.email
    }

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
