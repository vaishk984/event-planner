/**
 * Event Actions (Server Actions)
 * 
 * Server-side actions for event operations.
 * These are the entry points for UI components.
 * 
 * Based on: docs/ARCHITECTURE.md (Section 3.2)
 */

'use server'

import { eventService } from '@/lib/services/event-service';
import type { Event, EventStatus, ActionResult } from '@/types/domain';
import { revalidatePath } from 'next/cache';
import { getUserId } from '@/lib/session';

async function getPlannerId(): Promise<string | null> {
    return getUserId();
}

// ============================================
// QUERY ACTIONS
// ============================================

/**
 * Get all events
 */
export async function getEvents(): Promise<Event[]> {
    const plannerId = await getPlannerId();
    if (!plannerId) {
        return [];
    }

    return eventService.getEvents(plannerId);
}

/**
 * Get event by ID
 */
export async function getEvent(id: string): Promise<Event | null> {
    const plannerId = await getPlannerId();
    if (!plannerId) {
        return null;
    }

    return eventService.getEvent(id, plannerId);
}

/**
 * Get events by status
 */
export async function getEventsByStatus(status: EventStatus): Promise<Event[]> {
    const plannerId = await getPlannerId();
    if (!plannerId) {
        return [];
    }

    return eventService.getEventsByStatus(status, plannerId);
}

/**
 * Get upcoming events
 */
export async function getUpcomingEvents(): Promise<Event[]> {
    const plannerId = await getPlannerId();
    if (!plannerId) {
        return [];
    }

    return eventService.getUpcomingEvents(plannerId);
}

/**
 * Get today's events
 */
export async function getTodayEvents(): Promise<Event[]> {
    const plannerId = await getPlannerId();
    if (!plannerId) {
        return [];
    }

    return eventService.getTodayEvents(plannerId);
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats() {
    const plannerId = await getPlannerId();
    if (!plannerId) {
        return {
            total: 0,
            byStatus: {
                submission: 0,
                draft: 0,
                planning: 0,
                proposed: 0,
                approved: 0,
                live: 0,
                completed: 0,
                archived: 0,
            },
            upcomingCount: 0,
            todayCount: 0,
        };
    }

    return eventService.getDashboardStats(plannerId);
}

// ============================================
// MUTATION ACTIONS
// ============================================

/**
 * Convert submission to event
 */
export async function convertSubmissionToEvent(
    submissionId: string,
): Promise<ActionResult<Event>> {
    const plannerId = await getPlannerId();
    if (!plannerId) {
        return { success: false, error: 'Not authenticated', code: 'UNAUTHORIZED' };
    }

    const result = await eventService.convertSubmissionToEvent(submissionId, plannerId);

    if (result.success) {
        revalidatePath('/planner/events');
        revalidatePath('/planner');
    }

    return result;
}

/**
 * Create new event
 */
export async function createEvent(
    data: Partial<Event>,
): Promise<ActionResult<Event>> {
    const plannerId = await getPlannerId();
    if (!plannerId) {
        return { success: false, error: 'Not authenticated', code: 'UNAUTHORIZED' };
    }

    const result = await eventService.createEvent(data, plannerId);

    if (result.success) {
        revalidatePath('/planner/events');
        revalidatePath('/planner');
    }

    return result;
}

/**
 * Update event
 */
export async function updateEvent(
    id: string,
    data: Partial<Event>
): Promise<ActionResult<Event>> {
    const plannerId = await getPlannerId();
    if (!plannerId) {
        return { success: false, error: 'Not authenticated', code: 'UNAUTHORIZED' };
    }

    const result = await eventService.updateEvent(id, data, plannerId);

    if (result.success) {
        revalidatePath(`/planner/events/${id}`);
        revalidatePath('/planner/events');
    }

    return result;
}

/**
 * Update event status
 */
export async function updateEventStatus(
    id: string,
    status: EventStatus
): Promise<ActionResult<Event>> {
    const plannerId = await getPlannerId();
    if (!plannerId) {
        return { success: false, error: 'Not authenticated', code: 'UNAUTHORIZED' };
    }

    const result = await eventService.updateEventStatus(id, status, plannerId);

    if (result.success) {
        revalidatePath(`/planner/events/${id}`);
        revalidatePath('/planner/events');
        revalidatePath('/planner');
    }

    return result;
}

/**
 * Send proposal to client
 */
export async function sendProposal(eventId: string): Promise<ActionResult<Event>> {
    const plannerId = await getPlannerId();
    if (!plannerId) {
        return { success: false, error: 'Not authenticated', code: 'UNAUTHORIZED' };
    }

    const result = await eventService.sendProposal(eventId, plannerId);

    if (result.success) {
        revalidatePath(`/planner/events/${eventId}`);
    }

    return result;
}

/**
 * Approve event (client action)
 */
export async function approveEvent(eventId: string): Promise<ActionResult<Event>> {
    const plannerId = await getPlannerId();
    if (!plannerId) {
        return { success: false, error: 'Not authenticated', code: 'UNAUTHORIZED' };
    }

    const result = await eventService.approveEvent(eventId, plannerId);

    if (result.success) {
        revalidatePath(`/planner/events/${eventId}`);
        revalidatePath('/planner/events');
    }

    return result;
}

/**
 * Archive event
 */
export async function archiveEvent(eventId: string): Promise<ActionResult<Event>> {
    const plannerId = await getPlannerId();
    if (!plannerId) {
        return { success: false, error: 'Not authenticated', code: 'UNAUTHORIZED' };
    }

    const result = await eventService.archiveEvent(eventId, plannerId);

    if (result.success) {
        revalidatePath('/planner/events');
    }

    return result;
}

/**
 * Delete event
 */
export async function deleteEvent(id: string): Promise<ActionResult<void>> {
    const plannerId = await getPlannerId();
    if (!plannerId) {
        return { success: false, error: 'Not authenticated', code: 'UNAUTHORIZED' };
    }

    const result = await eventService.deleteEvent(id, plannerId);

    if (result.success) {
        revalidatePath('/planner/events');
    }

    return result;
}
