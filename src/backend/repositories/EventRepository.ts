/**
 * Event Repository
 * 
 * Data access layer for Event entities.
 */

import { BaseRepository, FindOptions, FindResult } from './BaseRepository';
import { Event, EventData, EventStatus } from '../entities';
import { createLogger } from '../utils';

const logger = createLogger('EventRepository');

interface EventRow {
    id: string;
    planner_id: string;
    client_id?: string;
    name: string;
    type: string;
    status: string;
    date: string;
    end_date?: string;
    guest_count: number;
    budget_min: number;
    budget_max: number;
    city: string;
    venue_type: string;
    venue_id?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export class EventRepository extends BaseRepository<Event, EventRow> {
    protected tableName = 'events';
    protected entityName = 'Event';

    protected toEntity(row: EventRow): Event {
        return Event.fromDatabase(row as unknown as Record<string, unknown>);
    }

    protected toRow(entity: Partial<Event>): Partial<EventRow> {
        const row: Partial<EventRow> = {};

        if (entity.plannerId) row.planner_id = entity.plannerId;
        if (entity.clientId !== undefined) row.client_id = entity.clientId;
        if (entity.name) row.name = entity.name;
        if (entity.type) row.type = entity.type;
        if (entity.status) row.status = entity.status;
        if (entity.date) row.date = entity.date instanceof Date ? entity.date.toISOString() : entity.date;
        if (entity.endDate !== undefined) row.end_date = entity.endDate instanceof Date ? entity.endDate.toISOString() : entity.endDate;
        if (entity.guestCount) row.guest_count = entity.guestCount;
        if (entity.budgetMin) row.budget_min = entity.budgetMin;
        if (entity.budgetMax) row.budget_max = entity.budgetMax;
        if (entity.city) row.city = entity.city;
        if (entity.venueType) row.venue_type = entity.venueType;
        if (entity.venueId !== undefined) row.venue_id = entity.venueId;
        if (entity.notes !== undefined) row.notes = entity.notes;

        return row;
    }

    // ============================================
    // CUSTOM QUERIES
    // ============================================

    /**
     * Find events by planner ID
     */
    async findByPlannerId(plannerId: string, options: FindOptions = {}): Promise<FindResult<Event>> {
        const { page = 1, limit = 20, sortBy = 'date', sortOrder = 'asc' } = options;
        const offset = (page - 1) * limit;

        const { count } = await this.supabase
            .from(this.tableName)
            .select('*', { count: 'exact', head: true })
            .eq('planner_id', plannerId);

        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('planner_id', plannerId)
            .order(sortBy === 'date' ? 'date' : 'created_at', { ascending: sortOrder === 'asc' })
            .range(offset, offset + limit - 1);

        if (error) {
            logger.error('Failed to find events by planner', error, { plannerId });
            throw error;
        }

        return {
            data: (data as EventRow[]).map(row => this.toEntity(row)),
            total: count || 0,
            page,
            limit,
        };
    }

    /**
     * Find events by status
     */
    async findByStatus(status: EventStatus): Promise<Event[]> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('status', status)
            .order('date', { ascending: true });

        if (error) {
            logger.error('Failed to find events by status', error, { status });
            throw error;
        }

        return (data as EventRow[]).map(row => this.toEntity(row));
    }

    /**
     * Find upcoming events (next 30 days)
     */
    async findUpcoming(plannerId?: string): Promise<Event[]> {
        const now = new Date();
        const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        let query = this.supabase
            .from(this.tableName)
            .select('*')
            .gte('date', now.toISOString())
            .lte('date', thirtyDaysLater.toISOString())
            .in('status', ['planning', 'proposed', 'approved', 'live'])
            .order('date', { ascending: true });

        if (plannerId) {
            query = query.eq('planner_id', plannerId);
        }

        const { data, error } = await query;

        if (error) {
            logger.error('Failed to find upcoming events', error);
            throw error;
        }

        return (data as EventRow[]).map(row => this.toEntity(row));
    }

    /**
     * Find today's events
     */
    async findToday(plannerId?: string): Promise<Event[]> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

        let query = this.supabase
            .from(this.tableName)
            .select('*')
            .gte('date', today.toISOString())
            .lt('date', tomorrow.toISOString());

        if (plannerId) {
            query = query.eq('planner_id', plannerId);
        }

        const { data, error } = await query;

        if (error) {
            logger.error("Failed to find today's events", error);
            throw error;
        }

        return (data as EventRow[]).map(row => this.toEntity(row));
    }

    /**
     * Get event counts by status
     */
    async getStatusCounts(plannerId?: string): Promise<Record<EventStatus, number>> {
        const statuses: EventStatus[] = ['draft', 'planning', 'proposed', 'approved', 'live', 'completed', 'archived', 'cancelled'];
        const counts: Record<string, number> = {};

        for (const status of statuses) {
            let query = this.supabase
                .from(this.tableName)
                .select('*', { count: 'exact', head: true })
                .eq('status', status);

            if (plannerId) {
                query = query.eq('planner_id', plannerId);
            }

            const { count } = await query;
            counts[status] = count || 0;
        }

        return counts as Record<EventStatus, number>;
    }

    /**
     * Update event status
     */
    async updateStatus(id: string, status: EventStatus): Promise<Event> {
        return this.update(id, { status } as Partial<Event>);
    }
}

// Export singleton instance
export const eventRepository = new EventRepository();
