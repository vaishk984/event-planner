/**
 * Supabase Function Repository
 * 
 * Production-ready event function repository backed by Supabase.
 */

import { SupabaseBaseRepository } from './supabase-base-repository'
import type { EventFunction, FunctionStatus, ActionResult } from '@/types/domain'

class SupabaseFunctionRepositoryClass extends SupabaseBaseRepository<EventFunction> {
    protected tableName = 'event_functions'
    protected entityName = 'function'

    /**
     * Find functions by event ID
     */
    async findByEventId(eventId: string): Promise<EventFunction[]> {
        const supabase = await this.getClient()

        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('event_id', eventId)
            .order('day', { ascending: true })
            .order('date', { ascending: true })

        if (error) return []
        return this.fromDbArray(data || [])
    }

    /**
     * Find function by event and day
     */
    async findByEventAndDay(eventId: string, day: number): Promise<EventFunction[]> {
        const supabase = await this.getClient()

        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('event_id', eventId)
            .eq('day', day)
            .order('start_time', { ascending: true })

        if (error) return []
        return this.fromDbArray(data || [])
    }

    /**
     * Update function status
     */
    async updateStatus(id: string, status: FunctionStatus): Promise<ActionResult<EventFunction>> {
        return this.update(id, { status } as Partial<EventFunction>)
    }

    /**
     * Get function count by event
     */
    async countByEvent(eventId: string): Promise<number> {
        return this.count({ eventId } as Partial<EventFunction>)
    }

    /**
     * Duplicate function (for templates)
     */
    async duplicate(id: string, newEventId?: string): Promise<ActionResult<EventFunction>> {
        const original = await this.findById(id)
        if (!original) {
            return { success: false, error: 'Function not found', code: 'NOT_FOUND' }
        }

        const { id: _, createdAt, updatedAt, ...functionData } = original as any

        return this.create({
            ...functionData,
            eventId: newEventId || original.eventId,
            name: `${original.name} (Copy)`,
        })
    }
}

// Export singleton instance
export const supabaseFunctionRepository = new SupabaseFunctionRepositoryClass()
