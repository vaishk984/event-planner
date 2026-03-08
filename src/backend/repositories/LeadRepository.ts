/**
 * Lead Repository
 * 
 * Data access layer for Lead entities.
 */

import { BaseRepository, FindOptions, FindResult } from './BaseRepository';
import { Lead, LeadStatus, LeadSource } from '../entities';
import { createLogger } from '../utils';

const logger = createLogger('LeadRepository');

interface LeadRow {
    id: string;
    planner_id: string;
    name: string;
    email: string;
    phone?: string;
    event_type: string;
    budget_range?: string;
    event_date?: string;
    source: string;
    score: number;
    status: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export class LeadRepository extends BaseRepository<Lead, LeadRow> {
    protected tableName = 'leads';
    protected entityName = 'Lead';

    protected toEntity(row: LeadRow): Lead {
        return Lead.fromDatabase(row as unknown as Record<string, unknown>);
    }

    protected toRow(entity: Partial<Lead>): Partial<LeadRow> {
        const row: Partial<LeadRow> = {};

        if (entity.plannerId) row.planner_id = entity.plannerId;
        if (entity.name) row.name = entity.name;
        if (entity.email) row.email = entity.email;
        if (entity.phone !== undefined) row.phone = entity.phone;
        if (entity.eventType) row.event_type = entity.eventType;
        if (entity.budgetRange !== undefined) row.budget_range = entity.budgetRange;
        if (entity.eventDate !== undefined) row.event_date = entity.eventDate instanceof Date ? entity.eventDate.toISOString() : entity.eventDate;
        if (entity.source) row.source = entity.source;
        if (entity.score !== undefined) row.score = entity.score;
        if (entity.status) row.status = entity.status;
        if (entity.notes !== undefined) row.notes = entity.notes;

        return row;
    }

    // ============================================
    // CUSTOM QUERIES
    // ============================================

    /**
     * Find leads by planner ID
     */
    async findByPlannerId(plannerId: string, options: FindOptions = {}): Promise<FindResult<Lead>> {
        const { page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'desc' } = options;
        const offset = (page - 1) * limit;

        const { count } = await this.supabase
            .from(this.tableName)
            .select('*', { count: 'exact', head: true })
            .eq('planner_id', plannerId);

        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('planner_id', plannerId)
            .order(sortBy, { ascending: sortOrder === 'asc' })
            .range(offset, offset + limit - 1);

        if (error) {
            logger.error('Failed to find leads by planner', error, { plannerId });
            throw error;
        }

        return {
            data: (data as LeadRow[]).map(row => this.toEntity(row)),
            total: count || 0,
            page,
            limit,
        };
    }

    /**
     * Find leads by status
     */
    async findByStatus(status: LeadStatus, plannerId?: string): Promise<Lead[]> {
        let query = this.supabase
            .from(this.tableName)
            .select('*')
            .eq('status', status)
            .order('score', { ascending: false });

        if (plannerId) {
            query = query.eq('planner_id', plannerId);
        }

        const { data, error } = await query;

        if (error) {
            logger.error('Failed to find leads by status', error, { status });
            throw error;
        }

        return (data as LeadRow[]).map(row => this.toEntity(row));
    }

    /**
     * Find hot leads (score >= 70)
     */
    async findHotLeads(plannerId?: string): Promise<Lead[]> {
        let query = this.supabase
            .from(this.tableName)
            .select('*')
            .gte('score', 70)
            .order('score', { ascending: false });

        if (plannerId) {
            query = query.eq('planner_id', plannerId);
        }

        const { data, error } = await query;

        if (error) {
            logger.error('Failed to find hot leads', error);
            throw error;
        }

        return (data as LeadRow[]).map(row => this.toEntity(row));
    }

    /**
     * Update lead status
     */
    async updateStatus(id: string, status: LeadStatus): Promise<Lead> {
        return this.update(id, { status } as Partial<Lead>);
    }

    /**
     * Update lead score
     */
    async updateScore(id: string, score: number): Promise<Lead> {
        return this.update(id, { score } as unknown as Partial<Lead>);
    }
}

// Export singleton instance
export const leadRepository = new LeadRepository();
