/**
 * Logging Middleware
 * 
 * Request/response logging for audit and debugging.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createLogger } from '../utils';

const logger = createLogger('RequestLogger');

interface RequestLog {
    method: string;
    url: string;
    userAgent?: string;
    ip?: string;
    correlationId: string;
    [key: string]: unknown;
}

interface ResponseLog {
    correlationId: string;
    status: number;
    duration: number;
    [key: string]: unknown;
}

/**
 * Generate correlation ID for request tracing
 */
function generateCorrelationId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Logging middleware wrapper
 */
export function withLogging(
    handler: (
        request: NextRequest,
        context: { params: Record<string, string> }
    ) => Promise<NextResponse>
) {
    return async (
        request: NextRequest,
        context: { params: Record<string, string> }
    ): Promise<NextResponse> => {
        const startTime = Date.now();
        const correlationId = generateCorrelationId();

        // Log incoming request
        const requestLog: RequestLog = {
            method: request.method,
            url: request.url,
            userAgent: request.headers.get('user-agent') || undefined,
            ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
            correlationId,
        };

        logger.info(`Incoming ${request.method} ${request.nextUrl.pathname}`, requestLog);

        try {
            // Execute handler
            const response = await handler(request, context);

            // Calculate duration
            const duration = Date.now() - startTime;

            // Log response
            const responseLog: ResponseLog = {
                correlationId,
                status: response.status,
                duration,
            };

            logger.info(`Completed ${request.method} ${request.nextUrl.pathname} - ${response.status} (${duration}ms)`, responseLog);

            // Add correlation ID to response headers
            response.headers.set('x-correlation-id', correlationId);

            return response;
        } catch (error) {
            const duration = Date.now() - startTime;

            logger.error(`Failed ${request.method} ${request.nextUrl.pathname} (${duration}ms)`, error as Error, { correlationId });

            throw error;
        }
    };
}

/**
 * Get correlation ID from request headers
 */
export function getCorrelationId(request: NextRequest): string | null {
    return request.headers.get('x-correlation-id');
}
