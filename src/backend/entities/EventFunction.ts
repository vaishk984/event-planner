/**
 * EventFunction Entity
 * 
 * Represents a sub-event within a multi-day event (e.g., Mehendi, Sangeet, Wedding)
 */

import { BaseEntity, BaseEntityData } from './BaseEntity';

export type FunctionType =
    | 'wedding'
    | 'reception'
    | 'sangeet'
    | 'mehendi'
    | 'haldi'
    | 'cocktail'
    | 'after_party'
    | 'ceremony'
    | 'conference'
    | 'dinner'
    | 'custom';

export interface EventFunctionData extends BaseEntityData {
    eventId: string;
    name: string;
    type: FunctionType;
    date: string | null;
    startTime: string | null;
    endTime: string | null;
    venueName: string | null;
    venueAddress: string | null;
    guestCount: number | null;
    budget: number | null;
    notes: string | null;
    sortOrder: number;
}

export interface EventFunctionRow {
    id: string;
    event_id: string;
    name: string;
    type: string;
    date: string | null;
    start_time: string | null;
    end_time: string | null;
    venue_name: string | null;
    venue_address: string | null;
    guest_count: number | null;
    budget: number | null;
    notes: string | null;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export class EventFunction extends BaseEntity {
    private _eventId: string;
    private _name: string;
    private _type: FunctionType;
    private _date: string | null;
    private _startTime: string | null;
    private _endTime: string | null;
    private _venueName: string | null;
    private _venueAddress: string | null;
    private _guestCount: number | null;
    private _budget: number | null;
    private _notes: string | null;
    private _sortOrder: number;

    constructor(data: EventFunctionData) {
        super(data);
        this._eventId = data.eventId;
        this._name = data.name;
        this._type = data.type;
        this._date = data.date;
        this._startTime = data.startTime;
        this._endTime = data.endTime;
        this._venueName = data.venueName;
        this._venueAddress = data.venueAddress;
        this._guestCount = data.guestCount;
        this._budget = data.budget;
        this._notes = data.notes;
        this._sortOrder = data.sortOrder;
    }

    // Getters
    get eventId(): string { return this._eventId; }
    get name(): string { return this._name; }
    get type(): FunctionType { return this._type; }
    get date(): string | null { return this._date; }
    get startTime(): string | null { return this._startTime; }
    get endTime(): string | null { return this._endTime; }
    get venueName(): string | null { return this._venueName; }
    get venueAddress(): string | null { return this._venueAddress; }
    get guestCount(): number | null { return this._guestCount; }
    get budget(): number | null { return this._budget; }
    get notes(): string | null { return this._notes; }
    get sortOrder(): number { return this._sortOrder; }

    // Setters
    set name(value: string) { this._name = value; this.touch(); }
    set type(value: FunctionType) { this._type = value; this.touch(); }
    set date(value: string | null) { this._date = value; this.touch(); }
    set startTime(value: string | null) { this._startTime = value; this.touch(); }
    set endTime(value: string | null) { this._endTime = value; this.touch(); }
    set venueName(value: string | null) { this._venueName = value; this.touch(); }
    set venueAddress(value: string | null) { this._venueAddress = value; this.touch(); }
    set guestCount(value: number | null) { this._guestCount = value; this.touch(); }
    set budget(value: number | null) { this._budget = value; this.touch(); }
    set notes(value: string | null) { this._notes = value; this.touch(); }
    set sortOrder(value: number) { this._sortOrder = value; this.touch(); }

    /**
     * Get display label for function type
     */
    getTypeLabel(): string {
        const labels: Record<FunctionType, string> = {
            wedding: 'Wedding Ceremony',
            reception: 'Reception',
            sangeet: 'Sangeet',
            mehendi: 'Mehendi',
            haldi: 'Haldi',
            cocktail: 'Cocktail Party',
            after_party: 'After Party',
            ceremony: 'Ceremony',
            conference: 'Conference',
            dinner: 'Dinner',
            custom: 'Custom',
        };
        return labels[this._type];
    }

    /**
     * Convert to database row
     */
    toRow(): EventFunctionRow {
        return {
            id: this.id,
            event_id: this._eventId,
            name: this._name,
            type: this._type,
            date: this._date,
            start_time: this._startTime,
            end_time: this._endTime,
            venue_name: this._venueName,
            venue_address: this._venueAddress,
            guest_count: this._guestCount,
            budget: this._budget,
            notes: this._notes,
            sort_order: this._sortOrder,
            created_at: this.createdAt.toISOString(),
            updated_at: this.updatedAt.toISOString(),
        };
    }

    /**
     * Create from database row
     */
    static fromRow(row: EventFunctionRow): EventFunction {
        return new EventFunction({
            id: row.id,
            eventId: row.event_id,
            name: row.name,
            type: row.type as FunctionType,
            date: row.date,
            startTime: row.start_time,
            endTime: row.end_time,
            venueName: row.venue_name,
            venueAddress: row.venue_address,
            guestCount: row.guest_count,
            budget: row.budget,
            notes: row.notes,
            sortOrder: row.sort_order,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
        });
    }

    toJSON(): EventFunctionData {
        return {
            id: this.id,
            eventId: this._eventId,
            name: this._name,
            type: this._type,
            date: this._date,
            startTime: this._startTime,
            endTime: this._endTime,
            venueName: this._venueName,
            venueAddress: this._venueAddress,
            guestCount: this._guestCount,
            budget: this._budget,
            notes: this._notes,
            sortOrder: this._sortOrder,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}
