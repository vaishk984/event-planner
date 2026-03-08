/**
 * Supabase Intake Repository
 * 
 * Production-ready intake repository backed by Supabase.
 * Targets: event_intakes table with JSONB requirements column
 */

import { SupabaseBaseRepository } from './supabase-base-repository'
import type { Intake, IntakeStatus, ActionResult } from '@/types/domain'

class SupabaseIntakeRepositoryClass extends SupabaseBaseRepository<Intake> {
    protected tableName = 'event_intakes'
    protected entityName = 'intake'

    /**
     * Generate a unique access token
     */
    generateAccessToken(): string {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    }

    /**
     * Map DB row to Intake object
     */
    protected fromDb(row: any): Intake {
        if (!row) return row

        // Extract top-level columns
        let {
            requirements = {},
            client_name,
            client_email,
            client_phone,
            planner_id,
            status,
            source,
            event_id,
            submitted_at,
            ...commonFields
        } = row

        // Parse requirements if it's a string
        if (typeof requirements === 'string') {
            try {
                requirements = JSON.parse(requirements)
            } catch (e) {
                console.error('Failed to parse requirements JSON:', e)
                requirements = {}
            }
        }

        // Convert common fields (id, created_at, etc) to camelCase
        const base = super.fromDb(commonFields)

        // Merge everything together
        // Top-level columns override what's in requirements
        return {
            ...requirements, // Spread requirements JSONB first
            ...base,         // Base fields (id, timestamps)
            status: status || requirements.status || 'draft',
            plannerId: planner_id || requirements.plannerId,
            clientName: client_name || requirements.clientName,
            email: client_email || requirements.email,
            phone: client_phone || requirements.phone,
            source: source || requirements.source,
            convertedEventId: event_id || requirements.convertedEventId,
            submittedAt: submitted_at || requirements.submittedAt,
        } as Intake
    }

    /**
     * Map Intake object to DB fields
     */
    protected toDb(data: any): any {
        // Separate top-level DB columns from requirements blob data
        const {
            id,
            status,
            clientName,
            client_name,
            email,
            phone,
            source,
            plannerId,
            convertedEventId,
            event_id,
            submittedAt,
            submitted_at,
            createdAt,
            updatedAt,
            ...rest // Everything else goes into requirements JSONB
        } = data

        // Build requirements object (everything not in top-level columns)
        const requirements = {
            ...rest,
            clientName: clientName || client_name,
            email,
            phone,
            plannerId, // Backup in JSONB
            source,
            status,
            submittedAt: submittedAt || submitted_at
        }

        // Construct DB payload matching actual schema
        return {
            status,
            client_name: clientName || client_name,
            client_email: email,
            client_phone: phone,
            planner_id: plannerId, // CRITICAL: Map to planner_id column
            source,
            event_id: convertedEventId || event_id,
            submitted_at: submittedAt || submitted_at,
            requirements: requirements // Pack everything else here
        }
    }

    /**
     * Find pending intakes (not yet converted to events)
     */
    async findPending(): Promise<Intake[]> {
        const supabase = await this.getClient()

        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .in('status', ['submitted', 'in_progress'])
            .order('id', { ascending: false })

        if (error) {
            console.error('Error fetching pending intakes:', error)
            return []
        }
        return this.fromDbArray(data || [])
    }

    /**
     * Find intakes by planner ID
     */
    async findByPlannerId(plannerId: string): Promise<Intake[]> {
        const supabase = await this.getClient()

        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('planner_id', plannerId)
            .order('id', { ascending: false })

        if (error) {
            console.error('Error fetching intakes by planner:', error)
            return []
        }
        return this.fromDbArray(data || [])
    }

    /**
     * Find intake by token
     */
    async findByToken(token: string): Promise<Intake | null> {
        const supabase = await this.getClient()

        // Token is inside requirements JSONB
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('requirements->>token', token)
            .single()

        if (error || !data) return null
        return this.fromDb(data)
    }

    /**
     * Update intake status
     */
    async updateStatus(id: string, status: IntakeStatus): Promise<ActionResult<Intake>> {
        return this.update(id, { status } as Partial<Intake>)
    }

    /**
     * Mark as converted (linked to event)
     */
    async markConverted(id: string, eventId: string): Promise<ActionResult<Intake>> {
        return this.update(id, {
            status: 'converted',
            convertedEventId: eventId
        } as Partial<Intake>)
    }

    /**
     * Get counts by status
     */
    async getStatusCounts(): Promise<Record<IntakeStatus, number>> {
        const supabase = await this.getClient()

        const counts: Record<string, number> = {
            draft: 0,
            in_progress: 0,
            submitted: 0,
            converted: 0,
        }

        const { data, error } = await supabase
            .from(this.tableName)
            .select('status')

        if (!error && data) {
            data.forEach((intake: any) => {
                if (counts[intake.status] !== undefined) {
                    counts[intake.status]++
                }
            })
        }

        return counts as Record<IntakeStatus, number>
    }
}

// Export singleton instance
export const supabaseIntakeRepository = new SupabaseIntakeRepositoryClass()
