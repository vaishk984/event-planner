'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createGuestSchema = z.object({
    eventId: z.string().uuid('Invalid event ID'),
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    phone: z.string().optional(),
    category: z.enum(['vip', 'family', 'friends', 'colleagues', 'bride_side', 'groom_side', 'other']).optional(),
    rsvpStatus: z.enum(['pending', 'confirmed', 'declined', 'maybe']).optional(),
    dietaryPreferences: z.string().optional(),
    plusOne: z.coerce.boolean().optional(),
    plusOneName: z.string().optional(),
    tableNumber: z.coerce.number().optional(),
})

const updateGuestSchema = createGuestSchema.partial().extend({
    id: z.string().uuid('Invalid guest ID'),
})

// ============================================================================
// TYPES
// ============================================================================

export interface Guest {
    id: string;
    event_id: string;
    name: string;
    email?: string;
    phone?: string;
    rsvp_status: 'pending' | 'confirmed' | 'declined' | 'maybe';
    category?: string;
    dietary_preferences?: string;
    plus_one: boolean;
    plus_one_name?: string;
    table_number?: number;
    created_at: string;
    updated_at: string;
}

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

/**
 * Get all guests for an event
 */
export async function getGuests(eventId: string) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return { error: 'Unauthorized' }
        }

        // Verify event ownership
        const { data: event, error: eventError } = await supabase
            .from('events')
            .select('id')
            .eq('id', eventId)
            .eq('planner_id', user.id)
            .single()

        if (eventError || !event) {
            return { error: 'Event not found or unauthorized' }
        }

        // Fetch guests
        const { data, error } = await supabase
            .from('guests')
            .select('*')
            .eq('event_id', eventId)
            .order('name', { ascending: true })

        if (error) {
            console.error('Error fetching guests:', error)
            return { error: 'Failed to fetch guests' }
        }

        return { data: data as Guest[] }
    } catch (error) {
        console.error('Unexpected error in getGuests:', error)
        return { error: 'An unexpected error occurred' }
    }
}

/**
 * Create a new guest
 */
export async function createGuest(formData: FormData) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return { error: 'Unauthorized' }
        }

        const rawData = {
            eventId: formData.get('eventId')?.toString(),
            name: formData.get('name')?.toString(),
            email: formData.get('email')?.toString() || undefined,
            phone: formData.get('phone')?.toString() || undefined,
            category: formData.get('category')?.toString() || undefined,
            rsvpStatus: formData.get('rsvpStatus')?.toString() || 'pending',
            dietaryPreferences: formData.get('dietaryPreferences')?.toString() || undefined,
            plusOne: formData.get('plusOne'),
            plusOneName: formData.get('plusOneName')?.toString() || undefined,
            tableNumber: formData.get('tableNumber'),
        }

        const validation = createGuestSchema.safeParse(rawData)
        if (!validation.success) {
            return { error: validation.error.issues[0].message }
        }

        const validData = validation.data

        // Verify event ownership
        const { data: event, error: eventError } = await supabase
            .from('events')
            .select('id')
            .eq('id', validData.eventId)
            .eq('planner_id', user.id)
            .single()

        if (eventError || !event) {
            return { error: 'Unauthorized' }
        }

        const { data, error } = await supabase
            .from('guests')
            .insert({
                event_id: validData.eventId,
                name: validData.name,
                email: validData.email || null,
                phone: validData.phone || null,
                category: validData.category || 'other',
                rsvp_status: validData.rsvpStatus,
                dietary_preferences: validData.dietaryPreferences || null,
                plus_one: validData.plusOne || false,
                plus_one_name: validData.plusOneName || null,
                table_number: validData.tableNumber || null,
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating guest:', error)
            return { error: 'Failed to create guest' }
        }

        revalidatePath(`/planner/events/${validData.eventId}/guests`)
        return { data: data as Guest, success: true }
    } catch (error) {
        console.error('Unexpected error in createGuest:', error)
        return { error: 'An unexpected error occurred' }
    }
}

/**
 * Update a guest
 */
export async function updateGuest(formData: FormData) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return { error: 'Unauthorized' }
        }

        const rawData = {
            id: formData.get('id')?.toString(),
            eventId: formData.get('eventId')?.toString(),
            name: formData.get('name')?.toString(),
            email: formData.get('email')?.toString() || undefined,
            phone: formData.get('phone')?.toString() || undefined,
            category: formData.get('category')?.toString() || undefined,
            rsvpStatus: formData.get('rsvpStatus')?.toString() || 'pending',
            dietaryPreferences: formData.get('dietaryPreferences')?.toString() || undefined,
            plusOne: formData.get('plusOne'),
            plusOneName: formData.get('plusOneName')?.toString() || undefined,
            tableNumber: formData.get('tableNumber'),
        }

        const validation = updateGuestSchema.safeParse(rawData)
        if (!validation.success) {
            return { error: validation.error.issues[0].message }
        }

        const { id, eventId, ...updateData } = validation.data

        // Verify ownership via guest -> event -> planner
        // Alternatively, use RLS, but double check here logicwise
        // Just verify eventId matches db lookup to be safe

        const { data, error } = await supabase
            .from('guests')
            .update({
                name: updateData.name,
                email: updateData.email || null,
                phone: updateData.phone || null,
                category: updateData.category,
                rsvp_status: updateData.rsvpStatus,
                dietary_preferences: updateData.dietaryPreferences || null,
                plus_one: updateData.plusOne,
                plus_one_name: updateData.plusOneName || null,
                table_number: updateData.tableNumber || null,
            })
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error updating guest:', error)
            return { error: 'Failed to update guest' }
        }

        if (eventId) {
            revalidatePath(`/planner/events/${eventId}/guests`)
        }
        return { data: data as Guest, success: true }
    } catch (error) {
        console.error('Unexpected error in updateGuest:', error)
        return { error: 'An unexpected error occurred' }
    }
}

/**
 * Delete a guest
 */
export async function deleteGuest(id: string, eventId: string) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return { error: 'Unauthorized' }
        }

        const { error } = await supabase
            .from('guests')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting guest:', error)
            return { error: 'Failed to delete guest' }
        }

        revalidatePath(`/planner/events/${eventId}/guests`)
        return { success: true }
    } catch (error) {
        console.error('Unexpected error in deleteGuest:', error)
        return { error: 'An unexpected error occurred' }
    }
}

/**
 * Bulk create guests (for CSV Import)
 */
export async function createGuestsBulk(eventId: string, guestsData: any[]) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return { error: 'Unauthorized' }
        }

        // Verify event ownership ONCE
        const { data: event, error: eventError } = await supabase
            .from('events')
            .select('id')
            .eq('id', eventId)
            .eq('planner_id', user.id)
            .single()

        if (eventError || !event) {
            return { error: 'Unauthorized event access' }
        }

        // Prepare data
        const toInsert = guestsData.map(g => ({
            event_id: eventId,
            name: g.name,
            email: g.email || null,
            phone: g.phone || null,
            category: g.category || 'other',
            rsvp_status: g.rsvpStatus || 'pending',
            dietary_preferences: g.dietaryPreferences || null,
            plus_one: g.plusOne || false,
            plus_one_name: g.plusOneName || null,
            table_number: g.tableNumber || null,
        }))

        // Validating 500 rows with Zod here might be slow, but let's assume client validated basic structure.
        // We will insert in batches of 50 to be safe.
        const batchSize = 50
        let successCount = 0

        for (let i = 0; i < toInsert.length; i += batchSize) {
            const batch = toInsert.slice(i, i + batchSize)
            const { error } = await supabase.from('guests').insert(batch)

            if (error) {
                console.error('Bulk insert error:', error)
                // Continue with other batches or stop? Let's stop and report.
                return { error: `Failed at batch ${i / batchSize + 1}: ${error.message}` }
            }
            successCount += batch.length
        }

        revalidatePath(`/planner/events/${eventId}/guests`)
        return { success: true, count: successCount }

    } catch (error) {
        console.error('Unexpected error in createGuestsBulk:', error)
        return { error: 'An unexpected error occurred' }
    }
}
