/**
 * Event Response DTOs
 * 
 * Response data structures for event APIs.
 */

import { Event, EventData, EventStatus, EventType } from '../../entities';

// ============================================
// EVENT RESPONSE DTO
// ============================================

export interface EventResponseDto {
    id: string;
    plannerId: string;
    clientId?: string;
    name: string;
    type: EventType;
    status: EventStatus;
    date: string;
    endDate?: string;
    guestCount: number;
    budget: {
        min: number;
        max: number;
        average: number;
    };
    city: string;
    venueType: 'personal' | 'showroom';
    venueId?: string;
    notes?: string;
    // Computed fields
    isLocked: boolean;
    isEditable: boolean;
    daysUntilEvent: number;
    createdAt: string;
    updatedAt: string;
}

// ============================================
// EVENT LIST RESPONSE DTO
// ============================================

export interface EventListResponseDto {
    id: string;
    name: string;
    type: EventType;
    status: EventStatus;
    date: string;
    city: string;
    guestCount: number;
    budgetAverage: number;
    daysUntilEvent: number;
}

// ============================================
// EVENT STATS RESPONSE DTO
// ============================================

export interface EventStatsResponseDto {
    total: number;
    byStatus: Record<EventStatus, number>;
    upcomingCount: number;
    todayCount: number;
}

// ============================================
// MAPPER UTILITY
// ============================================

export class EventMapper {
    /**
     * Map Event entity to full response DTO
     */
    static toResponse(event: Event): EventResponseDto {
        return {
            id: event.id,
            plannerId: event.plannerId,
            clientId: event.clientId,
            name: event.name,
            type: event.type,
            status: event.status,
            date: event.date.toISOString(),
            endDate: event.endDate?.toISOString(),
            guestCount: event.guestCount,
            budget: event.budget,
            city: event.city,
            venueType: event.venueType,
            venueId: event.venueId,
            notes: event.notes,
            isLocked: event.isLocked,
            isEditable: event.isEditable,
            daysUntilEvent: event.daysUntilEvent,
            createdAt: event.createdAt.toISOString(),
            updatedAt: event.updatedAt.toISOString(),
        };
    }

    /**
     * Map Event entity to list item DTO
     */
    static toListItem(event: Event): EventListResponseDto {
        return {
            id: event.id,
            name: event.name,
            type: event.type,
            status: event.status,
            date: event.date.toISOString(),
            city: event.city,
            guestCount: event.guestCount,
            budgetAverage: event.budget.average,
            daysUntilEvent: event.daysUntilEvent,
        };
    }

    /**
     * Map array of events to list items
     */
    static toListItems(events: Event[]): EventListResponseDto[] {
        return events.map(e => this.toListItem(e));
    }

    /**
     * Map EventData (plain object) to response
     */
    static fromData(data: EventData): EventResponseDto {
        const event = new Event(data);
        return this.toResponse(event);
    }
}
