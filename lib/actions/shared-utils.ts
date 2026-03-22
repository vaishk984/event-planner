
import { headers } from 'next/headers';

export interface ActionResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

const API_BASE = '/api/v1';

/**
 * Shared API Call utility for Server Actions.
 * Dynamically detects the host from the request headers to support running on any port.
 */
export async function apiCall<T>(url: string, options?: RequestInit): Promise<ActionResult<T>> {
    try {
        // Dynamic host detection — works on both local dev and Vercel
        const headersList = await headers();
        const host = headersList.get('host') || process.env.VERCEL_URL || 'localhost:3000';
        const forwardedProto = headersList.get('x-forwarded-proto');
        const protocol = forwardedProto || (host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https');
        const baseUrl = `${protocol}://${host}`;

        // Merge headers (cookies are needed for auth)
        const requestHeaders = new Headers(options?.headers);
        if (!requestHeaders.has('Content-Type')) {
            requestHeaders.set('Content-Type', 'application/json');
        }

        // Forward cookies so auth works in Server Actions
        const cookieHeader = headersList.get('cookie');
        if (cookieHeader && !requestHeaders.has('Cookie')) {
            requestHeaders.set('Cookie', cookieHeader);
        }

        const res = await fetch(`${baseUrl}${API_BASE}${url}`, {
            ...options,
            headers: requestHeaders,
        });

        let data: Record<string, unknown>;
        try {
            data = await res.json();
        } catch {
            return { success: false, error: `Server returned ${res.status} (non-JSON response)` };
        }

        if (!res.ok) {
            return { success: false, error: (data.error as string) || 'Request failed' };
        }

        return { success: true, data: (data.data || data) as T };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        if (process.env.NODE_ENV === 'development') {
            console.error(`API Call Error (${url}):`, error);
        }
        return { success: false, error: message };
    }
}
