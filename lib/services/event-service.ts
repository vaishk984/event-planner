/**
 * Event Service
 * 
 * Business logic for Event operations.
 * Orchestrates repositories and applies domain rules.
 * 
 * Based on: docs/ARCHITECTURE.md (Section 2.2)
 */

import { supabaseEventRepository as eventRepository } from '@/lib/repositories/supabase-event-repository';
import { submissionRepository } from '@/lib/repositories/submission-repository';
import {
    EventValidation,
    createEventFromSubmission,
    canTransitionTo,
    getEventStatusInfo
} from '@/lib/domain/event';
import type { Event, EventStatus, ClientSubmission, ActionResult } from '@/types/domain';

export class EventService {
    // ============================================
    // QUERY OPERATIONS
    // ============================================

    /**
     * Get all events
     */
    async getEvents(): Promise<Event[]> {
        return eventRepository.findMany();
    }

    /**
     * Get event by ID
     */
    async getEvent(id: string): Promise<Event | null> {
        return eventRepository.findById(id);
    }

    /**
     * Get events by status
     */
    async getEventsByStatus(status: EventStatus): Promise<Event[]> {
        return eventRepository.findByStatus(status);
    }

    /**
     * Get upcoming events
     */
    async getUpcomingEvents(): Promise<Event[]> {
        return eventRepository.findUpcoming();
    }

    /**
     * Get today's events
     */
    async getTodayEvents(): Promise<Event[]> {
        return eventRepository.findToday();
    }

    /**
     * Get dashboard stats
     */
    async getDashboardStats(): Promise<{
        total: number;
        byStatus: Record<EventStatus, number>;
        upcomingCount: number;
        todayCount: number;
    }> {
        const [all, statusCounts, upcoming, today] = await Promise.all([
            eventRepository.findMany(),
            eventRepository.getStatusCounts(),
            eventRepository.findUpcoming(),
            eventRepository.findToday(),
        ]);

        return {
            total: all.length,
            byStatus: statusCounts,
            upcomingCount: upcoming.length,
            todayCount: today.length,
        };
    }

    // ============================================
    // MUTATION OPERATIONS
    // ============================================

    /**
     * Convert a client submission to an event
     */
    async convertSubmissionToEvent(
        submissionId: string,
        plannerId: string
    ): Promise<ActionResult<Event>> {
        // 1. Get submission
        const submission = await submissionRepository.findById(submissionId);
        if (!submission) {
            return { success: false, error: 'Submission not found', code: 'NOT_FOUND' };
        }

        // 2. Check if already converted
        if (submission.status === 'converted') {
            return { success: false, error: 'Submission already converted', code: 'CONFLICT' };
        }

        // 3. Create event data from submission
        const eventData = createEventFromSubmission(submission, plannerId);

        // 4. Validate event data
        const validation = EventValidation.validate(eventData);
        if (!validation.valid) {
            return {
                success: false,
                error: validation.errors.join(', '),
                code: 'VALIDATION_ERROR'
            };
        }

        // 5. Create event
        const eventResult = await eventRepository.create(eventData);
        if (!eventResult.success) {
            return eventResult;
        }

        // 6. Mark submission as converted
        await submissionRepository.markAsConverted(submissionId, eventResult.data.id);

        return eventResult;
    }

    /**
     * Create a new event manually
     */
    async createEvent(data: Partial<Event>, plannerId: string): Promise<ActionResult<Event>> {
        const eventData = {
            ...data,
            plannerId,
            status: 'draft' as EventStatus,
        };

        const validation = EventValidation.validate(eventData);
        if (!validation.valid) {
            return {
                success: false,
                error: validation.errors.join(', '),
                code: 'VALIDATION_ERROR'
            };
        }

        return eventRepository.create(eventData as any);
    }

    /**
     * Update event
     */
    async updateEvent(id: string, data: Partial<Event>): Promise<ActionResult<Event>> {
        const event = await eventRepository.findById(id);
        if (!event) {
            return { success: false, error: 'Event not found', code: 'NOT_FOUND' };
        }

        if (!EventValidation.canEdit(event)) {
            return { success: false, error: 'Event is locked and cannot be edited', code: 'FORBIDDEN' };
        }

        return eventRepository.update(id, data);
    }

    /**
     * Update event status (with state machine validation)
     */
    async updateEventStatus(id: string, newStatus: EventStatus): Promise<ActionResult<Event>> {
        const event = await eventRepository.findById(id);
        if (!event) {
            return { success: false, error: 'Event not found', code: 'NOT_FOUND' };
        }

        if (!canTransitionTo(event.status, newStatus)) {
            const statusInfo = getEventStatusInfo(event.status);
            return {
                success: false,
                error: `Cannot transition from ${statusInfo.label} to ${newStatus}`,
                code: 'INVALID_TRANSITION'
            };
        }

        return eventRepository.updateStatus(id, newStatus);
    }

    /**
     * Send proposal to client
     */
    async sendProposal(eventId: string): Promise<ActionResult<Event>> {
        const event = await eventRepository.findById(eventId);
        if (!event) {
            return { success: false, error: 'Event not found', code: 'NOT_FOUND' };
        }

        if (!EventValidation.canSendProposal(event)) {
            return { success: false, error: 'Event is not in planning status', code: 'INVALID_STATE' };
        }

        return this.updateEventStatus(eventId, 'proposed');
    }

    /**
     * Approve event (lock it)
     */
    async approveEvent(eventId: string): Promise<ActionResult<Event>> {
        const event = await eventRepository.findById(eventId);
        if (!event) {
            return { success: false, error: 'Event not found', code: 'NOT_FOUND' };
        }

        if (!EventValidation.canApprove(event)) {
            return { success: false, error: 'Event cannot be approved in current state', code: 'INVALID_STATE' };
        }

        // When approving, we should also:
        // - Generate tasks (future)
        // - Notify vendors (future)
        // - Lock all proposals (future)

        return this.updateEventStatus(eventId, 'approved');
    }

    /**
     * Archive event
     */
    async archiveEvent(eventId: string): Promise<ActionResult<Event>> {
        const event = await eventRepository.findById(eventId);
        if (!event) {
            return { success: false, error: 'Event not found', code: 'NOT_FOUND' };
        }

        if (!['completed', 'draft'].includes(event.status)) {
            return {
                success: false,
                error: 'Only completed or draft events can be archived',
                code: 'INVALID_STATE'
            };
        }

        return this.updateEventStatus(eventId, 'archived');
    }

    /**
     * Delete event (only drafts)
     */
    async deleteEvent(id: string): Promise<ActionResult<void>> {
        const event = await eventRepository.findById(id);
        if (!event) {
            return { success: false, error: 'Event not found', code: 'NOT_FOUND' };
        }

        if (event.status !== 'draft') {
            return {
                success: false,
                error: 'Only draft events can be deleted',
                code: 'FORBIDDEN'
            };
        }

        return eventRepository.delete(id);
    }
}

// Export singleton instance
export const eventService = new EventService();
