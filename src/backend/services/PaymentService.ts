/**
 * PaymentService
 * 
 * Business logic for payment tracking.
 */

import { Payment, PaymentType, PaymentMethod } from '../entities';
import { PaymentRepository, BudgetRepository } from '../repositories';
import { CreatePaymentDto, UpdatePaymentDto, CompletePaymentDto } from '../dto/request';
import { NotFoundException } from '../exceptions';

export class PaymentService {
    private repository: PaymentRepository;
    private budgetRepository: BudgetRepository;

    constructor(paymentRepo?: PaymentRepository, budgetRepo?: BudgetRepository) {
        this.repository = paymentRepo || new PaymentRepository();
        this.budgetRepository = budgetRepo || new BudgetRepository();
    }

    /**
     * Get payment by ID
     */
    async getById(id: string): Promise<Payment> {
        const payment = await this.repository.findById(id);
        if (!payment) throw new NotFoundException('Payment', id);
        return payment;
    }

    /**
     * Get payments for event
     */
    async getByEvent(eventId: string): Promise<Payment[]> {
        return this.repository.getByEvent(eventId);
    }

    /**
     * Get payments for booking
     */
    async getByBookingRequest(bookingRequestId: string): Promise<Payment[]> {
        return this.repository.getByBookingRequest(bookingRequestId);
    }

    /**
     * Get pending payments
     */
    async getPending(): Promise<Payment[]> {
        return this.repository.getByStatus('pending');
    }

    /**
     * Get overdue payments
     */
    async getOverdue(): Promise<Payment[]> {
        return this.repository.getOverdue();
    }

    /**
     * Get upcoming payments
     */
    async getUpcoming(days: number = 7): Promise<Payment[]> {
        return this.repository.getUpcoming(days);
    }

    /**
     * Create a payment
     */
    async create(dto: CreatePaymentDto): Promise<Payment> {
        const payment = new Payment({
            id: crypto.randomUUID(),
            eventId: dto.eventId,
            bookingRequestId: dto.bookingRequestId || null,
            budgetItemId: dto.budgetItemId || null,
            type: dto.type as PaymentType,
            status: 'pending',
            method: dto.method as PaymentMethod,
            amount: dto.amount,
            currency: dto.currency || 'INR',
            paidBy: dto.paidBy || null,
            paidTo: dto.paidTo || null,
            dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
            paidDate: null,
            reference: null,
            receiptUrl: null,
            description: dto.description || null,
            notes: dto.notes || null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return this.repository.create(payment);
    }

    /**
     * Update a payment
     */
    async update(id: string, dto: UpdatePaymentDto): Promise<Payment> {
        const payment = await this.getById(id);

        if (dto.method !== undefined) payment.method = dto.method as PaymentMethod;
        if (dto.reference !== undefined) payment.reference = dto.reference;
        if (dto.receiptUrl !== undefined) payment.receiptUrl = dto.receiptUrl;
        if (dto.notes !== undefined) payment.notes = dto.notes;

        return this.repository.update(id, payment);
    }

    /**
     * Mark payment as completed
     */
    async complete(id: string, dto: CompletePaymentDto): Promise<Payment> {
        const payment = await this.getById(id);
        payment.markCompleted(dto.reference);

        if (dto.receiptUrl) payment.receiptUrl = dto.receiptUrl;
        if (dto.notes) payment.notes = dto.notes;

        const updated = await this.repository.update(id, payment);

        // Update budget item if linked
        if (payment.budgetItemId) {
            const budgetItem = await this.budgetRepository.findById(payment.budgetItemId);
            if (budgetItem) {
                budgetItem.addPayment(payment.amount);
                await this.budgetRepository.update(budgetItem.id, budgetItem);
            }
        }

        return updated;
    }

    /**
     * Cancel a payment
     */
    async cancel(id: string, reason?: string): Promise<Payment> {
        const payment = await this.getById(id);
        payment.cancel(reason);
        return this.repository.update(id, payment);
    }

    /**
     * Get payment totals for event
     */
    async getTotals(eventId: string): Promise<{
        totalDue: number;
        totalPaid: number;
        totalPending: number;
        clientPayments: number;
        vendorPayments: number;
    }> {
        return this.repository.getTotals(eventId);
    }

    /**
     * Get dashboard alerts
     */
    async getAlerts(): Promise<{
        overdue: Payment[];
        dueThisWeek: Payment[];
    }> {
        const overdue = await this.getOverdue();
        const dueThisWeek = await this.getUpcoming(7);

        return { overdue, dueThisWeek };
    }
}

// Singleton instance
export const paymentService = new PaymentService();
