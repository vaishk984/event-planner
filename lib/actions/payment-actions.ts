/**
 * Payment Actions (Server Actions)
 * 
 * Server-side actions for payment/financial operations.
 */

'use server'

import { revalidatePath } from 'next/cache';

const API_BASE = '/api/v1';

// ============================================
// TYPES
// ============================================

export interface Payment {
    id: string;
    eventId: string;
    bookingRequestId?: string;
    budgetItemId?: string;
    type: PaymentType;
    status: PaymentStatus;
    method: PaymentMethod;
    amount: number;
    currency: string;
    paidBy?: string;
    paidTo?: string;
    dueDate?: string;
    paidDate?: string;
    reference?: string;
    receiptUrl?: string;
    description?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export type PaymentType = 'client_payment' | 'vendor_payment' | 'refund' | 'expense';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type PaymentMethod = 'bank_transfer' | 'cash' | 'cheque' | 'upi' | 'card' | 'other';

export interface PaymentAlert {
    overdue: Payment[];
    dueSoon: Payment[];
}

export interface ActionResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// ============================================
// HELPER
// ============================================

// ============================================
// HELPER
// ============================================

import { apiCall, ActionResult } from './shared-utils';

// ============================================
// QUERY ACTIONS
// ============================================

export async function getPayments(params?: {
    eventId?: string;
    bookingRequestId?: string;
    type?: PaymentType;
    status?: PaymentStatus;
}): Promise<Payment[]> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const result = await apiCall<Payment[]>(`/payments${query ? `?${query}` : ''}`);
    return result.data || [];
}

export async function getPayment(id: string): Promise<Payment | null> {
    const result = await apiCall<Payment>(`/payments/${id}`);
    return result.data || null;
}

export async function getOverduePayments(): Promise<Payment[]> {
    const result = await apiCall<Payment[]>('/payments/overdue');
    return result.data || [];
}

export async function getPaymentAlerts(): Promise<PaymentAlert | null> {
    const result = await apiCall<PaymentAlert>('/payments/alerts');
    return result.data || null;
}

// ============================================
// MUTATION ACTIONS
// ============================================

export async function createPayment(data: {
    eventId: string;
    bookingRequestId?: string;
    budgetItemId?: string;
    type: PaymentType;
    method: PaymentMethod;
    amount: number;
    paidBy?: string;
    paidTo?: string;
    dueDate?: string;
    description?: string;
    notes?: string;
}): Promise<ActionResult<Payment>> {
    const result = await apiCall<Payment>('/payments', {
        method: 'POST',
        body: JSON.stringify(data),
    });

    if (result.success) {
        revalidatePath('/planner/payments');
        revalidatePath(`/planner/events/${data.eventId}`);
    }

    return result;
}

export async function updatePayment(
    id: string,
    data: Partial<Payment>
): Promise<ActionResult<Payment>> {
    const result = await apiCall<Payment>(`/payments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });

    if (result.success) {
        revalidatePath('/planner/payments');
    }

    return result;
}

export async function completePayment(
    id: string,
    data?: {
        reference?: string;
        receiptUrl?: string;
        notes?: string;
    }
): Promise<ActionResult<Payment>> {
    const result = await apiCall<Payment>(`/payments/${id}/complete`, {
        method: 'POST',
        body: JSON.stringify(data || {}),
    });

    if (result.success) {
        revalidatePath('/planner/payments');
    }

    return result;
}
