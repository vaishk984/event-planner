/**
 * API Response Helpers
 * 
 * Standardized response format for all API endpoints.
 */

import { NextResponse } from 'next/server';
import { AppException } from '../exceptions';

export interface ApiResponseData<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
    };
}

/**
 * ApiResponse class with static factory methods
 */
export class ApiResponse {
    /**
     * Create a successful response
     */
    static success<T>(data: T, message?: string): NextResponse<ApiResponseData<T>> {
        return NextResponse.json(
            { success: true, data, message },
            { status: 200 }
        );
    }

    /**
     * Create a created response (201)
     */
    static created<T>(data: T, message?: string): NextResponse<ApiResponseData<T>> {
        return NextResponse.json(
            { success: true, data, message: message || 'Created successfully' },
            { status: 201 }
        );
    }

    /**
     * Create a deleted response
     */
    static deleted(id: string): NextResponse<ApiResponseData<{ deleted: boolean; id: string }>> {
        return NextResponse.json(
            { success: true, data: { deleted: true, id } },
            { status: 200 }
        );
    }

    /**
     * Create a paginated response
     */
    static paginated<T>(items: T[], meta: { page: number; limit: number; total: number; totalPages: number }): NextResponse<ApiResponseData<{ items: T[]; meta: typeof meta }>> {
        return NextResponse.json(
            { success: true, data: { items, meta } },
            { status: 200 }
        );
    }

    /**
     * Create an error response
     */
    static error(message: string, code: string = 'ERROR', status: number = 500, details?: unknown): NextResponse<ApiResponseData<never>> {
        return NextResponse.json(
            { success: false, error: { code, message, details } },
            { status }
        );
    }

    /**
     * Create a response from an exception
     */
    static fromException(error: unknown): NextResponse<ApiResponseData<never>> {
        if (error instanceof AppException) {
            return NextResponse.json(error.toJSON(), { status: error.statusCode });
        }
        const message = error instanceof Error ? error.message : 'An unexpected error occurred';
        return ApiResponse.error(message, 'INTERNAL_ERROR', 500);
    }
}

// Legacy function exports for backwards compatibility
export function successResponse<T>(data: T, meta?: ApiResponseData['meta'], status: number = 200): NextResponse<ApiResponseData<T>> {
    return NextResponse.json({ success: true, data, meta }, { status });
}

export function createdResponse<T>(data: T): NextResponse<ApiResponseData<T>> {
    return successResponse(data, undefined, 201);
}

export function errorResponse(message: string, code: string = 'ERROR', status: number = 500, details?: unknown): NextResponse<ApiResponseData<never>> {
    return NextResponse.json({ success: false, error: { code, message, details } }, { status });
}

export function exceptionResponse(error: unknown): NextResponse<ApiResponseData<never>> {
    return ApiResponse.fromException(error);
}

export function paginatedResponse<T>(data: T[], page: number, limit: number, total: number): NextResponse<ApiResponseData<T[]>> {
    return successResponse(data, { page, limit, total, totalPages: Math.ceil(total / limit) });
}
