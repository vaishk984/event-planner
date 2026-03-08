/**
 * Payment Entity
 * 
 * Tracks all money movements (client payments and vendor payments)
 */

import { BaseEntity, BaseEntityData } from './BaseEntity';

export type PaymentType = 'client_payment' | 'vendor_payment' | 'refund' | 'expense';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type PaymentMethod = 'bank_transfer' | 'cash' | 'cheque' | 'upi' | 'card' | 'other';

export interface PaymentData extends BaseEntityData {
    eventId: string;
    bookingRequestId: string | null;
    budgetItemId: string | null;

    type: PaymentType;
    status: PaymentStatus;
    method: PaymentMethod;

    amount: number;
    currency: string;

    paidBy: string | null;  // User ID or external name
    paidTo: string | null;  // User ID or external name

    dueDate: Date | null;
    paidDate: Date | null;

    reference: string | null;  // Transaction ID, cheque number, etc.
    receiptUrl: string | null;

    description: string | null;
    notes: string | null;
}

export interface PaymentRow {
    id: string;
    event_id: string;
    booking_request_id: string | null;
    budget_item_id: string | null;
    type: string;
    status: string;
    method: string;
    amount: number;
    currency: string;
    paid_by: string | null;
    paid_to: string | null;
    due_date: string | null;
    paid_date: string | null;
    reference: string | null;
    receipt_url: string | null;
    description: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export class Payment extends BaseEntity {
    private _eventId: string;
    private _bookingRequestId: string | null;
    private _budgetItemId: string | null;
    private _type: PaymentType;
    private _status: PaymentStatus;
    private _method: PaymentMethod;
    private _amount: number;
    private _currency: string;
    private _paidBy: string | null;
    private _paidTo: string | null;
    private _dueDate: Date | null;
    private _paidDate: Date | null;
    private _reference: string | null;
    private _receiptUrl: string | null;
    private _description: string | null;
    private _notes: string | null;

    constructor(data: PaymentData) {
        super(data);
        this._eventId = data.eventId;
        this._bookingRequestId = data.bookingRequestId;
        this._budgetItemId = data.budgetItemId;
        this._type = data.type;
        this._status = data.status;
        this._method = data.method;
        this._amount = data.amount;
        this._currency = data.currency;
        this._paidBy = data.paidBy;
        this._paidTo = data.paidTo;
        this._dueDate = data.dueDate;
        this._paidDate = data.paidDate;
        this._reference = data.reference;
        this._receiptUrl = data.receiptUrl;
        this._description = data.description;
        this._notes = data.notes;
    }

    // Getters
    get eventId(): string { return this._eventId; }
    get bookingRequestId(): string | null { return this._bookingRequestId; }
    get budgetItemId(): string | null { return this._budgetItemId; }
    get type(): PaymentType { return this._type; }
    get status(): PaymentStatus { return this._status; }
    get method(): PaymentMethod { return this._method; }
    get amount(): number { return this._amount; }
    get currency(): string { return this._currency; }
    get paidBy(): string | null { return this._paidBy; }
    get paidTo(): string | null { return this._paidTo; }
    get dueDate(): Date | null { return this._dueDate; }
    get paidDate(): Date | null { return this._paidDate; }
    get reference(): string | null { return this._reference; }
    get receiptUrl(): string | null { return this._receiptUrl; }
    get description(): string | null { return this._description; }
    get notes(): string | null { return this._notes; }

    // Setters
    set method(value: PaymentMethod) { this._method = value; this.touch(); }
    set reference(value: string | null) { this._reference = value; this.touch(); }
    set receiptUrl(value: string | null) { this._receiptUrl = value; this.touch(); }
    set notes(value: string | null) { this._notes = value; this.touch(); }

    /**
     * Mark payment as completed
     */
    markCompleted(reference?: string): void {
        this._status = 'completed';
        this._paidDate = new Date();
        if (reference) this._reference = reference;
        this.touch();
    }

    /**
     * Mark payment as failed
     */
    markFailed(notes?: string): void {
        this._status = 'failed';
        if (notes) this._notes = notes;
        this.touch();
    }

    /**
     * Cancel payment
     */
    cancel(reason?: string): void {
        this._status = 'cancelled';
        if (reason) this._notes = reason;
        this.touch();
    }

    /**
     * Is overdue?
     */
    isOverdue(): boolean {
        if (this._status === 'completed' || this._status === 'cancelled') return false;
        if (!this._dueDate) return false;
        return new Date() > this._dueDate;
    }

    /**
     * Days until due (negative if overdue)
     */
    getDaysUntilDue(): number | null {
        if (!this._dueDate) return null;
        const diff = this._dueDate.getTime() - new Date().getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    /**
     * Get status label
     */
    getStatusLabel(): string {
        const labels: Record<PaymentStatus, string> = {
            pending: 'Pending',
            processing: 'Processing',
            completed: 'Completed',
            failed: 'Failed',
            cancelled: 'Cancelled',
        };
        return labels[this._status];
    }

    /**
     * Get type label
     */
    getTypeLabel(): string {
        const labels: Record<PaymentType, string> = {
            client_payment: 'Client Payment',
            vendor_payment: 'Vendor Payment',
            refund: 'Refund',
            expense: 'Expense',
        };
        return labels[this._type];
    }

    toRow(): PaymentRow {
        return {
            id: this.id,
            event_id: this._eventId,
            booking_request_id: this._bookingRequestId,
            budget_item_id: this._budgetItemId,
            type: this._type,
            status: this._status,
            method: this._method,
            amount: this._amount,
            currency: this._currency,
            paid_by: this._paidBy,
            paid_to: this._paidTo,
            due_date: this._dueDate?.toISOString() ?? null,
            paid_date: this._paidDate?.toISOString() ?? null,
            reference: this._reference,
            receipt_url: this._receiptUrl,
            description: this._description,
            notes: this._notes,
            created_at: this.createdAt.toISOString(),
            updated_at: this.updatedAt.toISOString(),
        };
    }

    static fromRow(row: PaymentRow): Payment {
        return new Payment({
            id: row.id,
            eventId: row.event_id,
            bookingRequestId: row.booking_request_id,
            budgetItemId: row.budget_item_id,
            type: row.type as PaymentType,
            status: row.status as PaymentStatus,
            method: row.method as PaymentMethod,
            amount: row.amount,
            currency: row.currency,
            paidBy: row.paid_by,
            paidTo: row.paid_to,
            dueDate: row.due_date ? new Date(row.due_date) : null,
            paidDate: row.paid_date ? new Date(row.paid_date) : null,
            reference: row.reference,
            receiptUrl: row.receipt_url,
            description: row.description,
            notes: row.notes,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
        });
    }

    toJSON(): PaymentData {
        return {
            id: this.id,
            eventId: this._eventId,
            bookingRequestId: this._bookingRequestId,
            budgetItemId: this._budgetItemId,
            type: this._type,
            status: this._status,
            method: this._method,
            amount: this._amount,
            currency: this._currency,
            paidBy: this._paidBy,
            paidTo: this._paidTo,
            dueDate: this._dueDate,
            paidDate: this._paidDate,
            reference: this._reference,
            receiptUrl: this._receiptUrl,
            description: this._description,
            notes: this._notes,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}
