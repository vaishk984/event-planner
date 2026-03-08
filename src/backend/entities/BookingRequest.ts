/**
 * BookingRequest Entity
 * 
 * Represents the connection between a Planner and Vendor for an event.
 * Tracks the entire lifecycle: quote request → negotiation → booking → completion
 */

import { BaseEntity, BaseEntityData } from './BaseEntity';

export type BookingStatus =
    | 'draft'
    | 'quote_requested'
    | 'quote_received'
    | 'negotiating'
    | 'confirmed'
    | 'deposit_paid'
    | 'in_progress'
    | 'completed'
    | 'cancelled'
    | 'declined';

export interface PaymentMilestone {
    id: string;
    name: string;
    amount: number;
    dueDate: string;
    paidDate: string | null;
    status: 'pending' | 'paid' | 'overdue';
}

export interface BookingRequestData extends BaseEntityData {
    eventId: string;
    functionId: string | null;
    vendorId: string;
    plannerId: string;

    status: BookingStatus;
    service: string; // Renamed from serviceCategory to service
    serviceDetails: string | null;

    quotedAmount: number | null;
    agreedAmount: number | null;
    currency: string;

    paymentSchedule: PaymentMilestone[];

    requestedDate: Date;
    responseDate: Date | null;
    confirmationDate: Date | null;

    notes: string | null;
    internalNotes: string | null;
}

export interface BookingRequestRow {
    id: string;
    event_id: string;
    function_id: string | null;
    vendor_id: string;
    planner_id: string;
    status: string;
    service: string;
    service_details: string | null;
    quoted_amount: number | null;
    agreed_amount: number | null;
    currency: string;
    payment_schedule: string; // JSON
    requested_date: string;
    response_date: string | null;
    confirmation_date: string | null;
    notes: string | null;
    internal_notes: string | null;
    created_at: string;
    updated_at: string;
}

export class BookingRequest extends BaseEntity {
    private _eventId: string;
    private _functionId: string | null;
    private _vendorId: string;
    private _plannerId: string;
    private _status: BookingStatus;
    private _service: string; // Renamed from _serviceCategory
    private _serviceDetails: string | null;
    private _quotedAmount: number | null;
    private _agreedAmount: number | null;
    private _currency: string;
    private _paymentSchedule: PaymentMilestone[];
    private _requestedDate: Date;
    private _responseDate: Date | null;
    private _confirmationDate: Date | null;
    private _notes: string | null;
    private _internalNotes: string | null;

    // Valid status transitions
    private static readonly STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
        draft: ['quote_requested', 'cancelled'],
        quote_requested: ['quote_received', 'declined', 'cancelled'],
        quote_received: ['negotiating', 'confirmed', 'declined', 'cancelled'],
        negotiating: ['confirmed', 'declined', 'cancelled'],
        confirmed: ['deposit_paid', 'cancelled'],
        deposit_paid: ['in_progress', 'cancelled'],
        in_progress: ['completed', 'cancelled'],
        completed: [],
        cancelled: [],
        declined: [],
    };

    constructor(data: BookingRequestData) {
        super(data);
        this._eventId = data.eventId;
        this._functionId = data.functionId;
        this._vendorId = data.vendorId;
        this._plannerId = data.plannerId;
        this._status = data.status;
        this._service = data.service;
        this._serviceDetails = data.serviceDetails;
        this._quotedAmount = data.quotedAmount;
        this._agreedAmount = data.agreedAmount;
        this._currency = data.currency;
        this._paymentSchedule = data.paymentSchedule;
        this._requestedDate = data.requestedDate;
        this._responseDate = data.responseDate;
        this._confirmationDate = data.confirmationDate;
        this._notes = data.notes;
        this._internalNotes = data.internalNotes;
    }

    // Getters
    get eventId(): string { return this._eventId; }
    get functionId(): string | null { return this._functionId; }
    get vendorId(): string { return this._vendorId; }
    get plannerId(): string { return this._plannerId; }
    get status(): BookingStatus { return this._status; }
    get service(): string { return this._service; } // Renamed getter
    get serviceDetails(): string | null { return this._serviceDetails; }
    get quotedAmount(): number | null { return this._quotedAmount; }
    get agreedAmount(): number | null { return this._agreedAmount; }
    get currency(): string { return this._currency; }
    get paymentSchedule(): PaymentMilestone[] { return [...this._paymentSchedule]; }
    get requestedDate(): Date { return this._requestedDate; }
    get responseDate(): Date | null { return this._responseDate; }
    get confirmationDate(): Date | null { return this._confirmationDate; }
    get notes(): string | null { return this._notes; }
    get internalNotes(): string | null { return this._internalNotes; }

    // Setters
    set serviceDetails(value: string | null) { this._serviceDetails = value; this.touch(); }
    set notes(value: string | null) { this._notes = value; this.touch(); }
    set internalNotes(value: string | null) { this._internalNotes = value; this.touch(); }

    /**
     * Check if status transition is valid
     */
    canTransitionTo(newStatus: BookingStatus): boolean {
        return BookingRequest.STATUS_TRANSITIONS[this._status].includes(newStatus);
    }

    /**
     * Transition to new status
     */
    transitionTo(newStatus: BookingStatus): void {
        if (!this.canTransitionTo(newStatus)) {
            throw new Error(`Cannot transition from ${this._status} to ${newStatus}`);
        }
        this._status = newStatus;

        if (newStatus === 'quote_received') {
            this._responseDate = new Date();
        } else if (newStatus === 'confirmed') {
            this._confirmationDate = new Date();
        }

        this.touch();
    }

    /**
     * Submit quote (vendor action)
     */
    submitQuote(amount: number): void {
        if (this._status !== 'quote_requested') {
            throw new Error('Can only submit quote when status is quote_requested');
        }
        this._quotedAmount = amount;
        this.transitionTo('quote_received');
    }

    /**
     * Accept quote (planner action)
     */
    acceptQuote(agreedAmount?: number): void {
        if (this._status !== 'quote_received' && this._status !== 'negotiating') {
            throw new Error('Can only accept quote when in quote_received or negotiating status');
        }
        this._agreedAmount = agreedAmount ?? this._quotedAmount;
        this.transitionTo('confirmed');
    }

    /**
     * Add payment milestone
     */
    addPaymentMilestone(milestone: Omit<PaymentMilestone, 'id' | 'status'>): void {
        const id = crypto.randomUUID();
        this._paymentSchedule.push({
            id,
            ...milestone,
            status: 'pending',
        });
        this.touch();
    }

    /**
     * Mark milestone as paid
     */
    markMilestonePaid(milestoneId: string): void {
        const milestone = this._paymentSchedule.find(m => m.id === milestoneId);
        if (!milestone) throw new Error('Milestone not found');
        milestone.paidDate = new Date().toISOString();
        milestone.status = 'paid';
        this.touch();
    }

    /**
     * Calculate total paid
     */
    getTotalPaid(): number {
        return this._paymentSchedule
            .filter(m => m.status === 'paid')
            .reduce((sum, m) => sum + m.amount, 0);
    }

    /**
     * Calculate outstanding balance
     */
    getOutstandingBalance(): number {
        return (this._agreedAmount ?? 0) - this.getTotalPaid();
    }

    /**
     * Is fully paid?
     */
    isFullyPaid(): boolean {
        return this.getOutstandingBalance() <= 0;
    }

    /**
     * Get status display label
     */
    getStatusLabel(): string {
        const labels: Record<BookingStatus, string> = {
            draft: 'Draft',
            quote_requested: 'Quote Requested',
            quote_received: 'Quote Received',
            negotiating: 'Negotiating',
            confirmed: 'Confirmed',
            deposit_paid: 'Deposit Paid',
            in_progress: 'In Progress',
            completed: 'Completed',
            cancelled: 'Cancelled',
            declined: 'Declined',
        };
        return labels[this._status];
    }

    toRow(): BookingRequestRow {
        return {
            id: this.id,
            event_id: this._eventId,
            function_id: this._functionId,
            vendor_id: this._vendorId,
            planner_id: this._plannerId,
            status: this._status,
            service: this._service,
            service_details: this._serviceDetails,
            quoted_amount: this._quotedAmount,
            agreed_amount: this._agreedAmount,
            currency: this._currency,
            payment_schedule: JSON.stringify(this._paymentSchedule),
            requested_date: this._requestedDate.toISOString(),
            response_date: this._responseDate?.toISOString() ?? null,
            confirmation_date: this._confirmationDate?.toISOString() ?? null,
            notes: this._notes,
            internal_notes: this._internalNotes,
            created_at: this.createdAt.toISOString(),
            updated_at: this.updatedAt.toISOString(),
        };
    }

    static fromRow(row: BookingRequestRow): BookingRequest {
        return new BookingRequest({
            id: row.id,
            eventId: row.event_id,
            functionId: row.function_id,
            vendorId: row.vendor_id,
            plannerId: row.planner_id,
            status: row.status as BookingStatus,
            service: row.service,
            serviceDetails: row.service_details,
            quotedAmount: row.quoted_amount,
            agreedAmount: row.agreed_amount,
            currency: row.currency,
            paymentSchedule: JSON.parse(row.payment_schedule || '[]'),
            requestedDate: new Date(row.requested_date),
            responseDate: row.response_date ? new Date(row.response_date) : null,
            confirmationDate: row.confirmation_date ? new Date(row.confirmation_date) : null,
            notes: row.notes,
            internalNotes: row.internal_notes,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
        });
    }

    toJSON(): BookingRequestData {
        return {
            id: this.id,
            eventId: this._eventId,
            functionId: this._functionId,
            vendorId: this._vendorId,
            plannerId: this._plannerId,
            status: this._status,
            service: this._service,
            serviceDetails: this._serviceDetails,
            quotedAmount: this._quotedAmount,
            agreedAmount: this._agreedAmount,
            currency: this._currency,
            paymentSchedule: this._paymentSchedule,
            requestedDate: this._requestedDate,
            responseDate: this._responseDate,
            confirmationDate: this._confirmationDate,
            notes: this._notes,
            internalNotes: this._internalNotes,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}
