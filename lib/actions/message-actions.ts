/**
 * Message Actions (Server Actions)
 * 
 * Server-side actions for planner-vendor messaging.
 */

'use server'

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

const API_BASE = '/api/v1';

// ============================================
// TYPES
// ============================================

export interface Message {
    id: string;
    bookingRequestId: string;
    senderType: 'planner' | 'vendor' | 'system';
    senderId: string;
    type: MessageType;
    content: string;
    attachments: Attachment[];
    isRead: boolean;
    readAt?: string;
    createdAt: string;
    updatedAt: string;
}

export type MessageType = 'text' | 'file' | 'quote' | 'status_update';

export interface Attachment {
    name: string;
    url: string;
    type: string;
    size: number;
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
        const cookieStore = await cookies();
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'Cookie': cookieStore.toString(),
            ...options?.headers,
        };

        const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}${API_BASE}${url}`, {
            ...options,
            headers,
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

export async function getMessages(bookingId: string, params?: {
    unreadOnly?: boolean;
}): Promise<Message[]> {
    const query = params?.unreadOnly ? '?unreadOnly=true' : '';
    const result = await apiCall<Message[]>(`/bookings/${bookingId}/messages${query}`);
    return result.data || [];
}

export async function getUnreadCount(bookingId: string): Promise<number> {
    const messages = await getMessages(bookingId, { unreadOnly: true });
    return messages.length;
}

// ============================================
// MUTATION ACTIONS
// ============================================

export async function sendMessage(data: {
    bookingRequestId: string;
    type?: MessageType;
    content: string;
    attachments?: Attachment[];
}): Promise<ActionResult<Message>> {
    const result = await apiCall<Message>('/messages', {
        method: 'POST',
        body: JSON.stringify(data),
    });

    if (result.success) {
        revalidatePath(`/planner/bookings/${data.bookingRequestId}`);
    }

    return result;
}

export async function markMessagesAsRead(messageIds: string[]): Promise<ActionResult<void>> {
    const result = await apiCall<void>('/messages/mark-read', {
        method: 'POST',
        body: JSON.stringify({ messageIds }),
    });

    return result;
}

export async function markAllAsRead(bookingId: string): Promise<ActionResult<void>> {
    const result = await apiCall<void>(`/bookings/${bookingId}/messages/mark-all-read`, {
        method: 'POST',
    });

    if (result.success) {
        revalidatePath(`/planner/bookings/${bookingId}`);
    }

    return result;
}
