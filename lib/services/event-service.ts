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
import type { Event, EventStatus, ActionResult } from '@/types/domain';

export class EventService {
    // ============================================
    // QUERY OPERATIONS
    // ============================================

    /**
     * Get all events
     */
    async getEvents(plannerId: string): Promise<Event[]> {
        return eventRepository.findByPlannerId(plannerId);
    }

    /**
     * Get event by ID
     */
    async getEvent(id: string, plannerId: string): Promise<Event | null> {
        const event = await eventRepository.findById(id);
        if (!event || event.plannerId !== plannerId) {
            return null;
        }

        return event;
    }

    /**
     * Get events by status
     */
    async getEventsByStatus(status: EventStatus, plannerId: string): Promise<Event[]> {
        return eventRepository.findByStatus(status, plannerId);
    }

    /**
     * Get upcoming events
     */
    async getUpcomingEvents(plannerId: string): Promise<Event[]> {
        return eventRepository.findUpcoming(plannerId);
    }

    /**
     * Get today's events
     */
    async getTodayEvents(plannerId: string): Promise<Event[]> {
        return eventRepository.findToday(plannerId);
    }

    /**
     * Get dashboard stats
     */
    async getDashboardStats(plannerId: string): Promise<{
        total: number;
        byStatus: Record<EventStatus, number>;
        upcomingCount: number;
        todayCount: number;
    }> {
        const [all, statusCounts, upcoming, today] = await Promise.all([
            eventRepository.findByPlannerId(plannerId),
            eventRepository.getStatusCounts(plannerId),
            eventRepository.findUpcoming(plannerId),
            eventRepository.findToday(plannerId),
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
    async updateEvent(id: string, data: Partial<Event>, plannerId: string): Promise<ActionResult<Event>> {
        const event = await this.getEvent(id, plannerId);
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
    async updateEventStatus(id: string, newStatus: EventStatus, plannerId: string): Promise<ActionResult<Event>> {
        const event = await this.getEvent(id, plannerId);
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
    async sendProposal(eventId: string, plannerId: string): Promise<ActionResult<Event>> {
        const event = await this.getEvent(eventId, plannerId);
        if (!event) {
            return { success: false, error: 'Event not found', code: 'NOT_FOUND' };
        }

        if (!EventValidation.canSendProposal(event)) {
            return { success: false, error: 'Event is not in planning status', code: 'INVALID_STATE' };
        }

        return this.updateEventStatus(eventId, 'proposed', plannerId);
    }

    /**
     * Approve event (lock it)
     */
    async approveEvent(eventId: string, plannerId: string): Promise<ActionResult<Event>> {
        const event = await this.getEvent(eventId, plannerId);
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

        return this.updateEventStatus(eventId, 'approved', plannerId);
    }

    /**
     * Archive event
     */
    async archiveEvent(eventId: string, plannerId: string): Promise<ActionResult<Event>> {
        const event = await this.getEvent(eventId, plannerId);
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

        return this.updateEventStatus(eventId, 'archived', plannerId);
    }

    /**
     * Delete event (only drafts)
     */
    async deleteEvent(id: string, plannerId: string): Promise<ActionResult<void>> {
        const event = await this.getEvent(id, plannerId);
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
