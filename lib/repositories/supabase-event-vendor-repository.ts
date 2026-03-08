/**
 * Supabase Event Vendor Repository
 * 
 * Production-ready event vendor repository backed by Supabase.
 * Replaces localStorage-based EventVendorRepository.
 */

import { SupabaseBaseRepository } from './supabase-base-repository'
import type { EventVendor, VendorCategory, ActionResult } from '@/types/domain'

class SupabaseEventVendorRepositoryClass extends SupabaseBaseRepository<EventVendor> {
    protected tableName = 'vendor_assignments' // Mapping to actual DB table
    protected entityName = 'event-vendor'

    /**
     * Find all vendors for an event
     */
    async findByEventId(eventId: string): Promise<EventVendor[]> {
        const supabase = await this.getClient()
        console.log(`[Repository] Finding vendors for event: ${eventId}`)

        // 1. Fetch from legacy vendor_assignments
        const { data: assignmentData, error: assignmentError } = await supabase
            .from(this.tableName)
            .select(`
                *,
                vendor:vendor_id (
                    company_name,
                    category,
                    phone,
                    rating
                )
            `)
            .eq('event_id', eventId)

        if (assignmentError) {
            console.error('Error fetching event vendors:', assignmentError)
            return []
        }
        console.log(`[Repository] Found ${assignmentData?.length || 0} assignments (Design Tab)`)

        // 2. Fetch from new booking_requests (Assignments via Vendors tab)
        const { data: bookingData, error: bookingError } = await supabase
            .from('booking_requests')
            .select(`
                id,
                vendor_id,
                service,
                quoted_amount,
                budget,
                agreed_amount,
                status,
                created_at,
                vendors (
                    company_name,
                    category,
                    phone,
                    rating
                )
            `)
            .eq('event_id', eventId)
            .in('status', ['accepted', 'confirmed', 'completed', 'pending', 'draft', 'quote_requested'])

        if (bookingError) {
            console.error('Error fetching booking requests:', bookingError)
        }
        console.log(`[Repository] Found ${bookingData?.length || 0} booking requests (Vendor Tab)`)

        // 3. Map assignments to EventVendor
        const assignments: EventVendor[] = assignmentData.map((row: any) => {
            const base = this.fromDb(row) as any
            return {
                ...base,
                vendorName: row.vendor?.company_name || 'Unknown Vendor',
                vendorPhone: row.vendor?.phone,
                vendorCategory: row.vendor?.category || base.category,
                vendorRating: row.vendor?.rating || 0
            }
        })

        // 4. Map bookings to EventVendor
        const bookings: EventVendor[] = (bookingData || []).map((row: any) => ({
            id: row.id,
            eventId: eventId,
            vendorId: row.vendor_id,
            category: row.service,
            status: row.status === 'accepted' || row.status === 'confirmed' ? 'confirmed' : 'contacted',
            price: row.agreed_amount || row.quoted_amount || row.budget || 0,
            agreedAmount: row.agreed_amount || row.quoted_amount || row.budget || 0,
            addedAt: row.created_at,
            vendorName: row.vendors?.company_name || 'Unknown Vendor',
            vendorCategory: row.vendors?.category || row.service,
            vendorPhone: row.vendors?.phone,
            vendorRating: row.vendors?.rating || 0
        }))

        // 5. Merge lists (prioritize bookings if duplicate vendor)
        const vendorMap = new Map<string, EventVendor>()

        // Add assignments first
        assignments.forEach(v => vendorMap.set(v.vendorId, v))

        // Add bookings (overwriting if exists, assumming booking is more recent source of truth for these stats)
        bookings.forEach(v => vendorMap.set(v.vendorId, v))

        console.log(`[Repository] Merged total unique vendors: ${vendorMap.size}`)

        return Array.from(vendorMap.values())
    }

    /**
     * Find all events for a vendor
     */
    async findByVendorId(vendorId: string): Promise<EventVendor[]> {
        return this.findMany({ vendorId } as Partial<EventVendor>)
    }

    /**
     * Check if vendor is already added to event
     */
    async isVendorInEvent(eventId: string, vendorId: string): Promise<boolean> {
        const supabase = await this.getClient()

        const { count, error } = await supabase
            .from(this.tableName)
            .select('*', { count: 'exact', head: true })
            .eq('event_id', eventId)
            .eq('vendor_id', vendorId)

        return !error && (count || 0) > 0
    }

    /**
     * Add vendor to event plan
     */
    async addVendorToEvent(
        eventId: string,
        vendorId: string,
        category: VendorCategory,
        price?: number,
        vendorName?: string,
        vendorPhone?: string
    ): Promise<ActionResult<EventVendor>> {
        // Check if already exists
        const exists = await this.isVendorInEvent(eventId, vendorId)
        if (exists) {
            return { success: false, error: 'Vendor already in event plan', code: 'CONFLICT' }
        }

        const eventVendor = {
            eventId,
            vendorId,
            vendorCategory: category, // Map to correct column vendor_category
            vendorName: vendorName || 'Unknown Vendor', // Map to vendor_name (required)
            vendorPhone,
            status: 'requested', // 'shortlisted' not allowed by DB constraint. using 'requested'
            agreedAmount: price || 0, // Map price to agreed_amount
            // created_at handles timestamp
        }

        return this.create(eventVendor as any)
    }

    /**
     * Update vendor status in event
     */
    async updateStatus(
        id: string,
        status: EventVendor['status']
    ): Promise<ActionResult<EventVendor>> {
        return this.update(id, { status } as Partial<EventVendor>)
    }

    /**
     * Remove vendor from event
     */
    async removeFromEvent(eventId: string, vendorId: string): Promise<ActionResult<void>> {
        const supabase = await this.getClient()

        // Delete from vendor_assignments
        const { error: assignmentError } = await supabase
            .from(this.tableName)
            .delete()
            .eq('event_id', eventId)
            .eq('vendor_id', vendorId)

        // Also delete from booking_requests (vendors added via Vendors tab)
        const { error: bookingError } = await supabase
            .from('booking_requests')
            .delete()
            .eq('event_id', eventId)
            .eq('vendor_id', vendorId)

        if (assignmentError && bookingError) {
            return { success: false, error: 'Failed to remove vendor', code: 'DELETE_FAILED' }
        }

        return { success: true, data: undefined }
    }
}

// Export singleton instance
export const supabaseEventVendorRepository = new SupabaseEventVendorRepositoryClass()
