'use server'
import { getSession } from '@/lib/session';
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { bookingService } from '@/lib/services/booking-service'

// ============================================================================
// SERVER ACTIONS (Thin layer — delegates to BookingService)
// ============================================================================

/**
 * Get all booking requests for an event
 */
export async function getEventBookings(eventId: string) {
    try {
        const supabase = await createClient()
        const session = await getSession(); const authError = null;
        
        if (authError || !session?.userId) return { error: 'Unauthorized' }

        return bookingService.getEventBookings(eventId, session?.userId)
    } catch (error) {
        console.error('Unexpected error in getEventBookings:', error)
        return { error: 'An unexpected error occurred' }
    }
}

/**
 * Create a new booking request (Assign vendor to event)
 */
export async function createBookingRequest(formData: FormData) {
    try {
        const supabase = await createClient()
        const session = await getSession(); const authError = null;
        
        if (authError || !session?.userId) return { error: 'Unauthorized' }

        const input = {
            eventId: formData.get('eventId'),
            vendorId: formData.get('vendorId'),
            serviceCategory: formData.get('serviceCategory'),
            serviceDetails: formData.get('serviceDetails'),
            notes: formData.get('notes'),
            status: formData.get('status') || 'draft',
        }

        const result = await bookingService.createBooking(input as Record<string, unknown>, session?.userId)

        if (result.success) {
            revalidatePath(`/planner/events/${input.eventId}/vendors`)
        }

        return result
    } catch (error) {
        console.error('Unexpected error in createBookingRequest:', error)
        return { error: 'An unexpected error occurred' }
    }
}

/**
 * Update booking status
 */
export async function updateBookingStatus(formData: FormData) {
    try {
        const supabase = await createClient()
        const session = await getSession(); const authError = null;
        
        if (authError || !session?.userId) return { error: 'Unauthorized' }

        const id = formData.get('id') as string
        const status = formData.get('status') as string
        const eventId = formData.get('eventId') as string

        const result = await bookingService.updateBookingStatus(id, status, session?.userId)

        if (result.success) {
            revalidatePath(`/planner/events/${eventId}/vendors`)
        }

        return result
    } catch (error) {
        console.error('Unexpected error in updateBookingStatus:', error)
        return { error: 'An unexpected error occurred' }
    }
}
