'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createTimelineItemSchema = z.object({
    eventId: z.string().uuid(),
    functionId: z.string().uuid().optional().nullable(),
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    endTime: z.string().optional().nullable(),
    duration: z.number().optional(), // minutes
    location: z.string().optional(),
    vendorId: z.string().uuid().optional().nullable(),
    status: z.enum(['pending', 'in_progress', 'completed', 'delayed', 'cancelled']).optional().default('pending'),
})

const updateTimelineItemSchema = createTimelineItemSchema.partial().extend({
    id: z.string().uuid(),
})

const createFunctionSchema = z.object({
    eventId: z.string().uuid(),
    name: z.string().min(1, "Name is required"),
    type: z.enum([
        'mehendi', 'haldi', 'sangeet', 'wedding', 'reception',
        'cocktail', 'after_party', 'brunch', 'ceremony', 'conference', 'dinner', 'custom'
    ]),
    date: z.string().refine(val => !isNaN(Date.parse(val)), "Invalid date"),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    venueName: z.string().optional(),
})

// ============================================================================
// TIMELINE ITEMS ACTIONS
// ============================================================================

export async function getTimelineData(eventId: string) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) return { error: 'Unauthorized' }

        // Fetch Functions (for grouping)
        const functionsQuery = supabase
            .from('event_functions')
            .select('*')
            .eq('event_id', eventId)
            .order('date', { ascending: true })
            .order('start_time', { ascending: true })

        // Fetch Timeline Items
        const itemsQuery = supabase
            .from('timeline_items')
            .select(`
                *,
                vendors (company_name)
            `)
            .eq('event_id', eventId)
            .order('start_time', { ascending: true })
            .order('sort_order', { ascending: true })

        const [functionsRes, itemsRes] = await Promise.all([functionsQuery, itemsQuery])

        if (functionsRes.error) throw functionsRes.error
        if (itemsRes.error) throw itemsRes.error

        return {
            functions: functionsRes.data || [],
            items: itemsRes.data || []
        }
    } catch (error) {
        console.error('Error fetching timeline:', error)
        return { error: 'Failed to fetch timeline data' }
    }
}

export async function createTimelineItem(formData: FormData) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) return { error: 'Unauthorized' }

        const rawData = {
            eventId: formData.get('eventId'),
            functionId: formData.get('functionId') || null,
            title: formData.get('title'),
            description: formData.get('description'),
            startTime: formData.get('startTime'),
            endTime: formData.get('endTime') || null,
            location: formData.get('location'),
            vendorId: formData.get('vendorId') || null,
            status: formData.get('status') || 'pending',
        }

        const validation = createTimelineItemSchema.safeParse(rawData)
        if (!validation.success) {
            return { error: validation.error.issues[0].message }
        }
        const validData = validation.data

        const { data, error } = await supabase
            .from('timeline_items')
            .insert({
                event_id: validData.eventId,
                function_id: validData.functionId,
                title: validData.title,
                description: validData.description,
                start_time: validData.startTime,
                end_time: validData.endTime,
                location: validData.location,
                vendor_id: validData.vendorId,
                status: validData.status
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating item:', error)
            return { error: 'Failed to create timeline item' }
        }

        revalidatePath(`/planner/events/${validData.eventId}/timeline`)
        return { success: true, data }
    } catch (error) {
        console.error('Unexpected error:', error)
        return { error: 'An unexpected error occurred' }
    }
}

export async function deleteTimelineItem(id: string, eventId: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('timeline_items').delete().eq('id', id)

    if (error) return { error: 'Failed to delete' }

    revalidatePath(`/planner/events/${eventId}/timeline`)
    return { success: true }
}

export async function deleteEventFunction(id: string, eventId: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('event_functions').delete().eq('id', id)

    if (error) return { error: 'Failed to delete event function' }

    revalidatePath(`/planner/events/${eventId}/timeline`)
    return { success: true }
}

export async function updateTimelineItem(formData: FormData) {
    try {
        const supabase = await createClient()
        const id = formData.get('id') as string
        const eventId = formData.get('eventId') as string | null

        const updates: Record<string, any> = {}
        const title = formData.get('title')
        const description = formData.get('description')
        const startTime = formData.get('startTime')
        const endTime = formData.get('endTime')
        const location = formData.get('location')
        const status = formData.get('status')
        const vendorId = formData.get('vendorId')

        if (title !== null) updates.title = title
        if (description !== null) updates.description = description
        if (startTime !== null) updates.start_time = startTime
        if (endTime !== null) updates.end_time = endTime || null
        if (location !== null) updates.location = location
        if (status !== null) updates.status = status
        if (vendorId !== null) updates.vendor_id = vendorId || null

        const { error } = await supabase
            .from('timeline_items')
            .update(updates)
            .eq('id', id)

        if (error) throw error

        if (eventId) {
            revalidatePath(`/planner/events/${eventId}/timeline`)
        }
        return { success: true }
    } catch (error) {
        console.error(error)
        return { error: 'Failed to update item' }
    }
}

export async function reorderTimelineItems(items: { id: string, sort_order: number }[], eventId: string) {
    const supabase = await createClient()

    // Process in batch? Supabase doesn't support batch update easily unless RPC.
    // For MVP, loop.
    for (const item of items) {
        await supabase.from('timeline_items').update({ sort_order: item.sort_order }).eq('id', item.id)
    }

    revalidatePath(`/planner/events/${eventId}/timeline`)
    return { success: true }
}


// ============================================================================
// EVENT FUNCTION ACTIONS
// ============================================================================

export async function createEventFunction(formData: FormData) {
    try {
        const supabase = await createClient()
        const rawData = {
            eventId: formData.get('eventId'),
            name: formData.get('name'),
            type: formData.get('type'),
            date: formData.get('date'),
            startTime: formData.get('startTime'),
            venueName: formData.get('venueName'),
        }

        const validation = createFunctionSchema.safeParse(rawData)
        if (!validation.success) return { error: validation.error.issues[0].message }

        const validData = validation.data

        const { error } = await supabase.from('event_functions').insert({
            event_id: validData.eventId,
            name: validData.name,
            type: validData.type,
            date: validData.date,
            start_time: validData.startTime || '00:00',
            venue_name: validData.venueName
        })

        if (error) throw error

        revalidatePath(`/planner/events/${validData.eventId}/timeline`)
        return { success: true }
    } catch (error) {
        console.error(error)
        return { error: 'Failed to create function' }
    }
}
