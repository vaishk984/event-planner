/**
 * API Client Configuration
 * 
 * Base configuration and utilities for API calls from frontend.
 */

// Define response type locally for frontend
interface ApiResponseData<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: { code: string; message: string; details?: unknown };
}

export interface FetchOptions extends RequestInit {
    params?: Record<string, string | number | boolean | undefined>;
}

const API_BASE = '/api/v1';

/**
 * API Client class for making requests to the backend
 */
class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string = API_BASE) {
        this.baseUrl = baseUrl;
    }

    /**
     * Build URL with query parameters
     */
    private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
        const url = new URL(`${this.baseUrl}${endpoint}`, window.location.origin);

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    url.searchParams.append(key, String(value));
                }
            });
        }

        return url.toString();
    }

    /**
     * Get auth headers
     */
    private getAuthHeaders(): HeadersInit {
        // Get token from cookie or storage
        const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('sb-access-token='))
            ?.split('=')[1];

        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    /**
     * Make a request
     */
    async request<T>(
        endpoint: string,
        options: FetchOptions = {}
    ): Promise<ApiResponseData<T>> {
        const { params, ...fetchOptions } = options;
        const url = this.buildUrl(endpoint, params);

        const response = await fetch(url, {
            ...fetchOptions,
            headers: {
                'Content-Type': 'application/json',
                ...this.getAuthHeaders(),
                ...fetchOptions.headers,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new ApiError(
                data.error?.message || 'An error occurred',
                response.status,
                data.error?.code
            );
        }

        return data;
    }

    /**
     * GET request
     */
    async get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
        const response = await this.request<T>(endpoint, { method: 'GET', params });
        return response.data as T;
    }

    /**
     * POST request
     */
    async post<T>(endpoint: string, body?: unknown): Promise<T> {
        const response = await this.request<T>(endpoint, {
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        });
        return response.data as T;
    }

    /**
     * PUT request
     */
    async put<T>(endpoint: string, body?: unknown): Promise<T> {
        const response = await this.request<T>(endpoint, {
            method: 'PUT',
            body: body ? JSON.stringify(body) : undefined,
        });
        return response.data as T;
    }

    /**
     * PATCH request
     */
    async patch<T>(endpoint: string, body?: unknown): Promise<T> {
        const response = await this.request<T>(endpoint, {
            method: 'PATCH',
            body: body ? JSON.stringify(body) : undefined,
        });
        return response.data as T;
    }

    /**
     * DELETE request
     */
    async delete<T>(endpoint: string): Promise<T> {
        const response = await this.request<T>(endpoint, { method: 'DELETE' });
        return response.data as T;
    }
}

/**
 * API Error class
 */
export class ApiError extends Error {
    status: number;
    code?: string;

    constructor(message: string, status: number, code?: string) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
    }
}

// Export singleton instance
export const api = new ApiClient();
export { ApiClient };
