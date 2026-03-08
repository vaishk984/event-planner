/**
 * BudgetItem Entity
 * 
 * Tracks budget allocations and actual spending per category/vendor
 */

import { BaseEntity, BaseEntityData } from './BaseEntity';

export type BudgetCategory =
    | 'venue'
    | 'catering'
    | 'decoration'
    | 'photography'
    | 'entertainment'
    | 'attire'
    | 'makeup'
    | 'transport'
    | 'invitations'
    | 'gifts'
    | 'miscellaneous';

export interface BudgetItemData extends BaseEntityData {
    eventId: string;
    functionId: string | null;
    category: BudgetCategory;
    description: string;
    vendorId: string | null;
    bookingRequestId: string | null;

    estimatedAmount: number;
    actualAmount: number | null;
    paidAmount: number;

    currency: string;
    notes: string | null;
}

export interface BudgetItemRow {
    id: string;
    event_id: string;
    function_id: string | null;
    category: string;
    description: string;
    vendor_id: string | null;
    booking_request_id: string | null;
    estimated_amount: number;
    actual_amount: number | null;
    paid_amount: number;
    currency: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export class BudgetItem extends BaseEntity {
    private _eventId: string;
    private _functionId: string | null;
    private _category: BudgetCategory;
    private _description: string;
    private _vendorId: string | null;
    private _bookingRequestId: string | null;
    private _estimatedAmount: number;
    private _actualAmount: number | null;
    private _paidAmount: number;
    private _currency: string;
    private _notes: string | null;

    // Industry standard budget percentages
    static readonly RECOMMENDED_SPLITS: Record<BudgetCategory, { min: number; max: number }> = {
        venue: { min: 20, max: 30 },
        catering: { min: 25, max: 35 },
        decoration: { min: 15, max: 25 },
        photography: { min: 5, max: 10 },
        entertainment: { min: 5, max: 10 },
        attire: { min: 3, max: 8 },
        makeup: { min: 2, max: 5 },
        transport: { min: 3, max: 5 },
        invitations: { min: 2, max: 5 },
        gifts: { min: 2, max: 5 },
        miscellaneous: { min: 5, max: 10 },
    };

    constructor(data: BudgetItemData) {
        super(data);
        this._eventId = data.eventId;
        this._functionId = data.functionId;
        this._category = data.category;
        this._description = data.description;
        this._vendorId = data.vendorId;
        this._bookingRequestId = data.bookingRequestId;
        this._estimatedAmount = data.estimatedAmount;
        this._actualAmount = data.actualAmount;
        this._paidAmount = data.paidAmount;
        this._currency = data.currency;
        this._notes = data.notes;
    }

    // Getters
    get eventId(): string { return this._eventId; }
    get functionId(): string | null { return this._functionId; }
    get category(): BudgetCategory { return this._category; }
    get description(): string { return this._description; }
    get vendorId(): string | null { return this._vendorId; }
    get bookingRequestId(): string | null { return this._bookingRequestId; }
    get estimatedAmount(): number { return this._estimatedAmount; }
    get actualAmount(): number | null { return this._actualAmount; }
    get paidAmount(): number { return this._paidAmount; }
    get currency(): string { return this._currency; }
    get notes(): string | null { return this._notes; }

    // Setters
    set description(value: string) { this._description = value; this.touch(); }
    set estimatedAmount(value: number) { this._estimatedAmount = value; this.touch(); }
    set actualAmount(value: number | null) { this._actualAmount = value; this.touch(); }
    set paidAmount(value: number) { this._paidAmount = value; this.touch(); }
    set notes(value: string | null) { this._notes = value; this.touch(); }
    set vendorId(value: string | null) { this._vendorId = value; this.touch(); }
    set bookingRequestId(value: string | null) { this._bookingRequestId = value; this.touch(); }

    /**
     * Get effective amount (actual if set, otherwise estimated)
     */
    getEffectiveAmount(): number {
        return this._actualAmount ?? this._estimatedAmount;
    }

    /**
     * Get remaining balance
     */
    getRemainingBalance(): number {
        return this.getEffectiveAmount() - this._paidAmount;
    }

    /**
     * Is over budget?
     */
    isOverBudget(): boolean {
        if (this._actualAmount === null) return false;
        return this._actualAmount > this._estimatedAmount;
    }

    /**
     * Get overage amount
     */
    getOverageAmount(): number {
        if (!this.isOverBudget()) return 0;
        return (this._actualAmount ?? 0) - this._estimatedAmount;
    }

    /**
     * Get payment progress percentage
     */
    getPaymentProgress(): number {
        const effective = this.getEffectiveAmount();
        if (effective === 0) return 100;
        return Math.round((this._paidAmount / effective) * 100);
    }

    /**
     * Add payment
     */
    addPayment(amount: number): void {
        this._paidAmount += amount;
        this.touch();
    }

    /**
     * Get category label
     */
    getCategoryLabel(): string {
        const labels: Record<BudgetCategory, string> = {
            venue: 'Venue & Infrastructure',
            catering: 'Food & Beverage',
            decoration: 'Decoration & Design',
            photography: 'Photography & Video',
            entertainment: 'Entertainment',
            attire: 'Attire & Jewelry',
            makeup: 'Makeup & Hair',
            transport: 'Transport & Logistics',
            invitations: 'Invitations & Stationery',
            gifts: 'Gifts & Favors',
            miscellaneous: 'Miscellaneous',
        };
        return labels[this._category];
    }

    toRow(): BudgetItemRow {
        return {
            id: this.id,
            event_id: this._eventId,
            function_id: this._functionId,
            category: this._category,
            description: this._description,
            vendor_id: this._vendorId,
            booking_request_id: this._bookingRequestId,
            estimated_amount: this._estimatedAmount,
            actual_amount: this._actualAmount,
            paid_amount: this._paidAmount,
            currency: this._currency,
            notes: this._notes,
            created_at: this.createdAt.toISOString(),
            updated_at: this.updatedAt.toISOString(),
        };
    }

    static fromRow(row: BudgetItemRow): BudgetItem {
        return new BudgetItem({
            id: row.id,
            eventId: row.event_id,
            functionId: row.function_id,
            category: row.category as BudgetCategory,
            description: row.description,
            vendorId: row.vendor_id,
            bookingRequestId: row.booking_request_id,
            estimatedAmount: row.estimated_amount,
            actualAmount: row.actual_amount,
            paidAmount: row.paid_amount,
            currency: row.currency,
            notes: row.notes,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
        });
    }

    toJSON(): BudgetItemData {
        return {
            id: this.id,
            eventId: this._eventId,
            functionId: this._functionId,
            category: this._category,
            description: this._description,
            vendorId: this._vendorId,
            bookingRequestId: this._bookingRequestId,
            estimatedAmount: this._estimatedAmount,
            actualAmount: this._actualAmount,
            paidAmount: this._paidAmount,
            currency: this._currency,
            notes: this._notes,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}
