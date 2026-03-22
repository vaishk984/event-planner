/**
 * Client Actions (Server Actions)
 * 
 * Server-side actions for CRM/client management.
 */

'use server'

import { revalidatePath } from 'next/cache';
import { apiCall, type ActionResult } from './shared-utils';

// ============================================
// TYPES
// ============================================

export interface Client {
    id: string;
    plannerId: string;
    name: string;
    email?: string;
    phone?: string;
    alternatePhone?: string;
    status: ClientStatus;
    address?: string;
    city?: string;
    state?: string;
    preferences: ClientPreferences;
    totalEvents: number;
    totalSpend: number;
    currency: string;
    referralSource?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export type ClientStatus = 'prospect' | 'active' | 'past' | 'inactive';

export interface ClientPreferences {
    communicationMethod: 'email' | 'phone' | 'whatsapp';
    budgetRange?: { min: number; max: number };
    preferredVenues: string[];
    dietaryRestrictions: string[];
    notes: string;
}

export interface ClientStats {
    total: number;
    active: number;
    prospect: number;
    highValue: number;
    totalLifetimeValue: number;
}

export type { ActionResult } from './shared-utils';

// ============================================
// QUERY ACTIONS
// ============================================

export async function getClients(params?: {
    status?: ClientStatus;
    city?: string;
    search?: string;
}): Promise<Client[]> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const result = await apiCall<Client[]>(`/clients${query ? `?${query}` : ''}`);
    return result.data || [];
}

export async function getClient(id: string): Promise<Client | null> {
    const result = await apiCall<Client>(`/clients/${id}`);
    return result.data || null;
}

export async function getClientStats(): Promise<ClientStats | null> {
    const result = await apiCall<ClientStats>('/clients/stats');
    return result.data || null;
}

export async function getHighValueClients(): Promise<Client[]> {
    const result = await apiCall<Client[]>('/clients/high-value');
    return result.data || [];
}

export async function searchClients(query: string): Promise<Client[]> {
    return getClients({ search: query });
}

// ============================================
// MUTATION ACTIONS
// ============================================

export async function createClient(data: {
    name: string;
    email?: string;
    phone?: string;
    alternatePhone?: string;
    address?: string;
    city?: string;
    state?: string;
    preferences?: Partial<ClientPreferences>;
    referralSource?: string;
    notes?: string;
}): Promise<ActionResult<Client>> {
    const result = await apiCall<Client>('/clients', {
        method: 'POST',
        body: JSON.stringify(data),
    });

    if (result.success) {
        revalidatePath('/planner/clients');
    }

    return result;
}

export async function updateClient(
    id: string,
    data: Partial<Client>
): Promise<ActionResult<Client>> {
    const result = await apiCall<Client>(`/clients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });

    if (result.success) {
        revalidatePath(`/planner/clients/${id}`);
        revalidatePath('/planner/clients');
    }

    return result;
}

export async function deleteClient(id: string): Promise<ActionResult<void>> {
    const result = await apiCall<void>(`/clients/${id}`, {
        method: 'DELETE',
    });

    if (result.success) {
        revalidatePath('/planner/clients');
    }

    return result;
}
