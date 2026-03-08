/**
 * Task Entity
 * 
 * Domain model for event tasks assigned to vendors.
 */

import { BaseEntity } from './BaseEntity';

export type TaskStatus = 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed' | 'verified';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TaskData {
    id: string;
    eventId: string;
    vendorId: string;
    serviceId?: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    startTime?: string;
    endTime?: string;
    dueDate?: string;
    completedAt?: string;
    proofUrls?: string[];
    notes?: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export class Task extends BaseEntity {
    readonly eventId: string;
    readonly vendorId: string;
    serviceId?: string;
    title: string;
    description?: string;
    private _status: TaskStatus;
    priority: TaskPriority;
    startTime?: Date;
    endTime?: Date;
    dueDate?: Date;
    completedAt?: Date;
    proofUrls: string[];
    notes?: string;

    constructor(data: TaskData) {
        super(data);
        this.eventId = data.eventId;
        this.vendorId = data.vendorId;
        this.serviceId = data.serviceId;
        this.title = data.title;
        this.description = data.description;
        this._status = data.status;
        this.priority = data.priority;
        this.startTime = data.startTime ? new Date(data.startTime) : undefined;
        this.endTime = data.endTime ? new Date(data.endTime) : undefined;
        this.dueDate = data.dueDate ? new Date(data.dueDate) : undefined;
        this.completedAt = data.completedAt ? new Date(data.completedAt) : undefined;
        this.proofUrls = data.proofUrls || [];
        this.notes = data.notes;
    }

    // ============================================
    // GETTERS
    // ============================================

    get status(): TaskStatus {
        return this._status;
    }

    get isCompleted(): boolean {
        return ['completed', 'verified'].includes(this._status);
    }

    get isPending(): boolean {
        return this._status === 'pending';
    }

    get isOverdue(): boolean {
        if (!this.dueDate || this.isCompleted) return false;
        return new Date() > this.dueDate;
    }

    get duration(): number | null {
        if (!this.startTime || !this.endTime) return null;
        return this.endTime.getTime() - this.startTime.getTime();
    }

    // ============================================
    // BUSINESS METHODS
    // ============================================

    private static readonly STATUS_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
        pending: ['accepted', 'rejected'],
        accepted: ['in_progress', 'rejected'],
        rejected: ['pending'], // Can be reassigned
        in_progress: ['completed'],
        completed: ['verified', 'in_progress'], // Can revert if issues
        verified: [],
    };

    canTransitionTo(newStatus: TaskStatus): boolean {
        return Task.STATUS_TRANSITIONS[this._status].includes(newStatus);
    }

    transitionTo(newStatus: TaskStatus): void {
        if (!this.canTransitionTo(newStatus)) {
            throw new Error(`Cannot transition task from ${this._status} to ${newStatus}`);
        }

        this._status = newStatus;

        if (newStatus === 'completed') {
            this.completedAt = new Date();
        }

        this.touch();
    }

    /**
     * Accept the task
     */
    accept(): void {
        this.transitionTo('accepted');
    }

    /**
     * Reject the task
     */
    reject(reason?: string): void {
        if (reason) this.notes = reason;
        this.transitionTo('rejected');
    }

    /**
     * Start working on task
     */
    start(): void {
        this.transitionTo('in_progress');
    }

    /**
     * Complete the task with proof
     */
    complete(proofUrls?: string[]): void {
        if (proofUrls) {
            this.proofUrls.push(...proofUrls);
        }
        this.transitionTo('completed');
    }

    /**
     * Verify the completed task
     */
    verify(): void {
        this.transitionTo('verified');
    }

    // ============================================
    // SERIALIZATION
    // ============================================

    toJSON(): TaskData {
        return {
            id: this.id,
            eventId: this.eventId,
            vendorId: this.vendorId,
            serviceId: this.serviceId,
            title: this.title,
            description: this.description,
            status: this._status,
            priority: this.priority,
            startTime: this.startTime?.toISOString(),
            endTime: this.endTime?.toISOString(),
            dueDate: this.dueDate?.toISOString(),
            completedAt: this.completedAt?.toISOString(),
            proofUrls: this.proofUrls,
            notes: this.notes,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
        };
    }

    static fromDatabase(row: Record<string, unknown>): Task {
        return new Task({
            id: row.id as string,
            eventId: row.event_id as string,
            vendorId: row.vendor_id as string,
            serviceId: row.service_id as string | undefined,
            title: row.title as string || 'Task',
            description: row.description as string | undefined,
            status: row.status as TaskStatus || 'pending',
            priority: row.priority as TaskPriority || 'medium',
            startTime: row.start_time as string | undefined,
            endTime: row.end_time as string | undefined,
            dueDate: row.due_date as string | undefined,
            completedAt: row.completed_at as string | undefined,
            proofUrls: row.proof_urls as string[] || [],
            notes: row.notes as string | undefined,
            createdAt: row.created_at as string,
            updatedAt: row.updated_at as string,
        });
    }
}
