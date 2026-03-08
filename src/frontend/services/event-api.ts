/**
 * Event API Service
 * 
 * Frontend service for event-related API calls.
 */

import { api } from './api-client';
import type {
    EventResponseDto,
    EventListResponseDto,
    EventStatsResponseDto,
    PaginatedResponseDto,
    CreateEventDto,
    UpdateEventDto,
} from '@/src/backend/dto';

export interface QueryEventsParams {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const eventApi = {
    /**
     * Get paginated list of events
     */
    async list(params?: QueryEventsParams): Promise<PaginatedResponseDto<EventListResponseDto>> {
        return api.get('/events', params as Record<string, string | number | boolean | undefined>);
    },

    /**
     * Get single event by ID
     */
    async getById(id: string): Promise<EventResponseDto> {
        return api.get(`/events/${id}`);
    },

    /**
     * Create a new event
     */
    async create(data: CreateEventDto): Promise<EventResponseDto> {
        return api.post('/events', data);
    },

    /**
     * Update an event
     */
    async update(id: string, data: UpdateEventDto): Promise<EventResponseDto> {
        return api.put(`/events/${id}`, data);
    },

    /**
     * Update event status
     */
    async updateStatus(id: string, status: string): Promise<EventResponseDto> {
        return api.patch(`/events/${id}/status`, { status });
    },

    /**
     * Send proposal for event
     */
    async sendProposal(id: string): Promise<EventResponseDto> {
        return api.post(`/events/${id}/send-proposal`);
    },

    /**
     * Approve event
     */
    async approve(id: string): Promise<EventResponseDto> {
        return api.post(`/events/${id}/approve`);
    },

    /**
     * Delete event
     */
    async delete(id: string): Promise<{ deleted: boolean; id: string }> {
        return api.delete(`/events/${id}`);
    },

    /**
     * Get event stats/dashboard data
     */
    async getStats(): Promise<EventStatsResponseDto> {
        return api.get('/events/stats');
    },

    /**
     * Get upcoming events
     */
    async getUpcoming(): Promise<EventListResponseDto[]> {
        return api.get('/events/upcoming');
    },

    /**
     * Get today's events
     */
    async getToday(): Promise<EventListResponseDto[]> {
        return api.get('/events/today');
    },
};
