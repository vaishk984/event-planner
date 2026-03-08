'use server'

import { revalidatePath } from 'next/cache'
import { supabaseIntakeRepository } from '@/lib/repositories/supabase-intake-repository'
import { supabaseEventRepository } from '@/lib/repositories/supabase-event-repository'
import { getCurrentUser } from '@/actions/auth/login'
import type { Intake, Event, ActionResult } from '@/types/domain'

// ============================================
// QUERY ACTIONS
// ============================================

/**
 * Get all intakes
 */
export async function getIntakes(): Promise<Intake[]> {
    return supabaseIntakeRepository.findMany()
}

/**
 * Get pending intakes (not yet converted)
 */
export async function getPendingIntakes(): Promise<Intake[]> {
    return supabaseIntakeRepository.findPending()
}

/**
 * Get intake by ID
 */
export async function getIntake(id: string): Promise<Intake | null> {
    return supabaseIntakeRepository.findById(id)
}

/**
 * Get intake by access token
 */
export async function getIntakeByToken(token: string): Promise<Intake | null> {
    return supabaseIntakeRepository.findByToken(token)
}

// ============================================
// MUTATION ACTIONS
// ============================================

/**
 * Create a new intake
 */
export async function createIntake(data: Partial<Intake>): Promise<ActionResult<Intake>> {
    const user = await getCurrentUser()

    const intakeData = {
        ...data,
        plannerId: user?.id,
        createdBy: 'planner' as const,
        status: 'draft' as const,
        currentTab: 0,
        clientName: data.clientName || '',
        phone: data.phone || '',
        isDateFlexible: data.isDateFlexible || false,
        guestCount: data.guestCount || 100,
        budgetMin: data.budgetMin || 0,
        budgetMax: data.budgetMax || 0,
        personalVenue: data.personalVenue || {},
        food: data.food || {},
        decor: data.decor || {},
        entertainment: data.entertainment || {},
        photography: data.photography || {},
        services: data.services || {},
        likedVendors: data.likedVendors || [],
        specialRequests: data.specialRequests || '',
    }

    const result = await supabaseIntakeRepository.create(intakeData as any)

    if (result.success) {
        revalidatePath('/planner/events')
        revalidatePath('/planner/leads')
    }

    return result
}

/**
 * Update intake
 */
export async function updateIntake(id: string, data: Partial<Intake>): Promise<ActionResult<Intake>> {
    const result = await supabaseIntakeRepository.update(id, data)

    if (result.success) {
        revalidatePath('/planner/events')
        revalidatePath('/planner/leads')
    }

    return result
}

/**
 * Convert intake to event
 */
export async function convertIntakeToEvent(intakeId: string): Promise<ActionResult<Event>> {
    const user = await getCurrentUser()
    if (!user) {
        return { success: false, error: 'Not authenticated', code: 'UNAUTHORIZED' }
    }

    const intake = await supabaseIntakeRepository.findById(intakeId)
    if (!intake) {
        return { success: false, error: 'Intake not found', code: 'NOT_FOUND' }
    }

    // Map intake data to Event fields (match Event interface in types/domain.ts)
    const eventData = {
        plannerId: user.id,
        type: intake.eventType || 'wedding',
        name: `${intake.clientName}'s ${intake.eventType || 'Event'}`,
        date: intake.eventDate || new Date().toISOString().split('T')[0],
        status: 'planning' as const,

        // Required fields with defaults
        isDateFlexible: intake.isDateFlexible || false,
        city: intake.city || '',
        venueType: intake.venueType || ('showroom' as const),
        guestCount: intake.guestCount || 100,
        budgetMin: intake.budgetMin || 0,
        budgetMax: intake.budgetMax || 0,
        clientName: intake.clientName,
        clientPhone: intake.phone,

        // Optional fields
        clientEmail: intake.email,
        endDate: intake.eventEndDate,
        venueName: intake.personalVenue?.name,
        notes: intake.specialRequests,
        source: intake.source,
        submissionId: intake.id,
    }

    const eventResult = await supabaseEventRepository.create(eventData as any)

    if (eventResult.success && eventResult.data) {
        await supabaseIntakeRepository.markConverted(intakeId, eventResult.data.id)
        revalidatePath('/planner/events')
        revalidatePath('/planner/leads')
    }

    return eventResult
}

/**
 * Submit intake (client completed form)
 */
export async function submitIntake(id: string): Promise<ActionResult<Intake>> {
    const result = await supabaseIntakeRepository.update(id, {
        status: 'submitted',
        submittedAt: new Date().toISOString(),
    } as Partial<Intake>)

    if (result.success) {
        revalidatePath('/planner/events')
        revalidatePath('/planner/leads')
    }

    return result
}

/**
 * Delete intake
 */
export async function deleteIntake(id: string): Promise<ActionResult<void>> {
    const result = await supabaseIntakeRepository.delete(id)

    if (result.success) {
        revalidatePath('/planner/events')
        revalidatePath('/planner/leads')
    }

    return result
}

/**
 * Save client submission (from public portal)
 */
/**
 * Save client submission (from public portal or capture)
 */
export async function saveClientSubmission(data: Partial<Intake>): Promise<ActionResult<Intake>> {
    // 1. If token exists, try to update existing record
    if (data.token) {
        const existing = await supabaseIntakeRepository.findByToken(data.token)
        if (existing) {
            const updateData = {
                ...data,
                status: 'submitted' as const,
                submittedAt: new Date().toISOString(),
                // Preserve existing plannerId
            }
            // Remove ID if present in data
            delete (updateData as any).id

            const result = await supabaseIntakeRepository.update(existing.id, updateData)

            if (result.success) {
                revalidatePath('/planner/events')
                revalidatePath('/planner/leads')
            }
            return result
        }
    }

    // 2. If no token or not found, create new
    // Check if submitting user is a logged-in planner (e.g. Capture flow)
    const user = await getCurrentUser()

    // If user is logged in, use their ID. If not, it's a public lead (orphan until claimed?)
    // Prioritize explicitly passed plannerId (from trusted server component) over current session check
    const plannerId = data.plannerId || user?.id

    const intakeData = {
        ...data,
        plannerId: plannerId, // Assign to resolved planner ID
        createdBy: user ? 'planner' : 'client' as const,
        status: 'submitted' as const,
        submittedAt: new Date().toISOString(),
        // Ensure token is generated if not provided
        token: data.token || (supabaseIntakeRepository as any).generateAccessToken()
    }

    const result = await supabaseIntakeRepository.create(intakeData as any)

    if (result.success) {
        revalidatePath('/planner/events')
        revalidatePath('/planner/leads')
    }

    return result
}
