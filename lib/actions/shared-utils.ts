
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
        // Dynamic host detection
        const headersList = await headers();
        const host = headersList.get('host') || 'localhost:3000';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const baseUrl = `${protocol}://${host}`;

        // Merge headers (cookies are often needed for auth)
        const requestHeaders = new Headers(options?.headers);
        if (!requestHeaders.has('Content-Type')) {
            requestHeaders.set('Content-Type', 'application/json');
        }

        // Forward cookies if available and not already set
        const cookieHeader = headersList.get('cookie');
        if (cookieHeader && !requestHeaders.has('Cookie')) {
            requestHeaders.set('Cookie', cookieHeader);
        }

        const res = await fetch(`${baseUrl}${API_BASE}${url}`, {
            ...options,
            headers: requestHeaders,
        });

        const data = await res.json();

        if (!res.ok) {
            return { success: false, error: data.error || 'Request failed' };
        }

        return { success: true, data: data.data || data };
    } catch (error) {
        console.error(`API Call Error (${url}):`, error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}
