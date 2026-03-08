/**
 * Supabase Event Repository
 * 
 * Production-ready event repository backed by Supabase.
 * Replaces localStorage-based EventRepository.
 */

import { SupabaseBaseRepository } from './supabase-base-repository'
import type { Event, EventStatus, ActionResult } from '@/types/domain'

class SupabaseEventRepositoryClass extends SupabaseBaseRepository<Event> {
    protected tableName = 'events'
    protected entityName = 'event'

    /**
     * Find events by planner ID
     */
    async findByPlannerId(plannerId: string): Promise<Event[]> {
        const supabase = await this.getClient()

        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('planner_id', plannerId)
            .order('created_at', { ascending: false })

        if (error) return []
        return this.fromDbArray(data || [])
    }

    /**
     * Find events by status
     */
    async findByStatus(status: EventStatus): Promise<Event[]> {
        const supabase = await this.getClient()

        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('status', status)
            .order('created_at', { ascending: false })

        if (error) return []
        return this.fromDbArray(data || [])
    }

    /**
     * Find events by client phone
     */
    async findByClientPhone(phone: string): Promise<Event[]> {
        const supabase = await this.getClient()

        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .ilike('client_phone', `%${phone}%`)

        if (error) return []
        return this.fromDbArray(data || [])
    }

    /**
     * Find upcoming events (next 30 days)
     */
    async findUpcoming(): Promise<Event[]> {
        const supabase = await this.getClient()

        const now = new Date().toISOString()
        const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .gte('event_date', now)
            .lte('event_date', thirtyDaysLater)
            .order('event_date', { ascending: true })

        if (error) return []
        return this.fromDbArray(data || [])
    }

    /**
     * Find today's events
     */
    async findToday(): Promise<Event[]> {
        const supabase = await this.getClient()

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const startOfDay = today.toISOString()

        const endToday = new Date()
        endToday.setHours(23, 59, 59, 999)
        const endOfDay = endToday.toISOString()

        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .gte('event_date', startOfDay)
            .lte('event_date', endOfDay)

        if (error) return []
        return this.fromDbArray(data || [])
    }

    /**
     * Update event status
     */
    async updateStatus(id: string, status: EventStatus): Promise<ActionResult<Event>> {
        return this.update(id, { status } as Partial<Event>)
    }

    /**
     * Find event by submission ID
     */
    async findBySubmissionId(submissionId: string): Promise<Event | null> {
        const supabase = await this.getClient()

        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('submission_id', submissionId)
            .single()

        if (error || !data) return null
        return this.fromDb(data)
    }

    /**
     * Get event counts by status
     */
    async getStatusCounts(): Promise<Record<EventStatus, number>> {
        const supabase = await this.getClient()

        const counts: Record<string, number> = {
            submission: 0,
            draft: 0,
            planning: 0,
            proposed: 0,
            approved: 0,
            live: 0,
            completed: 0,
            archived: 0,
        }

        const { data, error } = await supabase
            .from(this.tableName)
            .select('status')

        if (!error && data) {
            data.forEach((event: any) => {
                if (counts[event.status] !== undefined) {
                    counts[event.status]++
                }
            })
        }

        return counts as Record<EventStatus, number>
    }

    /**
     * Find events with functions (joined)
     */
    async findWithFunctions(eventId: string): Promise<Event | null> {
        const supabase = await this.getClient()

        const { data, error } = await supabase
            .from(this.tableName)
            .select(`
                *,
                event_functions (*)
            `)
            .eq('id', eventId)
            .single()

        if (error || !data) return null
        return this.fromDb(data)
    }

    /**
     * Search events by name or client name
     */
    async search(query: string): Promise<Event[]> {
        const supabase = await this.getClient()

        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .or(`name.ilike.%${query}%,client_name.ilike.%${query}%`)
            .order('created_at', { ascending: false })
            .limit(20)

        if (error) return []
        return this.fromDbArray(data || [])
    }
}

// Export singleton instance
export const supabaseEventRepository = new SupabaseEventRepositoryClass()
