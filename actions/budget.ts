'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// ============================================================================
// SCHEMAS
// ============================================================================

const createBudgetItemSchema = z.object({
    eventId: z.string().uuid(),
    category: z.enum([
        'venue', 'catering', 'decoration', 'photography', 'entertainment',
        'attire', 'makeup', 'transport', 'invitations', 'gifts', 'miscellaneous'
    ]),
    description: z.string().min(1, "Description is required"),
    estimatedAmount: z.coerce.number().min(0),
    actualAmount: z.coerce.number().optional().nullable(),
    paidAmount: z.coerce.number().optional().nullable(),
    notes: z.string().optional(),
    vendorId: z.string().uuid().optional().nullable(),
})

const updateBudgetItemSchema = createBudgetItemSchema.partial().extend({
    id: z.string().uuid(),
})

// ============================================================================
// ACTIONS
// ============================================================================

export async function getBudgetOverview(eventId: string) {
    const supabase = await createClient()

    // Fetch budget items AND the event's total budget ceiling in parallel
    const [itemsResult, eventResult] = await Promise.all([
        supabase.from('budget_items').select('*').eq('event_id', eventId),
        supabase.from('events').select('budget, title, name').eq('id', eventId).single()
    ])

    if (itemsResult.error) {
        console.error('Error fetching budget:', itemsResult.error)
        return { error: 'Failed to fetch budget data' }
    }

    const items = itemsResult.data || []
    const eventBudget = Number(eventResult.data?.budget || 0)

    const overview = items.reduce((acc, item) => {
        acc.totalBudgeted += Number(item.estimated_amount) || 0
        acc.totalInvoiced += Number(item.actual_amount) || 0
        acc.totalPaid += Number(item.paid_amount) || 0
        return acc
    }, {
        totalBudgeted: 0,   // Sum of estimated amounts across all items
        totalInvoiced: 0,   // Sum of actual/invoiced amounts
        totalPaid: 0,       // Sum of amounts physically paid
        eventBudget,        // Master ceiling from the event record
    })

    return { items, overview }
}

export async function createBudgetItem(formData: FormData) {
    try {
        const supabase = await createClient()

        const rawData = {
            eventId: formData.get('eventId'),
            category: formData.get('category'),
            description: formData.get('description'),
            estimatedAmount: formData.get('estimatedAmount'),
            actualAmount: formData.get('actualAmount'),
            paidAmount: formData.get('paidAmount'),
            notes: formData.get('notes'),
            vendorId: formData.get('vendorId') || null,
        }

        const validation = createBudgetItemSchema.safeParse(rawData)
        if (!validation.success) {
            return { error: validation.error.issues[0].message }
        }
        const validData = validation.data

        const { error } = await supabase.from('budget_items').insert({
            event_id: validData.eventId,
            category: validData.category,
            description: validData.description,
            estimated_amount: validData.estimatedAmount,
            actual_amount: validData.actualAmount || 0,
            paid_amount: validData.paidAmount || 0,
            notes: validData.notes,
            vendor_id: validData.vendorId
        })

        if (error) throw error

        revalidatePath(`/planner/events/${validData.eventId}/budget`)
        return { success: true }
    } catch (error) {
        console.error('Error creating budget item:', error)
        return { error: 'Failed to create item' }
    }
}

export async function updateBudgetItem(formData: FormData) {
    try {
        const supabase = await createClient()

        const rawData = {
            id: formData.get('id'),
            estimatedAmount: formData.get('estimatedAmount'),
            actualAmount: formData.get('actualAmount'),
            paidAmount: formData.get('paidAmount'),
            notes: formData.get('notes'),
        }

        // We allow partial updates, but validate amounts if present
        // Simplified for MVP: Just update what's passed
        const updates: any = {}
        if (rawData.estimatedAmount) updates.estimated_amount = Number(rawData.estimatedAmount)
        if (rawData.actualAmount) updates.actual_amount = Number(rawData.actualAmount)
        if (rawData.paidAmount) updates.paid_amount = Number(rawData.paidAmount)
        if (rawData.notes) updates.notes = rawData.notes

        const { error } = await supabase
            .from('budget_items')
            .update(updates)
            .eq('id', rawData.id)

        if (error) throw error

        // Hacky revalidate - normally we need eventId
        // Assuming client side refresh or parent passes eventId to revalidate
        // Returning success lets client router.refresh()
        return { success: true }
    } catch (error) {
        console.error('Error updating budget item:', error)
        return { error: 'Failed to update item' }
    }
}

export async function deleteBudgetItem(id: string, eventId: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('budget_items').delete().eq('id', id)

    if (error) return { error: 'Failed to delete' }

    revalidatePath(`/planner/events/${eventId}/budget`)
    return { success: true }
}
