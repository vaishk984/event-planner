/**
 * Client Entity
 * 
 * CRM data for event clients
 */

import { BaseEntity, BaseEntityData } from './BaseEntity';

export type ClientStatus = 'prospect' | 'active' | 'past' | 'inactive';

export interface ClientPreferences {
    communicationMethod: 'email' | 'phone' | 'whatsapp';
    budgetRange: { min: number; max: number } | null;
    preferredVenues: string[];
    dietaryRestrictions: string[];
    notes: string;
}

export interface ClientData extends BaseEntityData {
    plannerId: string;

    name: string;
    email: string | null;
    phone: string | null;
    alternatePhone: string | null;

    status: ClientStatus;

    address: string | null;
    city: string | null;
    state: string | null;

    preferences: ClientPreferences;

    totalEvents: number;
    totalSpend: number;
    currency: string;

    referralSource: string | null;
    notes: string | null;
}

export interface ClientRow {
    id: string;
    planner_id: string;
    name: string;
    email: string | null;
    phone: string | null;
    alternate_phone: string | null;
    status: string;
    address: string | null;
    city: string | null;
    state: string | null;
    preferences: string; // JSON
    total_events: number;
    total_spend: number;
    currency: string;
    referral_source: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export class Client extends BaseEntity {
    private _plannerId: string;
    private _name: string;
    private _email: string | null;
    private _phone: string | null;
    private _alternatePhone: string | null;
    private _status: ClientStatus;
    private _address: string | null;
    private _city: string | null;
    private _state: string | null;
    private _preferences: ClientPreferences;
    private _totalEvents: number;
    private _totalSpend: number;
    private _currency: string;
    private _referralSource: string | null;
    private _notes: string | null;

    constructor(data: ClientData) {
        super(data);
        this._plannerId = data.plannerId;
        this._name = data.name;
        this._email = data.email;
        this._phone = data.phone;
        this._alternatePhone = data.alternatePhone;
        this._status = data.status;
        this._address = data.address;
        this._city = data.city;
        this._state = data.state;
        this._preferences = data.preferences;
        this._totalEvents = data.totalEvents;
        this._totalSpend = data.totalSpend;
        this._currency = data.currency;
        this._referralSource = data.referralSource;
        this._notes = data.notes;
    }

    // Getters
    get plannerId(): string { return this._plannerId; }
    get name(): string { return this._name; }
    get email(): string | null { return this._email; }
    get phone(): string | null { return this._phone; }
    get alternatePhone(): string | null { return this._alternatePhone; }
    get status(): ClientStatus { return this._status; }
    get address(): string | null { return this._address; }
    get city(): string | null { return this._city; }
    get state(): string | null { return this._state; }
    get preferences(): ClientPreferences { return { ...this._preferences }; }
    get totalEvents(): number { return this._totalEvents; }
    get totalSpend(): number { return this._totalSpend; }
    get currency(): string { return this._currency; }
    get referralSource(): string | null { return this._referralSource; }
    get notes(): string | null { return this._notes; }

    // Setters
    set name(value: string) { this._name = value; this.touch(); }
    set email(value: string | null) { this._email = value; this.touch(); }
    set phone(value: string | null) { this._phone = value; this.touch(); }
    set alternatePhone(value: string | null) { this._alternatePhone = value; this.touch(); }
    set status(value: ClientStatus) { this._status = value; this.touch(); }
    set address(value: string | null) { this._address = value; this.touch(); }
    set city(value: string | null) { this._city = value; this.touch(); }
    set state(value: string | null) { this._state = value; this.touch(); }
    set notes(value: string | null) { this._notes = value; this.touch(); }

    /**
     * Update preferences
     */
    updatePreferences(updates: Partial<ClientPreferences>): void {
        this._preferences = { ...this._preferences, ...updates };
        this.touch();
    }

    /**
     * Record new event
     */
    recordEvent(amount: number): void {
        this._totalEvents++;
        this._totalSpend += amount;
        this._status = 'active';
        this.touch();
    }

    /**
     * Get average spend per event
     */
    getAverageSpend(): number {
        if (this._totalEvents === 0) return 0;
        return this._totalSpend / this._totalEvents;
    }

    /**
     * Is high-value client?
     */
    isHighValue(threshold: number = 500000): boolean {
        return this._totalSpend >= threshold;
    }

    /**
     * Get display location
     */
    getDisplayLocation(): string {
        const parts = [this._city, this._state].filter(Boolean);
        return parts.join(', ') || 'Location not set';
    }

    /**
     * Get status label
     */
    getStatusLabel(): string {
        const labels: Record<ClientStatus, string> = {
            prospect: 'Prospect',
            active: 'Active Client',
            past: 'Past Client',
            inactive: 'Inactive',
        };
        return labels[this._status];
    }

    toRow(): ClientRow {
        return {
            id: this.id,
            planner_id: this._plannerId,
            name: this._name,
            email: this._email,
            phone: this._phone,
            alternate_phone: this._alternatePhone,
            status: this._status,
            address: this._address,
            city: this._city,
            state: this._state,
            preferences: JSON.stringify(this._preferences),
            total_events: this._totalEvents,
            total_spend: this._totalSpend,
            currency: this._currency,
            referral_source: this._referralSource,
            notes: this._notes,
            created_at: this.createdAt.toISOString(),
            updated_at: this.updatedAt.toISOString(),
        };
    }

    static fromRow(row: ClientRow): Client {
        return new Client({
            id: row.id,
            plannerId: row.planner_id,
            name: row.name,
            email: row.email,
            phone: row.phone,
            alternatePhone: row.alternate_phone,
            status: row.status as ClientStatus,
            address: row.address,
            city: row.city,
            state: row.state,
            preferences: JSON.parse(row.preferences || '{}'),
            totalEvents: row.total_events,
            totalSpend: row.total_spend,
            currency: row.currency,
            referralSource: row.referral_source,
            notes: row.notes,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
        });
    }

    toJSON(): ClientData {
        return {
            id: this.id,
            plannerId: this._plannerId,
            name: this._name,
            email: this._email,
            phone: this._phone,
            alternatePhone: this._alternatePhone,
            status: this._status,
            address: this._address,
            city: this._city,
            state: this._state,
            preferences: this._preferences,
            totalEvents: this._totalEvents,
            totalSpend: this._totalSpend,
            currency: this._currency,
            referralSource: this._referralSource,
            notes: this._notes,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}
