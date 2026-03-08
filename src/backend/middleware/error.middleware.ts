/**
 * Error Handler Middleware
 * 
 * Global error handling and response formatting.
 * Similar to Spring's @ControllerAdvice / @ExceptionHandler.
 */

import { NextRequest, NextResponse } from 'next/server';
import { AppException } from '../exceptions';
import { createLogger, exceptionResponse, errorResponse, type ApiResponseData } from '../utils';

const logger = createLogger('ErrorHandler');

/**
 * Wrap a route handler with error handling
 */
export function withErrorHandler<T>(
    handler: (
        request: NextRequest,
        context: { params: Record<string, string> }
    ) => Promise<NextResponse<T>>
) {
    return async (
        request: NextRequest,
        context: { params: Record<string, string> }
    ): Promise<NextResponse<T | ApiResponseData<never>>> => {
        try {
            return await handler(request, context);
        } catch (error) {
            return handleError(error, request);
        }
    };
}

/**
 * Handle error and return appropriate response
 */
export function handleError(
    error: unknown,
    request?: NextRequest
): NextResponse<ApiResponseData<never>> {
    // Log error details
    const requestInfo = request ? {
        method: request.method,
        url: request.url,
        userAgent: request.headers.get('user-agent'),
    } : {};

    if (error instanceof AppException) {
        // Known application error
        logger.warn(error.message, {
            ...requestInfo,
            code: error.code,
            statusCode: error.statusCode,
            details: error.details,
        });
        return exceptionResponse(error);
    }

    // Unknown error - log full details
    if (error instanceof Error) {
        logger.error('Unhandled error', error, requestInfo);

        // In production, don't expose internal error details
        const message = process.env.NODE_ENV === 'production'
            ? 'An internal server error occurred'
            : error.message;

        return errorResponse(message, 'INTERNAL_ERROR', 500);
    }

    // Completely unknown error type
    logger.error('Unknown error type', undefined, { error, ...requestInfo });
    return errorResponse('An unexpected error occurred', 'UNKNOWN_ERROR', 500);
}

/**
 * Safe JSON parse with error handling
 */
export async function safeJsonParse<T>(
    request: NextRequest,
    defaultValue?: T
): Promise<T | undefined> {
    try {
        return await request.json();
    } catch {
        return defaultValue;
    }
}

/**
 * Create an async handler with built-in error handling
 */
export function asyncHandler<T>(
    fn: (request: NextRequest, context: { params: Record<string, string> }) => Promise<NextResponse<T>>
) {
    return withErrorHandler(fn);
}
