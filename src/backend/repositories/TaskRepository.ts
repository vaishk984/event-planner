/**
 * Task Repository
 * 
 * Data access layer for Task entities.
 */

import { BaseRepository, FindOptions, FindResult } from './BaseRepository';
import { Task, TaskStatus, TaskPriority } from '../entities';
import { createLogger } from '../utils';

const logger = createLogger('TaskRepository');

interface TaskRow {
    id: string;
    event_id: string;
    vendor_id: string;
    service_id?: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    start_time?: string;
    end_time?: string;
    due_date?: string;
    completed_at?: string;
    proof_urls?: string[];
    notes?: string;
    created_at: string;
    updated_at: string;
}

export class TaskRepository extends BaseRepository<Task, TaskRow> {
    protected tableName = 'event_tasks';
    protected entityName = 'Task';

    protected toEntity(row: TaskRow): Task {
        return Task.fromDatabase(row as unknown as Record<string, unknown>);
    }

    protected toRow(entity: Partial<Task>): Partial<TaskRow> {
        const row: Partial<TaskRow> = {};

        if (entity.eventId) row.event_id = entity.eventId;
        if (entity.vendorId) row.vendor_id = entity.vendorId;
        if (entity.serviceId !== undefined) row.service_id = entity.serviceId;
        if (entity.title) row.title = entity.title;
        if (entity.description !== undefined) row.description = entity.description;
        if (entity.status) row.status = entity.status;
        if (entity.priority) row.priority = entity.priority;
        if (entity.startTime !== undefined) row.start_time = entity.startTime instanceof Date ? entity.startTime.toISOString() : entity.startTime;
        if (entity.endTime !== undefined) row.end_time = entity.endTime instanceof Date ? entity.endTime.toISOString() : entity.endTime;
        if (entity.dueDate !== undefined) row.due_date = entity.dueDate instanceof Date ? entity.dueDate.toISOString() : entity.dueDate;
        if (entity.completedAt !== undefined) row.completed_at = entity.completedAt instanceof Date ? entity.completedAt.toISOString() : entity.completedAt;
        if (entity.proofUrls) row.proof_urls = entity.proofUrls;
        if (entity.notes !== undefined) row.notes = entity.notes;

        return row;
    }

    // ============================================
    // CUSTOM QUERIES
    // ============================================

    /**
     * Find tasks by event ID
     */
    async findByEventId(eventId: string, options: FindOptions = {}): Promise<FindResult<Task>> {
        const { page = 1, limit = 50, sortBy = 'due_date', sortOrder = 'asc' } = options;
        const offset = (page - 1) * limit;

        const { count } = await this.supabase
            .from(this.tableName)
            .select('*', { count: 'exact', head: true })
            .eq('event_id', eventId);

        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('event_id', eventId)
            .order(sortBy, { ascending: sortOrder === 'asc' })
            .range(offset, offset + limit - 1);

        if (error) {
            logger.error('Failed to find tasks by event', error, { eventId });
            throw error;
        }

        return {
            data: (data as TaskRow[]).map(row => this.toEntity(row)),
            total: count || 0,
            page,
            limit,
        };
    }

    /**
     * Find tasks by vendor ID
     */
    async findByVendorId(vendorId: string, options: FindOptions = {}): Promise<FindResult<Task>> {
        const { page = 1, limit = 20, sortBy = 'due_date', sortOrder = 'asc' } = options;
        const offset = (page - 1) * limit;

        const { count } = await this.supabase
            .from(this.tableName)
            .select('*', { count: 'exact', head: true })
            .eq('vendor_id', vendorId);

        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('vendor_id', vendorId)
            .order(sortBy, { ascending: sortOrder === 'asc' })
            .range(offset, offset + limit - 1);

        if (error) {
            logger.error('Failed to find tasks by vendor', error, { vendorId });
            throw error;
        }

        return {
            data: (data as TaskRow[]).map(row => this.toEntity(row)),
            total: count || 0,
            page,
            limit,
        };
    }

    /**
     * Find tasks by status
     */
    async findByStatus(status: TaskStatus, vendorId?: string): Promise<Task[]> {
        let query = this.supabase
            .from(this.tableName)
            .select('*')
            .eq('status', status)
            .order('due_date', { ascending: true });

        if (vendorId) {
            query = query.eq('vendor_id', vendorId);
        }

        const { data, error } = await query;

        if (error) {
            logger.error('Failed to find tasks by status', error, { status });
            throw error;
        }

        return (data as TaskRow[]).map(row => this.toEntity(row));
    }

    /**
     * Find overdue tasks
     */
    async findOverdue(vendorId?: string): Promise<Task[]> {
        const now = new Date().toISOString();

        let query = this.supabase
            .from(this.tableName)
            .select('*')
            .lt('due_date', now)
            .not('status', 'in', '("completed","verified")')
            .order('due_date', { ascending: true });

        if (vendorId) {
            query = query.eq('vendor_id', vendorId);
        }

        const { data, error } = await query;

        if (error) {
            logger.error('Failed to find overdue tasks', error);
            throw error;
        }

        return (data as TaskRow[]).map(row => this.toEntity(row));
    }

    /**
     * Find pending tasks for vendor
     */
    async findPendingForVendor(vendorId: string): Promise<Task[]> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('vendor_id', vendorId)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) {
            logger.error('Failed to find pending tasks for vendor', error, { vendorId });
            throw error;
        }

        return (data as TaskRow[]).map(row => this.toEntity(row));
    }

    /**
     * Update task status
     */
    async updateStatus(id: string, status: TaskStatus): Promise<Task> {
        const updates: Partial<TaskRow> = { status };

        if (status === 'completed') {
            updates.completed_at = new Date().toISOString();
        }

        const { data, error } = await this.supabase
            .from(this.tableName)
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            logger.error('Failed to update task status', error, { id, status });
            throw error;
        }

        return this.toEntity(data as TaskRow);
    }
}

// Export singleton instance
export const taskRepository = new TaskRepository();
