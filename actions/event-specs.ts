'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface SpecItemData {
    id: string
    name: string
    quantity: number
    unit: string
    unitPrice?: number
    notes?: string
}

export interface CategorySpecData {
    category_id: string
    category_name: string
    category_color: string
    vendor_name: string
    items: SpecItemData[]
}

/**
 * Load saved specs for an event. Returns null if none saved yet (use template).
 */
export async function getEventSpecs(eventId: string): Promise<{ data: CategorySpecData[] | null; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: 'Unauthorized' }

    const { data, error } = await supabase
        .from('event_specs')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching event specs:', error)
        return { data: null, error: error.message }
    }

    if (!data || data.length === 0) {
        return { data: null } // No saved specs — use template
    }

    return {
        data: data.map(row => ({
            category_id: row.category_id,
            category_name: row.category_name,
            category_color: row.category_color,
            vendor_name: row.vendor_name,
            items: (row.items as SpecItemData[]) || [],
        }))
    }
}

/**
 * Save all specs for an event (upsert by category).
 */
export async function saveEventSpecs(eventId: string, categories: CategorySpecData[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Upsert each category
    const rows = categories.map(cat => ({
        event_id: eventId,
        category_id: cat.category_id,
        category_name: cat.category_name,
        category_color: cat.category_color,
        vendor_name: cat.vendor_name,
        items: cat.items,
        updated_at: new Date().toISOString(),
    }))

    const { error } = await supabase
        .from('event_specs')
        .upsert(rows, { onConflict: 'event_id,category_id' })

    if (error) {
        console.error('Error saving event specs:', error)
        return { error: error.message }
    }

    revalidatePath(`/planner/events/${eventId}/specs`)
    return { success: true }
}
