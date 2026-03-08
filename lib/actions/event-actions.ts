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

// ============================================
// QUERY ACTIONS
// ============================================

/**
 * Get all events
 */
export async function getEvents(): Promise<Event[]> {
    return eventService.getEvents();
}

/**
 * Get event by ID
 */
export async function getEvent(id: string): Promise<Event | null> {
    console.log('[getEvent] Looking up event ID:', id);
    const result = await eventService.getEvent(id);
    console.log('[getEvent] Result:', result ? `Found: ${result.name}` : 'NOT FOUND');
    return result;
}

/**
 * Get events by status
 */
export async function getEventsByStatus(status: EventStatus): Promise<Event[]> {
    return eventService.getEventsByStatus(status);
}

/**
 * Get upcoming events
 */
export async function getUpcomingEvents(): Promise<Event[]> {
    return eventService.getUpcomingEvents();
}

/**
 * Get today's events
 */
export async function getTodayEvents(): Promise<Event[]> {
    return eventService.getTodayEvents();
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats() {
    return eventService.getDashboardStats();
}

// ============================================
// MUTATION ACTIONS
// ============================================

/**
 * Convert submission to event
 */
export async function convertSubmissionToEvent(
    submissionId: string,
    plannerId: string = 'default-planner' // TODO: Get from auth
): Promise<ActionResult<Event>> {
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
    plannerId: string = 'default-planner' // TODO: Get from auth
): Promise<ActionResult<Event>> {
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
    const result = await eventService.updateEvent(id, data);

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
    const result = await eventService.updateEventStatus(id, status);

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
    const result = await eventService.sendProposal(eventId);

    if (result.success) {
        revalidatePath(`/planner/events/${eventId}`);
    }

    return result;
}

/**
 * Approve event (client action)
 */
export async function approveEvent(eventId: string): Promise<ActionResult<Event>> {
    const result = await eventService.approveEvent(eventId);

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
    const result = await eventService.archiveEvent(eventId);

    if (result.success) {
        revalidatePath('/planner/events');
    }

    return result;
}

/**
 * Delete event
 */
export async function deleteEvent(id: string): Promise<ActionResult<void>> {
    const result = await eventService.deleteEvent(id);

    if (result.success) {
        revalidatePath('/planner/events');
    }

    return result;
}
