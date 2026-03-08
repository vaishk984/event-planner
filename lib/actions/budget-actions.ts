/**
 * Budget Actions (Server Actions)
 * 
 * Server-side actions for budget item operations.
 */

'use server'

import { revalidatePath } from 'next/cache';

const API_BASE = '/api/v1';

// ============================================
// TYPES
// ============================================

export interface BudgetItem {
    id: string;
    eventId: string;
    functionId?: string;
    category: BudgetCategory;
    description: string;
    vendorId?: string;
    bookingRequestId?: string;
    estimatedAmount: number;
    actualAmount?: number;
    paidAmount: number;
    currency: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

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

export interface BudgetSummary {
    totalEstimated: number;
    totalActual: number;
    totalPaid: number;
    remaining: number;
    byCategory: Record<BudgetCategory, {
        estimated: number;
        actual: number;
        paid: number;
    }>;
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

export async function getBudgetItems(eventId: string, params?: {
    functionId?: string;
    category?: BudgetCategory;
}): Promise<BudgetItem[]> {
    const query = new URLSearchParams({ eventId, ...params } as Record<string, string>).toString();
    const result = await apiCall<BudgetItem[]>(`/events/${eventId}/budget?${query}`);
    return result.data || [];
}

export async function getBudgetItem(id: string): Promise<BudgetItem | null> {
    const result = await apiCall<BudgetItem>(`/budget/${id}`);
    return result.data || null;
}

export async function getBudgetSummary(eventId: string): Promise<BudgetSummary | null> {
    const result = await apiCall<BudgetSummary>(`/events/${eventId}/budget/summary`);
    return result.data || null;
}

export async function getBudgetCategories(): Promise<BudgetCategory[]> {
    const result = await apiCall<BudgetCategory[]>('/budget/categories');
    return result.data || [];
}

// ============================================
// MUTATION ACTIONS
// ============================================

export async function createBudgetItem(data: {
    eventId: string;
    functionId?: string;
    category: BudgetCategory;
    description: string;
    vendorId?: string;
    estimatedAmount: number;
    actualAmount?: number;
    notes?: string;
}): Promise<ActionResult<BudgetItem>> {
    const result = await apiCall<BudgetItem>('/budget', {
        method: 'POST',
        body: JSON.stringify(data),
    });

    if (result.success) {
        revalidatePath(`/planner/events/${data.eventId}`);
        revalidatePath(`/planner/events/${data.eventId}/budget`);
    }

    return result;
}

export async function updateBudgetItem(
    id: string,
    data: Partial<BudgetItem>
): Promise<ActionResult<BudgetItem>> {
    const result = await apiCall<BudgetItem>(`/budget/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });

    if (result.success && data.eventId) {
        revalidatePath(`/planner/events/${data.eventId}/budget`);
    }

    return result;
}

export async function deleteBudgetItem(id: string, eventId: string): Promise<ActionResult<void>> {
    const result = await apiCall<void>(`/budget/${id}`, {
        method: 'DELETE',
    });

    if (result.success) {
        revalidatePath(`/planner/events/${eventId}/budget`);
    }

    return result;
}

export async function addPaymentToBudgetItem(
    id: string,
    data: { amount: number; notes?: string },
    eventId: string
): Promise<ActionResult<BudgetItem>> {
    const result = await apiCall<BudgetItem>(`/budget/${id}/payment`, {
        method: 'POST',
        body: JSON.stringify(data),
    });

    if (result.success) {
        revalidatePath(`/planner/events/${eventId}/budget`);
    }

    return result;
}
