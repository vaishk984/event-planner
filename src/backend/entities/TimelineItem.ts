/**
 * TimelineItem Entity
 * 
 * Represents an activity in an event's run sheet/timeline.
 * Each function (Mehendi, Wedding, Reception) has its own timeline.
 */

import { BaseEntity, BaseEntityData } from './BaseEntity';
import { BusinessException } from '../exceptions';

// ============================================
// TYPES
// ============================================

export type TimelineItemStatus = 'pending' | 'in_progress' | 'completed' | 'delayed';

export interface TimelineItemData extends BaseEntityData {
    eventId: string;
    functionId: string;

    startTime: string;       // "06:00" (24h format)
    endTime?: string | null;
    duration?: number | null; // minutes

    title: string;
    description?: string | null;
    location?: string | null;

    owner: string;           // "Decorator", "DJ", "Coordinator"
    vendorId?: string | null;

    status: TimelineItemStatus;
    notes?: string | null;

    dependsOn?: string[] | null;
    sortOrder: number;
}

// ============================================
// STATUS TRANSITIONS
// ============================================

const VALID_TRANSITIONS: Record<TimelineItemStatus, TimelineItemStatus[]> = {
    pending: ['in_progress', 'delayed'],
    in_progress: ['completed', 'delayed'],
    completed: [],  // Terminal state
    delayed: ['in_progress', 'pending'],
};

// ============================================
// ENTITY CLASS
// ============================================

export class TimelineItem extends BaseEntity {
    readonly eventId: string;
    readonly functionId: string;

    private _startTime: string;
    private _endTime?: string | null;
    private _duration?: number | null;

    private _title: string;
    private _description?: string | null;
    private _location?: string | null;

    private _owner: string;
    private _vendorId?: string | null;

    private _status: TimelineItemStatus;
    private _notes?: string | null;

    private _dependsOn?: string[] | null;
    private _sortOrder: number;

    constructor(data: TimelineItemData) {
        super(data);
        this.eventId = data.eventId;
        this.functionId = data.functionId;
        this._startTime = data.startTime;
        this._endTime = data.endTime;
        this._duration = data.duration;
        this._title = data.title;
        this._description = data.description;
        this._location = data.location;
        this._owner = data.owner;
        this._vendorId = data.vendorId;
        this._status = data.status;
        this._notes = data.notes;
        this._dependsOn = data.dependsOn;
        this._sortOrder = data.sortOrder;
    }

    // ============================================
    // GETTERS
    // ============================================

    get startTime(): string { return this._startTime; }
    get endTime(): string | null | undefined { return this._endTime; }
    get duration(): number | null | undefined { return this._duration; }
    get title(): string { return this._title; }
    get description(): string | null | undefined { return this._description; }
    get location(): string | null | undefined { return this._location; }
    get owner(): string { return this._owner; }
    get vendorId(): string | null | undefined { return this._vendorId; }
    get status(): TimelineItemStatus { return this._status; }
    get notes(): string | null | undefined { return this._notes; }
    get dependsOn(): string[] | null | undefined { return this._dependsOn; }
    get sortOrder(): number { return this._sortOrder; }

    // ============================================
    // STATUS HELPERS
    // ============================================

    get isPending(): boolean { return this._status === 'pending'; }
    get isInProgress(): boolean { return this._status === 'in_progress'; }
    get isCompleted(): boolean { return this._status === 'completed'; }
    get isDelayed(): boolean { return this._status === 'delayed'; }

    /**
     * Check if status transition is valid
     */
    canTransitionTo(newStatus: TimelineItemStatus): boolean {
        return VALID_TRANSITIONS[this._status].includes(newStatus);
    }

    /**
     * Transition to new status
     */
    transitionTo(newStatus: TimelineItemStatus): void {
        if (!this.canTransitionTo(newStatus)) {
            throw new BusinessException(
                `Cannot transition from '${this._status}' to '${newStatus}'`
            );
        }
        this._status = newStatus;
    }

    // ============================================
    // TIME HELPERS
    // ============================================

    /**
     * Calculate end time from start time and duration
     */
    getCalculatedEndTime(): string | null {
        if (this._endTime) return this._endTime;
        if (!this._duration) return null;

        const [hours, minutes] = this._startTime.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + this._duration;
        const endHours = Math.floor(totalMinutes / 60) % 24;
        const endMinutes = totalMinutes % 60;

        return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
    }

    /**
     * Get duration in minutes
     */
    getDurationMinutes(): number | null {
        if (this._duration) return this._duration;
        if (!this._endTime) return null;

        const [startH, startM] = this._startTime.split(':').map(Number);
        const [endH, endM] = this._endTime.split(':').map(Number);

        return (endH * 60 + endM) - (startH * 60 + startM);
    }

    /**
     * Check if this item is currently active based on current time
     */
    isActiveAt(currentTime: string): boolean {
        const endTime = this.getCalculatedEndTime();
        if (!endTime) return false;

        return currentTime >= this._startTime && currentTime < endTime;
    }

    // ============================================
    // SETTERS
    // ============================================

    updateDetails(data: Partial<Pick<TimelineItemData,
        'title' | 'description' | 'location' | 'owner' | 'vendorId' | 'notes'
    >>): void {
        if (data.title !== undefined) this._title = data.title;
        if (data.description !== undefined) this._description = data.description;
        if (data.location !== undefined) this._location = data.location;
        if (data.owner !== undefined) this._owner = data.owner;
        if (data.vendorId !== undefined) this._vendorId = data.vendorId;
        if (data.notes !== undefined) this._notes = data.notes;
    }

    updateTiming(data: Partial<Pick<TimelineItemData,
        'startTime' | 'endTime' | 'duration'
    >>): void {
        if (data.startTime !== undefined) this._startTime = data.startTime;
        if (data.endTime !== undefined) this._endTime = data.endTime;
        if (data.duration !== undefined) this._duration = data.duration;
    }

    setSortOrder(order: number): void {
        this._sortOrder = order;
    }

    setDependencies(dependencies: string[]): void {
        this._dependsOn = dependencies;
    }

    // ============================================
    // SERIALIZATION
    // ============================================

    toJSON(): TimelineItemData {
        return {
            id: this.id,
            eventId: this.eventId,
            functionId: this.functionId,
            startTime: this._startTime,
            endTime: this._endTime,
            duration: this._duration,
            title: this._title,
            description: this._description,
            location: this._location,
            owner: this._owner,
            vendorId: this._vendorId,
            status: this._status,
            notes: this._notes,
            dependsOn: this._dependsOn,
            sortOrder: this._sortOrder,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }

    /**
     * Create from database row
     */
    static fromDatabase(row: Record<string, unknown>): TimelineItem {
        return new TimelineItem({
            id: row.id as string,
            eventId: row.event_id as string,
            functionId: row.function_id as string,
            startTime: row.start_time as string,
            endTime: row.end_time as string | null,
            duration: row.duration as number | null,
            title: row.title as string,
            description: row.description as string | null,
            location: row.location as string | null,
            owner: row.owner as string,
            vendorId: row.vendor_id as string | null,
            status: row.status as TimelineItemStatus,
            notes: row.notes as string | null,
            dependsOn: row.depends_on as string[] | null,
            sortOrder: row.sort_order as number,
            createdAt: new Date(row.created_at as string),
            updatedAt: new Date(row.updated_at as string),
        });
    }

    /**
     * Convert to database row
     */
    toDatabaseRow(): Record<string, unknown> {
        return {
            id: this.id,
            event_id: this.eventId,
            function_id: this.functionId,
            start_time: this._startTime,
            end_time: this._endTime,
            duration: this._duration,
            title: this._title,
            description: this._description,
            location: this._location,
            owner: this._owner,
            vendor_id: this._vendorId,
            status: this._status,
            notes: this._notes,
            depends_on: this._dependsOn,
            sort_order: this._sortOrder,
        };
    }
}
