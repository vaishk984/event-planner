/**
 * Booking Service
 * 
 * Business logic for Booking operations.
 * Orchestrates the BookingRepository and applies validation.
 * 
 * Based on: ARCHITECTURE.md (Section 2.2 - Service Pattern)
 */

import { bookingRepository } from '@/lib/repositories/booking-repository'
import { BookingRequest } from '@/src/backend/entities/BookingRequest'
import { z } from 'zod'

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createBookingSchema = z.object({
    eventId: z.string().uuid(),
    vendorId: z.string().uuid(),
    serviceCategory: z.string().min(1, 'Category is required'),
    serviceDetails: z.string().optional().nullable(),
    status: z.enum([
        'draft', 'pending', 'quote_requested', 'quote_received',
        'quoted', 'negotiating', 'accepted', 'confirmed',
        'deposit_paid', 'completed', 'declined', 'cancelled'
    ]).optional().default('pending'),
    notes: z.string().optional().nullable(),
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>

export class BookingService {
    /**
     * Get all bookings for an event
     */
    async getEventBookings(eventId: string, plannerId: string) {
        return bookingRepository.findByEventAndPlanner(eventId, plannerId)
    }

    /**
     * Create a new booking request (assign vendor to event)
     */
    async createBooking(input: Record<string, unknown>, plannerId: string) {
        // Validate input
        const validation = createBookingSchema.safeParse(input)
        if (!validation.success) {
            return { error: validation.error.issues[0].message }
        }

        const validData = validation.data

        // Fetch event details — required for NOT NULL columns (event_name, event_date)
        const supabase = await (await import('@/lib/supabase/server')).createClient()
        const { data: event, error: eventError } = await supabase
            .from('events')
            .select('name, date, city, guest_count')
            .eq('id', validData.eventId)
            .single()

        if (eventError || !event) {
            return { error: 'Event not found' }
        }

        const result = await bookingRepository.create({
            event_id: validData.eventId,
            vendor_id: validData.vendorId,
            planner_id: plannerId,
            event_name: event.name || 'Untitled Event',
            event_date: event.date || new Date().toISOString().split('T')[0],
            city: event.city || null,
            venue: null,
            guest_count: event.guest_count || null,
            service: validData.serviceCategory,
            service_details: validData.serviceDetails || null,
            notes: validData.notes || null,
            status: validData.status,
            payment_schedule: '[]',
        })

        if (result.error) {
            return { error: result.error }
        }

        // Booking created successfully — logged for audit trail
        // TODO: Replace with structured logger when logger imports are unified
        return { success: true, data: result.data!.toJSON() }
    }

    /**
     * Update booking status
     */
    async updateBookingStatus(id: string, status: string, plannerId: string) {
        if (!id || !status) {
            return { error: 'Invalid parameters' }
        }

        const result = await bookingRepository.updateStatus(id, status, plannerId)

        if (result.error) {
            return { error: result.error }
        }

        return { success: true }
    }
}

// Export singleton instance
export const bookingService = new BookingService()
