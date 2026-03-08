/**
 * Event Service
 * 
 * Business logic for Event operations.
 * Similar to Spring's @Service classes.
 */

import { EventRepository, eventRepository } from '../repositories';
import { Event, EventStatus } from '../entities';
import { CreateEventDto, UpdateEventDto, QueryEventsDto } from '../dto/request';
import { EventResponseDto, EventListResponseDto, EventMapper, PaginatedResponseDto, createPaginatedResponse } from '../dto/response';
import { NotFoundException, BusinessException } from '../exceptions';
import { createLogger } from '../utils';

const logger = createLogger('EventService');

export class EventService {
    constructor(private eventRepo: EventRepository = eventRepository) { }

    // ============================================
    // QUERY OPERATIONS
    // ============================================

    /**
     * Get event by ID
     */
    async getById(id: string): Promise<EventResponseDto> {
        const event = await this.eventRepo.findByIdOrThrow(id);
        return EventMapper.toResponse(event);
    }

    /**
     * Get events for a planner with pagination
     */
    async getByPlanner(
        plannerId: string,
        query: QueryEventsDto
    ): Promise<PaginatedResponseDto<EventListResponseDto>> {
        const result = await this.eventRepo.findByPlannerId(plannerId, {
            page: query.page,
            limit: query.limit,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
        });

        return createPaginatedResponse(
            EventMapper.toListItems(result.data),
            result.page,
            result.limit,
            result.total
        );
    }

    /**
     * Get upcoming events
     */
    async getUpcoming(plannerId?: string): Promise<EventListResponseDto[]> {
        const events = await this.eventRepo.findUpcoming(plannerId);
        return EventMapper.toListItems(events);
    }

    /**
     * Get today's events
     */
    async getToday(plannerId?: string): Promise<EventListResponseDto[]> {
        const events = await this.eventRepo.findToday(plannerId);
        return EventMapper.toListItems(events);
    }

    /**
     * Get dashboard stats
     */
    async getStats(plannerId?: string): Promise<{
        total: number;
        byStatus: Record<EventStatus, number>;
        upcomingCount: number;
        todayCount: number;
    }> {
        const [statusCounts, upcoming, today] = await Promise.all([
            this.eventRepo.getStatusCounts(plannerId),
            this.eventRepo.findUpcoming(plannerId),
            this.eventRepo.findToday(plannerId),
        ]);

        const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);

        return {
            total,
            byStatus: statusCounts,
            upcomingCount: upcoming.length,
            todayCount: today.length,
        };
    }

    // ============================================
    // MUTATION OPERATIONS
    // ============================================

    /**
     * Create a new event
     */
    async create(dto: CreateEventDto, plannerId: string): Promise<EventResponseDto> {
        logger.info('Creating new event', { plannerId, type: dto.type });

        // Business validation
        const eventDate = new Date(dto.date);
        if (eventDate < new Date()) {
            throw new BusinessException('Event date cannot be in the past', 'INVALID_DATE');
        }

        const event = await this.eventRepo.create({
            plannerId,
            name: dto.name,
            type: dto.type,
            status: 'draft',
            date: new Date(dto.date),
            endDate: dto.endDate ? new Date(dto.endDate) : undefined,
            guestCount: dto.guestCount,
            budgetMin: dto.budgetMin,
            budgetMax: dto.budgetMax,
            city: dto.city,
            venueType: dto.venueType,
            venueId: dto.venueId,
            notes: dto.notes,
        } as Partial<Event>);

        logger.info('Event created', { eventId: event.id });
        return EventMapper.toResponse(event);
    }

    /**
     * Update an event
     */
    async update(id: string, dto: UpdateEventDto): Promise<EventResponseDto> {
        const event = await this.eventRepo.findByIdOrThrow(id);

        // Check if event is editable
        if (event.isLocked) {
            throw new BusinessException(
                'Cannot edit a locked event. Event is in status: ' + event.status,
                'EVENT_LOCKED'
            );
        }

        const updated = await this.eventRepo.update(id, {
            ...dto,
            date: dto.date ? new Date(dto.date) : undefined,
            endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        } as Partial<Event>);

        logger.info('Event updated', { eventId: id });
        return EventMapper.toResponse(updated);
    }

    /**
     * Update event status
     */
    async updateStatus(id: string, newStatus: EventStatus): Promise<EventResponseDto> {
        const event = await this.eventRepo.findByIdOrThrow(id);

        // Validate state transition
        if (!event.canTransitionTo(newStatus)) {
            throw new BusinessException(
                `Cannot transition from '${event.status}' to '${newStatus}'`,
                'INVALID_STATUS_TRANSITION'
            );
        }

        const updated = await this.eventRepo.updateStatus(id, newStatus);
        logger.info('Event status updated', { eventId: id, oldStatus: event.status, newStatus });

        return EventMapper.toResponse(updated);
    }

    /**
     * Send proposal to client
     */
    async sendProposal(id: string): Promise<EventResponseDto> {
        const event = await this.eventRepo.findByIdOrThrow(id);

        if (!event.canSendProposal()) {
            throw new BusinessException(
                'Event must be in planning status to send proposal',
                'INVALID_STATE'
            );
        }

        return this.updateStatus(id, 'proposed');
    }

    /**
     * Approve event (lock it)
     */
    async approve(id: string): Promise<EventResponseDto> {
        const event = await this.eventRepo.findByIdOrThrow(id);

        if (!event.canApprove()) {
            throw new BusinessException(
                'Event must be in proposed status to approve',
                'INVALID_STATE'
            );
        }

        // TODO: Generate tasks for vendors
        // TODO: Send notifications to vendors

        return this.updateStatus(id, 'approved');
    }

    /**
     * Delete an event (only drafts)
     */
    async delete(id: string): Promise<void> {
        const event = await this.eventRepo.findByIdOrThrow(id);

        if (event.status !== 'draft') {
            throw new BusinessException(
                'Only draft events can be deleted',
                'CANNOT_DELETE'
            );
        }

        await this.eventRepo.delete(id);
        logger.info('Event deleted', { eventId: id });
    }
}

// Export singleton instance
export const eventService = new EventService();
