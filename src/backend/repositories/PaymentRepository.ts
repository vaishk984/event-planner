/**
 * PaymentRepository
 * 
 * Data access for Payment entities.
 */

import { BaseRepository } from './BaseRepository';
import { Payment, PaymentRow, PaymentStatus } from '../entities';

export class PaymentRepository extends BaseRepository<Payment, PaymentRow> {
    protected tableName = 'payments';
    protected entityName = 'Payment';

    protected toEntity(row: PaymentRow): Payment {
        return Payment.fromRow(row);
    }

    protected toRow(entity: Partial<Payment>): Partial<PaymentRow> {
        if (entity instanceof Payment) {
            return entity.toRow();
        }
        return entity as unknown as Partial<PaymentRow>;
    }

    /**
     * Get payments by event
     */
    async getByEvent(eventId: string): Promise<Payment[]> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('event_id', eventId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(row => this.toEntity(row as PaymentRow));
    }

    /**
     * Get payments by booking
     */
    async getByBookingRequest(bookingRequestId: string): Promise<Payment[]> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('booking_request_id', bookingRequestId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(row => this.toEntity(row as PaymentRow));
    }

    /**
     * Get by status
     */
    async getByStatus(status: PaymentStatus): Promise<Payment[]> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('status', status)
            .order('due_date', { ascending: true });

        if (error) throw error;
        return (data || []).map(row => this.toEntity(row as PaymentRow));
    }

    /**
     * Get overdue payments
     */
    async getOverdue(): Promise<Payment[]> {
        const now = new Date().toISOString();
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('status', 'pending')
            .lt('due_date', now)
            .order('due_date', { ascending: true });

        if (error) throw error;
        return (data || []).map(row => this.toEntity(row as PaymentRow));
    }

    /**
     * Get upcoming payments
     */
    async getUpcoming(days: number = 7): Promise<Payment[]> {
        const now = new Date();
        const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('status', 'pending')
            .gte('due_date', now.toISOString())
            .lte('due_date', future.toISOString())
            .order('due_date', { ascending: true });

        if (error) throw error;
        return (data || []).map(row => this.toEntity(row as PaymentRow));
    }

    /**
     * Get totals
     */
    async getTotals(eventId: string): Promise<{
        totalDue: number;
        totalPaid: number;
        totalPending: number;
        clientPayments: number;
        vendorPayments: number;
    }> {
        const payments = await this.getByEvent(eventId);

        let totalDue = 0;
        let totalPaid = 0;
        let clientPayments = 0;
        let vendorPayments = 0;

        for (const payment of payments) {
            totalDue += payment.amount;
            if (payment.status === 'completed') {
                totalPaid += payment.amount;
            }
            if (payment.type === 'client_payment') clientPayments += payment.amount;
            if (payment.type === 'vendor_payment') vendorPayments += payment.amount;
        }

        return {
            totalDue,
            totalPaid,
            totalPending: totalDue - totalPaid,
            clientPayments,
            vendorPayments,
        };
    }
}
