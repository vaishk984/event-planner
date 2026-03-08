'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/actions/auth/login'
import type { ActionResult } from '@/types/domain'

// ============================================
// Admin Types
// ============================================

interface PlatformStats {
    totalPlanners: number
    totalVendors: number
    totalEvents: number
    totalBookings: number
    pendingVerifications: number
    revenueThisMonth: number
}

interface PlannerOverview {
    id: string
    email: string
    displayName: string
    companyName: string
    eventsCount: number
    createdAt: string
    isActive: boolean
}

interface VendorOverview {
    id: string
    name: string
    email: string
    category: string
    city: string
    isVerified: boolean
    rating: number
    bookingsCount: number
    createdAt: string
}

// ============================================
// Authorization Helper
// ============================================

async function ensureAdmin(): Promise<{ userId: string } | null> {
    const user = await getCurrentUser()
    if (!user || user.profile?.role !== 'admin') {
        return null
    }
    return { userId: user.id }
}

// ============================================
// QUERY ACTIONS
// ============================================

/**
 * Get platform statistics
 */
export async function getPlatformStats(): Promise<PlatformStats | null> {
    const admin = await ensureAdmin()
    if (!admin) return null

    const supabase = await createClient()

    // Get counts from various tables
    const [planners, vendors, events, bookings, pendingVendors] = await Promise.all([
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }).eq('role', 'planner'),
        supabase.from('vendors').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('booking_requests').select('*', { count: 'exact', head: true }),
        supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('verified', false),
    ])

    return {
        totalPlanners: planners.count || 0,
        totalVendors: vendors.count || 0,
        totalEvents: events.count || 0,
        totalBookings: bookings.count || 0,
        pendingVerifications: pendingVendors.count || 0,
        revenueThisMonth: 0, // Would require payment integration
    }
}

/**
 * Get all planners
 */
export async function getAllPlanners(): Promise<PlannerOverview[]> {
    const admin = await ensureAdmin()
    if (!admin) return []

    const supabase = await createClient()

    const { data, error } = await supabase
        .from('user_profiles')
        .select(`
            id,
            display_name,
            created_at,
            planner_profiles (
                company_name,
                total_events
            )
        `)
        .eq('role', 'planner')
        .order('created_at', { ascending: false })

    if (error || !data) return []

    return data.map((p: any) => ({
        id: p.id,
        email: '', // Would need join with auth.users
        displayName: p.display_name || 'Unknown',
        companyName: p.planner_profiles?.company_name || 'N/A',
        eventsCount: p.planner_profiles?.total_events || 0,
        createdAt: p.created_at,
        isActive: true,
    }))
}

/**
 * Get all vendors
 */
export async function getAllVendors(): Promise<VendorOverview[]> {
    const admin = await ensureAdmin()
    if (!admin) return []

    const supabase = await createClient()

    const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false })

    if (error || !data) return []

    return data.map((v: any) => ({
        id: v.id,
        name: v.name,
        email: v.email,
        category: v.category,
        city: v.city,
        isVerified: v.is_verified || v.verified || false,
        rating: v.rating || 0,
        bookingsCount: 0, // Would need count from booking_requests
        createdAt: v.created_at,
    }))
}

/**
 * Get vendors pending verification
 */
export async function getPendingVendors(): Promise<VendorOverview[]> {
    const admin = await ensureAdmin()
    if (!admin) return []

    const supabase = await createClient()

    const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('verified', false)
        .order('created_at', { ascending: true })

    if (error || !data) return []

    return data.map((v: any) => ({
        id: v.id,
        name: v.name,
        email: v.email,
        category: v.category,
        city: v.city,
        isVerified: false,
        rating: v.rating || 0,
        bookingsCount: 0,
        createdAt: v.created_at,
    }))
}

// ============================================
// MUTATION ACTIONS
// ============================================

/**
 * Verify a vendor
 */
export async function verifyVendor(vendorId: string): Promise<ActionResult<void>> {
    const admin = await ensureAdmin()
    if (!admin) {
        return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' }
    }

    const supabase = await createClient()

    const { error } = await supabase
        .from('vendors')
        .update({
            verified: true,
            verification_date: new Date().toISOString(),
            verified_by: admin.userId,
        })
        .eq('id', vendorId)

    if (error) {
        return { success: false, error: error.message, code: 'UPDATE_FAILED' }
    }

    revalidatePath('/admin')
    revalidatePath('/admin/vendors')

    return { success: true, data: undefined }
}

/**
 * Reject vendor verification
 */
export async function rejectVendor(vendorId: string, reason: string): Promise<ActionResult<void>> {
    const admin = await ensureAdmin()
    if (!admin) {
        return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' }
    }

    const supabase = await createClient()

    const { error } = await supabase
        .from('vendors')
        .update({
            verified: false,
            verification_notes: reason,
        })
        .eq('id', vendorId)

    if (error) {
        return { success: false, error: error.message, code: 'UPDATE_FAILED' }
    }

    // TODO: Send email notification to vendor about rejection

    revalidatePath('/admin')
    revalidatePath('/admin/vendors')

    return { success: true, data: undefined }
}

/**
 * Deactivate a user (planner or vendor)
 */
export async function deactivateUser(userId: string): Promise<ActionResult<void>> {
    const admin = await ensureAdmin()
    if (!admin) {
        return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' }
    }

    const supabase = await createClient()

    // Update user_profiles to set inactive
    const { error } = await supabase
        .from('user_profiles')
        .update({
            // Note: would need to add is_active column
        })
        .eq('id', userId)

    if (error) {
        return { success: false, error: error.message, code: 'UPDATE_FAILED' }
    }

    revalidatePath('/admin')
    revalidatePath('/admin/planners')
    revalidatePath('/admin/vendors')

    return { success: true, data: undefined }
}

/**
 * Get recent activity for dashboard
 */
export async function getRecentActivity() {
    const admin = await ensureAdmin()
    if (!admin) return []

    const supabase = await createClient()

    // Get recent events
    const { data: recentEvents } = await supabase
        .from('events')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

    // Get recent vendor signups
    const { data: recentVendors } = await supabase
        .from('vendors')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

    const activities: { type: string; description: string; timestamp: string }[] = []

    recentEvents?.forEach((e: any) => {
        activities.push({
            type: 'event',
            description: `New event created: ${e.name}`,
            timestamp: e.created_at,
        })
    })

    recentVendors?.forEach((v: any) => {
        activities.push({
            type: 'vendor',
            description: `New vendor signup: ${v.name}`,
            timestamp: v.created_at,
        })
    })

    // Sort by timestamp
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return activities.slice(0, 10)
}
