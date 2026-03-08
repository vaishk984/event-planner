import { createClient } from '@/lib/supabase/server'

export async function getSession() {
    const supabase = await createClient()

    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session?.user) {
        return null
    }

    const { user } = session

    // Check if user has a vendor record — use maybeSingle() so planners (no vendor row) return null cleanly
    const { data: vendorRecord } = await supabase
        .from('vendors')
        .select('id, company_name')
        .eq('user_id', user.id)
        .maybeSingle()

    // Determine role: vendor if has vendor record, otherwise planner
    let role = 'planner'
    let displayName = user.email

    if (vendorRecord) {
        role = 'vendor'
        displayName = vendorRecord.company_name || user.email
    }

    return {
        userId: user.id,
        email: user.email,
        role: role,
        displayName: displayName,
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
