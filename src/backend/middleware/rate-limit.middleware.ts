/**
 * Rate Limit Middleware
 * 
 * Simple in-memory rate limiting.
 * For production, use Redis-based rate limiting.
 */

import { NextRequest } from 'next/server';
import { AppConfig } from '../config';
import { AppException } from '../exceptions';

// In-memory store for rate limits (replace with Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate Limit Exceeded Exception
 */
export class RateLimitExceededException extends AppException {
    constructor(retryAfterSeconds: number) {
        super(
            `Rate limit exceeded. Try again in ${retryAfterSeconds} seconds.`,
            429,
            'RATE_LIMIT_EXCEEDED',
            { retryAfter: retryAfterSeconds }
        );
    }
}

/**
 * Get client identifier from request
 */
function getClientId(request: NextRequest): string {
    // Try to get IP address
    const ip =
        request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') ||
        'unknown';

    return `rate_limit_${ip}`;
}

/**
 * Check rate limit for a request
 */
export function checkRateLimit(
    request: NextRequest,
    options: { windowMs?: number; max?: number } = {}
): void {
    const windowMs = options.windowMs || AppConfig.api.rateLimit.windowMs;
    const max = options.max || AppConfig.api.rateLimit.max;

    const clientId = getClientId(request);
    const now = Date.now();

    // Get or create rate limit entry
    let entry = rateLimitStore.get(clientId);

    if (!entry || now > entry.resetTime) {
        // Create new window
        entry = { count: 1, resetTime: now + windowMs };
        rateLimitStore.set(clientId, entry);
        return;
    }

    // Increment count
    entry.count++;

    if (entry.count > max) {
        const retryAfterSeconds = Math.ceil((entry.resetTime - now) / 1000);
        throw new RateLimitExceededException(retryAfterSeconds);
    }
}

/**
 * Wrapper for rate-limited route handlers
 */
export function withRateLimit<TResult>(
    handler: (
        request: NextRequest,
        context: { params: Record<string, string> }
    ) => Promise<TResult>,
    options?: { windowMs?: number; max?: number }
) {
    return async (
        request: NextRequest,
        context: { params: Record<string, string> }
    ): Promise<TResult> => {
        checkRateLimit(request, options);
        return handler(request, context);
    };
}

/**
 * Clean up expired rate limit entries (call periodically)
 */
export function cleanupRateLimitStore(): void {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (now > entry.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
    setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}
