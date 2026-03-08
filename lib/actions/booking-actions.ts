/**
 * Booking Actions (Server Actions)
 * 
 * Server-side actions for booking/vendor request operations.
 */

'use server'

import { revalidatePath } from 'next/cache';

const API_BASE = '/api/v1';

// ============================================
// TYPES
// ============================================

export interface BookingRequest {
    id: string;
    eventId: string;
    functionId?: string;
    vendorId: string;
    plannerId: string;
    status: BookingStatus;
    serviceCategory: string;
    serviceDetails?: string;
    quotedAmount?: number;
    agreedAmount?: number;
    currency: string;
    paymentSchedule: PaymentMilestone[];
    requestedDate: string;
    responseDate?: string;
    confirmationDate?: string;
    notes?: string;
    internalNotes?: string;
    createdAt: string;
    updatedAt: string;
}

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
    name: string;
    amount: number;
    dueDate: string;
    paidDate?: string | null;
}

export interface ActionResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// ============================================
// HELPER
// ============================================

async function apiCall<T>(url: string, options?: RequestInit): Promise<ActionResult<T>> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}${API_BASE}${url}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        });

        const data = await res.json();

        if (!res.ok) {
            return { success: false, error: data.error || 'Request failed' };
        }

        return { success: true, data: data.data || data };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

// ============================================
// QUERY ACTIONS
// ============================================

export async function getBookings(params?: {
    eventId?: string;
    vendorId?: string;
    status?: BookingStatus;
}): Promise<BookingRequest[]> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const result = await apiCall<BookingRequest[]>(`/bookings${query ? `?${query}` : ''}`);
    return result.data || [];
}

export async function getBooking(id: string): Promise<BookingRequest | null> {
    const result = await apiCall<BookingRequest>(`/bookings/${id}`);
    return result.data || null;
}

export async function getBookingStats(eventId?: string) {
    const query = eventId ? `?eventId=${eventId}` : '';
    const result = await apiCall<{
        total: number;
        pending: number;
        confirmed: number;
        completed: number;
    }>(`/bookings/stats${query}`);
    return result.data;
}

// ============================================
// MUTATION ACTIONS
// ============================================

export async function createBooking(data: {
    eventId: string;
    functionId?: string;
    vendorId: string;
    serviceCategory: string;
    serviceDetails?: string;
    notes?: string;
}): Promise<ActionResult<BookingRequest>> {
    const result = await apiCall<BookingRequest>('/bookings', {
        method: 'POST',
        body: JSON.stringify(data),
    });

    if (result.success) {
        revalidatePath('/planner/events');
        revalidatePath('/planner/bookings');
    }

    return result;
}

export async function updateBooking(
    id: string,
    data: Partial<BookingRequest>
): Promise<ActionResult<BookingRequest>> {
    const result = await apiCall<BookingRequest>(`/bookings/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });

    if (result.success) {
        revalidatePath(`/planner/bookings/${id}`);
        revalidatePath('/planner/bookings');
    }

    return result;
}

export async function submitQuote(
    id: string,
    data: {
        amount: number;
        notes?: string;
        paymentSchedule?: PaymentMilestone[];
    }
): Promise<ActionResult<BookingRequest>> {
    const result = await apiCall<BookingRequest>(`/bookings/${id}/submit-quote`, {
        method: 'POST',
        body: JSON.stringify(data),
    });

    if (result.success) {
        revalidatePath(`/planner/bookings/${id}`);
        revalidatePath('/vendor/bookings');
    }

    return result;
}

export async function acceptQuote(
    id: string,
    data?: {
        agreedAmount?: number;
        paymentSchedule?: PaymentMilestone[];
    }
): Promise<ActionResult<BookingRequest>> {
    const result = await apiCall<BookingRequest>(`/bookings/${id}/accept`, {
        method: 'POST',
        body: JSON.stringify(data || {}),
    });

    if (result.success) {
        revalidatePath(`/planner/bookings/${id}`);
        revalidatePath('/planner/bookings');
    }

    return result;
}

export async function declineQuote(id: string): Promise<ActionResult<BookingRequest>> {
    const result = await apiCall<BookingRequest>(`/bookings/${id}/decline`, {
        method: 'POST',
    });

    if (result.success) {
        revalidatePath(`/planner/bookings/${id}`);
        revalidatePath('/planner/bookings');
    }

    return result;
}

export async function cancelBooking(id: string): Promise<ActionResult<BookingRequest>> {
    const result = await apiCall<BookingRequest>(`/bookings/${id}/cancel`, {
        method: 'POST',
    });

    if (result.success) {
        revalidatePath(`/planner/bookings/${id}`);
        revalidatePath('/planner/bookings');
    }

    return result;
}
