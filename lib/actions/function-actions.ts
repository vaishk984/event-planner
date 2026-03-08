'use server'

import { revalidatePath } from 'next/cache'
import { supabaseFunctionRepository } from '@/lib/repositories/supabase-function-repository'
import { getCurrentUser } from '@/actions/auth/login'
import type { EventFunction, FunctionStatus, ActionResult } from '@/types/domain'

// ============================================
// QUERY ACTIONS
// ============================================

/**
 * Get functions for an event
 */
export async function getEventFunctions(eventId: string): Promise<EventFunction[]> {
    return supabaseFunctionRepository.findByEventId(eventId)
}

/**
 * Get function by ID
 */
export async function getFunction(id: string): Promise<EventFunction | null> {
    return supabaseFunctionRepository.findById(id)
}

/**
 * Get functions for a specific day
 */
export async function getFunctionsByDay(eventId: string, day: number): Promise<EventFunction[]> {
    return supabaseFunctionRepository.findByEventAndDay(eventId, day)
}

// ============================================
// MUTATION ACTIONS
// ============================================

/**
 * Create a new function
 */
export async function createFunction(eventId: string, data: Partial<EventFunction>): Promise<ActionResult<EventFunction>> {
    const user = await getCurrentUser()
    if (!user) {
        return { success: false, error: 'Not authenticated', code: 'UNAUTHORIZED' }
    }

    // Get existing functions to determine day number
    const existing = await supabaseFunctionRepository.findByEventId(eventId)
    const maxDay = existing.reduce((max, f) => Math.max(max, f.day), 0)

    const functionData = {
        eventId,
        name: data.name || 'New Function',
        type: data.type || 'custom',
        day: data.day ?? maxDay + 1,
        date: data.date || new Date().toISOString(),
        startTime: data.startTime,
        endTime: data.endTime,
        venueName: data.venueName,
        venueAddress: data.venueAddress,
        venueType: data.venueType,
        guestCount: data.guestCount || 100,
        budget: data.budget || 0,
        status: 'planning' as FunctionStatus,
        notes: data.notes,
    }

    const result = await supabaseFunctionRepository.create(functionData as any)

    if (result.success) {
        revalidatePath(`/planner/events/${eventId}`)
        revalidatePath(`/planner/events/${eventId}/functions`)
    }

    return result
}

/**
 * Update function
 */
export async function updateFunction(id: string, data: Partial<EventFunction>): Promise<ActionResult<EventFunction>> {
    const func = await supabaseFunctionRepository.findById(id)
    if (!func) {
        return { success: false, error: 'Function not found', code: 'NOT_FOUND' }
    }

    const result = await supabaseFunctionRepository.update(id, data)

    if (result.success) {
        revalidatePath(`/planner/events/${func.eventId}`)
        revalidatePath(`/planner/events/${func.eventId}/functions`)
    }

    return result
}

/**
 * Update function status
 */
export async function updateFunctionStatus(id: string, status: FunctionStatus): Promise<ActionResult<EventFunction>> {
    const func = await supabaseFunctionRepository.findById(id)
    if (!func) {
        return { success: false, error: 'Function not found', code: 'NOT_FOUND' }
    }

    const result = await supabaseFunctionRepository.updateStatus(id, status)

    if (result.success) {
        revalidatePath(`/planner/events/${func.eventId}`)
        revalidatePath(`/planner/events/${func.eventId}/functions`)
    }

    return result
}

/**
 * Delete function
 */
export async function deleteFunction(id: string): Promise<ActionResult<void>> {
    const func = await supabaseFunctionRepository.findById(id)
    if (!func) {
        return { success: false, error: 'Function not found', code: 'NOT_FOUND' }
    }

    const result = await supabaseFunctionRepository.delete(id)

    if (result.success) {
        revalidatePath(`/planner/events/${func.eventId}`)
        revalidatePath(`/planner/events/${func.eventId}/functions`)
    }

    return result
}

/**
 * Duplicate function
 */
export async function duplicateFunction(id: string): Promise<ActionResult<EventFunction>> {
    const func = await supabaseFunctionRepository.findById(id)
    if (!func) {
        return { success: false, error: 'Function not found', code: 'NOT_FOUND' }
    }

    const result = await supabaseFunctionRepository.duplicate(id)

    if (result.success) {
        revalidatePath(`/planner/events/${func.eventId}`)
        revalidatePath(`/planner/events/${func.eventId}/functions`)
    }

    return result
}

/**
 * Apply function template
 */
export async function applyFunctionTemplate(
    eventId: string,
    templateType: 'wedding' | 'engagement' | 'birthday'
): Promise<ActionResult<EventFunction[]>> {
    const templates: Record<string, Partial<EventFunction>[]> = {
        wedding: [
            { name: 'Mehendi Ceremony', type: 'mehendi', day: 1 },
            { name: 'Haldi Ceremony', type: 'haldi', day: 2 },
            { name: 'Sangeet Night', type: 'sangeet', day: 2 },
            { name: 'Wedding Ceremony', type: 'wedding', day: 3 },
            { name: 'Reception', type: 'reception', day: 4 },
        ],
        engagement: [
            { name: 'Ring Ceremony', type: 'wedding', day: 1 },
            { name: 'Reception', type: 'reception', day: 1 },
        ],
        birthday: [
            { name: 'Birthday Party', type: 'custom', day: 1 },
        ],
    }

    const templateFunctions = templates[templateType] || []
    const createdFunctions: EventFunction[] = []

    for (const template of templateFunctions) {
        const result = await createFunction(eventId, {
            ...template,
            guestCount: 100,
            budget: 0,
        })
        if (result.success && result.data) {
            createdFunctions.push(result.data)
        }
    }

    revalidatePath(`/planner/events/${eventId}`)
    revalidatePath(`/planner/events/${eventId}/functions`)

    return { success: true, data: createdFunctions }
}
