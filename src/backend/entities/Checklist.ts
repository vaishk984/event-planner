/**
 * Checklist Entity
 * 
 * Domain model for event checklists (task templates per event type).
 */

import { BaseEntity } from './BaseEntity';

export type ChecklistPriority = 'low' | 'medium' | 'high' | 'critical';
export type ChecklistCategory = 'venue' | 'catering' | 'decor' | 'logistics' | 'entertainment' | 'photography' | 'other';

export interface ChecklistData {
    id: string;
    eventId: string;
    title: string;
    description?: string;
    category?: ChecklistCategory;
    isCompleted: boolean;
    completedAt?: string;
    completedBy?: string;
    priority?: ChecklistPriority;
    dueDate?: string;
    sortOrder: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export class Checklist extends BaseEntity {
    readonly eventId: string;
    title: string;
    description?: string;
    category?: ChecklistCategory;
    private _isCompleted: boolean;
    completedAt?: Date;
    completedBy?: string;
    priority: ChecklistPriority;
    dueDate?: Date;
    sortOrder: number;

    constructor(data: ChecklistData) {
        super(data);
        this.eventId = data.eventId;
        this.title = data.title;
        this.description = data.description;
        this.category = data.category;
        this._isCompleted = data.isCompleted;
        this.completedAt = data.completedAt ? new Date(data.completedAt) : undefined;
        this.completedBy = data.completedBy;
        this.priority = data.priority || 'medium';
        this.dueDate = data.dueDate ? new Date(data.dueDate) : undefined;
        this.sortOrder = data.sortOrder;
    }

    // ============================================
    // GETTERS
    // ============================================

    get isCompleted(): boolean {
        return this._isCompleted;
    }

    get isOverdue(): boolean {
        if (!this.dueDate || this._isCompleted) return false;
        return new Date() > this.dueDate;
    }

    get isDueSoon(): boolean {
        if (!this.dueDate || this._isCompleted) return false;
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
        return this.dueDate <= threeDaysFromNow;
    }

    // ============================================
    // BUSINESS METHODS
    // ============================================

    /**
     * Mark as completed
     */
    complete(userId: string): void {
        this._isCompleted = true;
        this.completedAt = new Date();
        this.completedBy = userId;
        this.touch();
    }

    /**
     * Mark as incomplete
     */
    uncomplete(): void {
        this._isCompleted = false;
        this.completedAt = undefined;
        this.completedBy = undefined;
        this.touch();
    }

    /**
     * Update priority
     */
    setPriority(priority: ChecklistPriority): void {
        this.priority = priority;
        this.touch();
    }

    /**
     * Update due date
     */
    setDueDate(dueDate: Date): void {
        this.dueDate = dueDate;
        this.touch();
    }

    /**
     * Reorder
     */
    updateSortOrder(newOrder: number): void {
        this.sortOrder = newOrder;
        this.touch();
    }

    // ============================================
    // VALIDATION
    // ============================================

    validate(): string[] {
        const errors: string[] = [];

        if (!this.title || this.title.trim().length === 0) {
            errors.push('Checklist title is required');
        }

        if (this.dueDate && this.dueDate < new Date() && !this._isCompleted) {
            errors.push('Due date cannot be in the past for incomplete items');
        }

        return errors;
    }

    // ============================================
    // SERIALIZATION
    // ============================================

    toJSON(): ChecklistData {
        return {
            id: this.id,
            eventId: this.eventId,
            title: this.title,
            description: this.description,
            category: this.category,
            isCompleted: this._isCompleted,
            completedAt: this.completedAt?.toISOString(),
            completedBy: this.completedBy,
            priority: this.priority,
            dueDate: this.dueDate?.toISOString(),
            sortOrder: this.sortOrder,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
        };
    }

    static fromDatabase(row: Record<string, unknown>): Checklist {
        return new Checklist({
            id: row.id as string,
            eventId: row.event_id as string,
            title: row.title as string,
            description: row.description as string | undefined,
            category: row.category as ChecklistCategory | undefined,
            isCompleted: (row.is_completed as boolean) || false,
            completedAt: row.completed_at as string | undefined,
            completedBy: row.completed_by as string | undefined,
            priority: (row.priority as ChecklistPriority) || 'medium',
            dueDate: row.due_date as string | undefined,
            sortOrder: (row.sort_order as number) || 0,
            createdAt: row.created_at as string,
            updatedAt: row.updated_at as string,
        });
    }
}
