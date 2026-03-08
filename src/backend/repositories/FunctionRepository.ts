/**
 * FunctionRepository
 * 
 * Data access for EventFunction entities.
 */

import { BaseRepository } from './BaseRepository';
import { EventFunction, EventFunctionRow, FunctionType } from '../entities';

export class FunctionRepository extends BaseRepository<EventFunction, EventFunctionRow> {
    protected tableName = 'event_functions';
    protected entityName = 'EventFunction';

    protected toEntity(row: EventFunctionRow): EventFunction {
        return EventFunction.fromRow(row);
    }

    protected toRow(entity: Partial<EventFunction>): Partial<EventFunctionRow> {
        if (entity instanceof EventFunction) {
            return entity.toRow();
        }
        return entity as unknown as Partial<EventFunctionRow>;
    }

    /**
     * Get functions by event
     */
    async getByEvent(eventId: string): Promise<EventFunction[]> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('event_id', eventId)
            .order('sort_order', { ascending: true });

        if (error) throw error;
        return (data || []).map(row => this.toEntity(row as EventFunctionRow));
    }

    /**
     * Get functions by type
     */
    async getByType(eventId: string, type: FunctionType): Promise<EventFunction[]> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('event_id', eventId)
            .eq('type', type)
            .order('sort_order', { ascending: true });

        if (error) throw error;
        return (data || []).map(row => this.toEntity(row as EventFunctionRow));
    }

    /**
     * Get function count for event
     */
    async countByEvent(eventId: string): Promise<number> {
        const { count, error } = await this.supabase
            .from(this.tableName)
            .select('*', { count: 'exact', head: true })
            .eq('event_id', eventId);

        if (error) throw error;
        return count || 0;
    }

    /**
     * Get next sort order for new function
     */
    async getNextSortOrder(eventId: string): Promise<number> {
        const count = await this.countByEvent(eventId);
        return count;
    }

    /**
     * Reorder functions
     */
    async reorder(items: Array<{ id: string; sortOrder: number }>): Promise<void> {
        for (const item of items) {
            await this.supabase
                .from(this.tableName)
                .update({ sort_order: item.sortOrder, updated_at: new Date().toISOString() })
                .eq('id', item.id);
        }
    }

    /**
     * Delete all functions for an event
     */
    async deleteByEvent(eventId: string): Promise<void> {
        const { error } = await this.supabase
            .from(this.tableName)
            .delete()
            .eq('event_id', eventId);

        if (error) throw error;
    }
}
