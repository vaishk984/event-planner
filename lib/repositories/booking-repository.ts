/**
 * Booking Repository
 * 
 * Data access layer for BookingRequest entity.
 * Uses Supabase directly (not SupabaseBaseRepository) because
 * BookingRequest uses its own Entity class with fromRow/toRow.
 */

import { createClient } from '@/lib/supabase/server'
import { BookingRequest, type BookingRequestRow } from '@/src/backend/entities/BookingRequest'

export class BookingRepository {
    private tableName = 'booking_requests'

    /**
     * Find all bookings for an event by a specific planner
     */
    async findByEventAndPlanner(eventId: string, plannerId: string): Promise<{ data: any[] | null; error: string | null }> {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from(this.tableName)
            .select(`
                *,
                vendors (
                    id, company_name, category, contact_name, email, phone, location
                )
            `)
            .eq('event_id', eventId)
            .eq('planner_id', plannerId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching bookings:', error)
            return { data: null, error: 'Failed to fetch bookings' }
        }

        return { data, error: null }
    }

    /**
     * Create a new booking request
     */
    async create(insertData: {
        event_id: string
        vendor_id: string
        planner_id: string
        event_name: string
        event_date: string
        city?: string | null
        venue?: string | null
        guest_count?: number | null
        service: string
        service_details?: string | null
        notes?: string | null
        status: string
        payment_schedule: string
    }): Promise<{ data: BookingRequest | null; error: string | null }> {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from(this.tableName)
            .insert(insertData)
            .select()
            .single()

        if (error) {
            console.error('❌ Error creating booking request:', error)
            return { data: null, error: 'Failed to assign vendor: ' + error.message }
        }

        return { data: BookingRequest.fromRow(data), error: null }
    }

    /**
     * Update booking status by ID and planner
     */
    async updateStatus(id: string, status: string, plannerId: string): Promise<{ error: string | null }> {
        const supabase = await createClient()

        const { error } = await supabase
            .from(this.tableName)
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('planner_id', plannerId)

        if (error) {
            console.error('Error updating status:', error)
            return { error: 'Failed to update status' }
        }

        return { error: null }
    }
}

// Export singleton instance
export const bookingRepository = new BookingRepository()
