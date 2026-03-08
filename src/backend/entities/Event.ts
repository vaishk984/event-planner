/**
 * Event Entity
 * 
 * Domain model for events.
 * Similar to a JPA @Entity class.
 */

import { BaseEntity } from './BaseEntity';

export type EventType = 'wedding' | 'corporate' | 'birthday' | 'social' | 'other';
export type EventStatus = 'draft' | 'planning' | 'proposed' | 'approved' | 'live' | 'completed' | 'archived' | 'cancelled';
export type VenueType = 'personal' | 'showroom';

export interface EventData {
    id: string;
    plannerId: string;
    clientId?: string;
    name: string;
    type: EventType;
    status: EventStatus;
    date: string;
    endDate?: string;
    guestCount: number;
    budgetMin: number;
    budgetMax: number;
    city: string;
    venueType: VenueType;
    venueId?: string;
    notes?: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export class Event extends BaseEntity {
    readonly plannerId: string;
    clientId?: string;
    name: string;
    type: EventType;
    private _status: EventStatus;
    date: Date;
    endDate?: Date;
    guestCount: number;
    budgetMin: number;
    budgetMax: number;
    city: string;
    venueType: VenueType;
    venueId?: string;
    notes?: string;

    constructor(data: EventData) {
        super(data);
        this.plannerId = data.plannerId;
        this.clientId = data.clientId;
        this.name = data.name;
        this.type = data.type;
        this._status = data.status;
        this.date = new Date(data.date);
        this.endDate = data.endDate ? new Date(data.endDate) : undefined;
        this.guestCount = data.guestCount;
        this.budgetMin = data.budgetMin;
        this.budgetMax = data.budgetMax;
        this.city = data.city;
        this.venueType = data.venueType;
        this.venueId = data.venueId;
        this.notes = data.notes;
    }

    // ============================================
    // GETTERS
    // ============================================

    get status(): EventStatus {
        return this._status;
    }

    get budget(): { min: number; max: number; average: number } {
        return {
            min: this.budgetMin,
            max: this.budgetMax,
            average: (this.budgetMin + this.budgetMax) / 2,
        };
    }

    get isLocked(): boolean {
        return ['approved', 'live', 'completed', 'archived'].includes(this._status);
    }

    get isEditable(): boolean {
        return ['draft', 'planning'].includes(this._status);
    }

    get daysUntilEvent(): number {
        const now = new Date();
        const diff = this.date.getTime() - now.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    // ============================================
    // BUSINESS METHODS
    // ============================================

    /**
     * Allowed status transitions (state machine)
     */
    private static readonly STATUS_TRANSITIONS: Record<EventStatus, EventStatus[]> = {
        draft: ['planning', 'archived', 'cancelled'],
        planning: ['proposed', 'draft', 'cancelled'],
        proposed: ['approved', 'planning', 'cancelled'],
        approved: ['live', 'cancelled'],
        live: ['completed'],
        completed: ['archived'],
        archived: [],
        cancelled: ['archived'],
    };

    /**
     * Check if transition to new status is allowed
     */
    canTransitionTo(newStatus: EventStatus): boolean {
        return Event.STATUS_TRANSITIONS[this._status].includes(newStatus);
    }

    /**
     * Transition to new status
     */
    transitionTo(newStatus: EventStatus): void {
        if (!this.canTransitionTo(newStatus)) {
            throw new Error(`Cannot transition from ${this._status} to ${newStatus}`);
        }
        this._status = newStatus;
        this.touch();
    }

    /**
     * Check if can send proposal
     */
    canSendProposal(): boolean {
        return this._status === 'planning';
    }

    /**
     * Check if can be approved
     */
    canApprove(): boolean {
        return this._status === 'proposed';
    }

    // ============================================
    // SERIALIZATION
    // ============================================

    toJSON(): EventData {
        return {
            id: this.id,
            plannerId: this.plannerId,
            clientId: this.clientId,
            name: this.name,
            type: this.type,
            status: this._status,
            date: this.date.toISOString(),
            endDate: this.endDate?.toISOString(),
            guestCount: this.guestCount,
            budgetMin: this.budgetMin,
            budgetMax: this.budgetMax,
            city: this.city,
            venueType: this.venueType,
            venueId: this.venueId,
            notes: this.notes,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
        };
    }

    /**
     * Create Event from database row
     */
    static fromDatabase(row: Record<string, unknown>): Event {
        return new Event({
            id: row.id as string,
            plannerId: row.planner_id as string,
            clientId: row.client_id as string | undefined,
            name: row.name as string || 'Untitled Event',
            type: row.type as EventType,
            status: row.status as EventStatus,
            date: row.date as string,
            endDate: row.end_date as string | undefined,
            guestCount: row.guest_count as number,
            budgetMin: row.budget_min as number || row.budget as number || 0,
            budgetMax: row.budget_max as number || row.budget as number || 0,
            city: row.city as string || '',
            venueType: row.venue_type as VenueType || 'personal',
            venueId: row.venue_id as string | undefined,
            notes: row.notes as string | undefined,
            createdAt: row.created_at as string,
            updatedAt: row.updated_at as string,
        });
    }
}
