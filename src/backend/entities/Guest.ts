/**
 * Guest Entity
 * 
 * Domain model for event guests (RSVP tracking, seating management).
 */

import { BaseEntity } from './BaseEntity';

export type RSVPStatus = 'pending' | 'confirmed' | 'declined' | 'maybe';
export type GuestCategory = 'vip' | 'family' | 'friends' | 'colleagues' | 'bride_side' | 'groom_side' | 'other';

export interface GuestData {
    id: string;
    eventId: string;
    name: string;
    email?: string;
    phone?: string;
    rsvpStatus: RSVPStatus;
    rsvpDate?: string;
    plusOne: boolean;
    plusOneName?: string;
    dietaryPreferences?: string;
    specialRequirements?: string;
    category?: GuestCategory;
    tableNumber?: number;
    seatNumber?: string;
    address?: string;
    notes?: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export class Guest extends BaseEntity {
    readonly eventId: string;
    name: string;
    email?: string;
    phone?: string;
    private _rsvpStatus: RSVPStatus;
    rsvpDate?: Date;
    plusOne: boolean;
    plusOneName?: string;
    dietaryPreferences?: string;
    specialRequirements?: string;
    category?: GuestCategory;
    tableNumber?: number;
    seatNumber?: string;
    address?: string;
    notes?: string;

    constructor(data: GuestData) {
        super(data);
        this.eventId = data.eventId;
        this.name = data.name;
        this.email = data.email;
        this.phone = data.phone;
        this._rsvpStatus = data.rsvpStatus;
        this.rsvpDate = data.rsvpDate ? new Date(data.rsvpDate) : undefined;
        this.plusOne = data.plusOne;
        this.plusOneName = data.plusOneName;
        this.dietaryPreferences = data.dietaryPreferences;
        this.specialRequirements = data.specialRequirements;
        this.category = data.category;
        this.tableNumber = data.tableNumber;
        this.seatNumber = data.seatNumber;
        this.address = data.address;
        this.notes = data.notes;
    }

    // ============================================
    // GETTERS
    // ============================================

    get rsvpStatus(): RSVPStatus {
        return this._rsvpStatus;
    }

    get hasConfirmed(): boolean {
        return this._rsvpStatus === 'confirmed';
    }

    get hasDeclined(): boolean {
        return this._rsvpStatus === 'declined';
    }

    get isPending(): boolean {
        return this._rsvpStatus === 'pending';
    }

    get totalAttendees(): number {
        return this.hasConfirmed ? (this.plusOne ? 2 : 1) : 0;
    }

    // ============================================
    // BUSINESS METHODS
    // ============================================

    /**
     * Confirm RSVP
     */
    confirm(): void {
        this._rsvpStatus = 'confirmed';
        this.rsvpDate = new Date();
        this.touch();
    }

    /**
     * Decline RSVP
     */
    decline(): void {
        this._rsvpStatus = 'declined';
        this.rsvpDate = new Date();
        this.touch();
    }

    /**
     * Mark as maybe
     */
    maybe(): void {
        this._rsvpStatus = 'maybe';
        this.rsvpDate = new Date();
        this.touch();
    }

    /**
     * Assign to table
     */
    assignTable(tableNumber: number, seatNumber?: string): void {
        this.tableNumber = tableNumber;
        this.seatNumber = seatNumber;
        this.touch();
    }

    /**
     * Update dietary preferences
     */
    updateDietaryPreferences(preferences: string): void {
        this.dietaryPreferences = preferences;
        this.touch();
    }

    // ============================================
    // VALIDATION
    // ============================================

    validate(): string[] {
        const errors: string[] = [];

        if (!this.name || this.name.trim().length === 0) {
            errors.push('Guest name is required');
        }

        if (this.email && !this.isValidEmail(this.email)) {
            errors.push('Invalid email format');
        }

        if (this.plusOne && !this.plusOneName) {
            errors.push('Plus one name is required when plus one is enabled');
        }

        return errors;
    }

    private isValidEmail(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // ============================================
    // SERIALIZATION
    // ============================================

    toJSON(): GuestData {
        return {
            id: this.id,
            eventId: this.eventId,
            name: this.name,
            email: this.email,
            phone: this.phone,
            rsvpStatus: this._rsvpStatus,
            rsvpDate: this.rsvpDate?.toISOString(),
            plusOne: this.plusOne,
            plusOneName: this.plusOneName,
            dietaryPreferences: this.dietaryPreferences,
            specialRequirements: this.specialRequirements,
            category: this.category,
            tableNumber: this.tableNumber,
            seatNumber: this.seatNumber,
            address: this.address,
            notes: this.notes,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
        };
    }

    static fromDatabase(row: Record<string, unknown>): Guest {
        return new Guest({
            id: row.id as string,
            eventId: row.event_id as string,
            name: row.name as string,
            email: row.email as string | undefined,
            phone: row.phone as string | undefined,
            rsvpStatus: (row.rsvp_status as RSVPStatus) || 'pending',
            rsvpDate: row.rsvp_date as string | undefined,
            plusOne: (row.plus_one as boolean) || false,
            plusOneName: row.plus_one_name as string | undefined,
            dietaryPreferences: row.dietary_preferences as string | undefined,
            specialRequirements: row.special_requirements as string | undefined,
            category: row.category as GuestCategory | undefined,
            tableNumber: row.table_number as number | undefined,
            seatNumber: row.seat_number as string | undefined,
            address: row.address as string | undefined,
            notes: row.notes as string | undefined,
            createdAt: row.created_at as string,
            updatedAt: row.updated_at as string,
        });
    }
}
