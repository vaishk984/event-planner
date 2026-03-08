/**
 * Lead Entity
 * 
 * Domain model for sales leads.
 */

import { BaseEntity } from './BaseEntity';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'converted' | 'lost';
export type LeadSource = 'website' | 'referral' | 'social_media' | 'advertisement' | 'other';

export interface LeadData {
    id: string;
    plannerId: string;
    name: string;
    email: string;
    phone?: string;
    eventType: string;
    budgetRange?: string;
    eventDate?: string;
    source: LeadSource;
    score: number;
    status: LeadStatus;
    notes?: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export class Lead extends BaseEntity {
    readonly plannerId: string;
    name: string;
    email: string;
    phone?: string;
    eventType: string;
    budgetRange?: string;
    eventDate?: Date;
    source: LeadSource;
    private _score: number;
    private _status: LeadStatus;
    notes?: string;

    constructor(data: LeadData) {
        super(data);
        this.plannerId = data.plannerId;
        this.name = data.name;
        this.email = data.email;
        this.phone = data.phone;
        this.eventType = data.eventType;
        this.budgetRange = data.budgetRange;
        this.eventDate = data.eventDate ? new Date(data.eventDate) : undefined;
        this.source = data.source;
        this._score = data.score;
        this._status = data.status;
        this.notes = data.notes;
    }

    // ============================================
    // GETTERS
    // ============================================

    get status(): LeadStatus {
        return this._status;
    }

    get score(): number {
        return this._score;
    }

    get isHotLead(): boolean {
        return this._score >= 70;
    }

    get isQualified(): boolean {
        return ['qualified', 'proposal_sent', 'converted'].includes(this._status);
    }

    get priorityLevel(): 'high' | 'medium' | 'low' {
        if (this._score >= 70) return 'high';
        if (this._score >= 40) return 'medium';
        return 'low';
    }

    // ============================================
    // BUSINESS METHODS
    // ============================================

    /**
     * Update lead score
     */
    updateScore(newScore: number): void {
        this._score = Math.max(0, Math.min(100, newScore));
        this.touch();
    }

    /**
     * Transition lead status
     */
    transitionTo(newStatus: LeadStatus): void {
        this._status = newStatus;
        this.touch();
    }

    /**
     * Convert lead to event (returns data for event creation)
     */
    toEventData(): Partial<Record<string, unknown>> {
        return {
            plannerId: this.plannerId,
            name: `${this.name}'s ${this.eventType}`,
            type: this.eventType.toLowerCase(),
            date: this.eventDate?.toISOString(),
        };
    }

    // ============================================
    // SERIALIZATION
    // ============================================

    toJSON(): LeadData {
        return {
            id: this.id,
            plannerId: this.plannerId,
            name: this.name,
            email: this.email,
            phone: this.phone,
            eventType: this.eventType,
            budgetRange: this.budgetRange,
            eventDate: this.eventDate?.toISOString(),
            source: this.source,
            score: this._score,
            status: this._status,
            notes: this.notes,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
        };
    }

    static fromDatabase(row: Record<string, unknown>): Lead {
        return new Lead({
            id: row.id as string,
            plannerId: row.planner_id as string,
            name: row.name as string,
            email: row.email as string,
            phone: row.phone as string | undefined,
            eventType: row.event_type as string,
            budgetRange: row.budget_range as string | undefined,
            eventDate: row.event_date as string | undefined,
            source: row.source as LeadSource,
            score: row.score as number || 0,
            status: row.status as LeadStatus || 'new',
            notes: row.notes as string | undefined,
            createdAt: row.created_at as string,
            updatedAt: row.updated_at as string,
        });
    }
}
