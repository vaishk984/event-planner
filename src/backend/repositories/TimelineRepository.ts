/**
 * Timeline Repository
 * 
 * Data access layer for timeline items.
 */

import { BaseRepository } from './BaseRepository';
import { TimelineItem, TimelineItemStatus } from '../entities/TimelineItem';
import { DatabaseConfig } from '../config';

interface TimelineItemRow {
    id: string;
    event_id: string;
    function_id: string;
    start_time: string;
    end_time: string | null;
    duration: number | null;
    title: string;
    description: string | null;
    location: string | null;
    owner: string;
    vendor_id: string | null;
    status: TimelineItemStatus;
    notes: string | null;
    depends_on: string[] | null;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export class TimelineRepository extends BaseRepository<TimelineItem, TimelineItemRow> {
    protected tableName = DatabaseConfig.tables.timelineItems;
    protected entityName = 'TimelineItem';

    protected toEntity(row: TimelineItemRow): TimelineItem {
        return TimelineItem.fromDatabase(row as unknown as Record<string, unknown>);
    }

    protected toRow(entity: Partial<TimelineItem>): Partial<TimelineItemRow> {
        if (entity instanceof TimelineItem) {
            return entity.toDatabaseRow() as Partial<TimelineItemRow>;
        }
        // Handle partial data
        const row: Partial<TimelineItemRow> = {};
        if ('eventId' in entity) row.event_id = entity.eventId as string;
        if ('functionId' in entity) row.function_id = entity.functionId as string;
        if ('startTime' in entity) row.start_time = entity.startTime as string;
        if ('endTime' in entity) row.end_time = entity.endTime as string | null;
        if ('duration' in entity) row.duration = entity.duration as number | null;
        if ('title' in entity) row.title = entity.title as string;
        if ('description' in entity) row.description = entity.description as string | null;
        if ('location' in entity) row.location = entity.location as string | null;
        if ('owner' in entity) row.owner = entity.owner as string;
        if ('vendorId' in entity) row.vendor_id = entity.vendorId as string | null;
        if ('status' in entity) row.status = entity.status as TimelineItemStatus;
        if ('notes' in entity) row.notes = entity.notes as string | null;
        if ('dependsOn' in entity) row.depends_on = entity.dependsOn as string[] | null;
        if ('sortOrder' in entity) row.sort_order = entity.sortOrder as number;
        return row;
    }

    /**
     * Find all items for a specific function
     */
    async findByFunction(functionId: string): Promise<TimelineItem[]> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('function_id', functionId)
            .order('sort_order', { ascending: true });

        if (error) throw error;
        return (data || []).map((row) => this.toEntity(row as TimelineItemRow));
    }

    /**
     * Find all items for an event (across all functions)
     */
    async findByEvent(eventId: string): Promise<TimelineItem[]> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('event_id', eventId)
            .order('sort_order', { ascending: true });

        if (error) throw error;
        return (data || []).map((row) => this.toEntity(row as TimelineItemRow));
    }

    /**
     * Find items by status
     */
    async findByStatus(
        functionId: string,
        status: TimelineItemStatus
    ): Promise<TimelineItem[]> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('function_id', functionId)
            .eq('status', status)
            .order('sort_order', { ascending: true });

        if (error) throw error;
        return (data || []).map((row) => this.toEntity(row as TimelineItemRow));
    }

    /**
     * Get next pending item for a function
     */
    async getNextPending(functionId: string): Promise<TimelineItem | null> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('function_id', functionId)
            .eq('status', 'pending')
            .order('sort_order', { ascending: true })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data ? this.toEntity(data as TimelineItemRow) : null;
    }

    /**
     * Update sort order for multiple items
     */
    async updateSortOrders(
        items: Array<{ id: string; sortOrder: number }>
    ): Promise<void> {
        for (const item of items) {
            const { error } = await this.supabase
                .from(this.tableName)
                .update({ sort_order: item.sortOrder, updated_at: new Date().toISOString() })
                .eq('id', item.id);

            if (error) throw error;
        }
    }

    /**
     * Get max sort order for a function
     */
    async getMaxSortOrder(functionId: string): Promise<number> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('sort_order')
            .eq('function_id', functionId)
            .order('sort_order', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data?.sort_order ?? -1;
    }

    /**
     * Delete all items for a function
     */
    async deleteByFunction(functionId: string): Promise<number> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .delete()
            .eq('function_id', functionId)
            .select('id');

        if (error) throw error;
        return data?.length || 0;
    }

    /**
     * Get timeline overview stats for a function
     */
    async getOverview(functionId: string): Promise<{
        total: number;
        pending: number;
        inProgress: number;
        completed: number;
        delayed: number;
    }> {
        const items = await this.findByFunction(functionId);

        return {
            total: items.length,
            pending: items.filter(i => i.status === 'pending').length,
            inProgress: items.filter(i => i.status === 'in_progress').length,
            completed: items.filter(i => i.status === 'completed').length,
            delayed: items.filter(i => i.status === 'delayed').length,
        };
    }
}

// Singleton instance
export const timelineRepository = new TimelineRepository();
