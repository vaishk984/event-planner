/**
 * In-memory rate limiter for API routes.
 * Uses a sliding window approach with automatic cleanup.
 *
 * For production at scale, replace with Redis-based rate limiting.
 * This works well for single-instance deployments (Vercel serverless has
 * per-instance memory, so rate limiting is approximate but still effective).
 */

interface RateLimitEntry {
    count: number
    resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes
let cleanupInterval: ReturnType<typeof setInterval> | null = null

function startCleanup() {
    if (cleanupInterval) return
    cleanupInterval = setInterval(() => {
        const now = Date.now()
        for (const [key, entry] of rateLimitStore) {
            if (now > entry.resetAt) {
                rateLimitStore.delete(key)
            }
        }
    }, 5 * 60 * 1000)
    // Don't prevent process exit
    if (cleanupInterval && typeof cleanupInterval === 'object' && 'unref' in cleanupInterval) {
        cleanupInterval.unref()
    }
}

interface RateLimitConfig {
    /** Max requests allowed in the window */
    maxRequests: number
    /** Time window in seconds */
    windowSeconds: number
    /** Key prefix to separate different rate limit buckets */
    prefix?: string
}

interface RateLimitResult {
    success: boolean
    remaining: number
    resetAt: number
    retryAfterSeconds?: number
}

/**
 * Check rate limit for a given identifier (usually IP address).
 *
 * @example
 * ```ts
 * const ip = request.headers.get('x-forwarded-for') || 'unknown'
 * const result = checkRateLimit(ip, { maxRequests: 10, windowSeconds: 60 })
 * if (!result.success) {
 *     return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
 * }
 * ```
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig
): RateLimitResult {
    startCleanup()

    const { maxRequests, windowSeconds, prefix = 'global' } = config
    const key = `${prefix}:${identifier}`
    const now = Date.now()
    const windowMs = windowSeconds * 1000

    const entry = rateLimitStore.get(key)

    // No existing entry or window expired — create fresh
    if (!entry || now > entry.resetAt) {
        rateLimitStore.set(key, {
            count: 1,
            resetAt: now + windowMs,
        })
        return { success: true, remaining: maxRequests - 1, resetAt: now + windowMs }
    }

    // Within window — check limit
    entry.count++

    if (entry.count > maxRequests) {
        const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000)
        return {
            success: false,
            remaining: 0,
            resetAt: entry.resetAt,
            retryAfterSeconds,
        }
    }

    return {
        success: true,
        remaining: maxRequests - entry.count,
        resetAt: entry.resetAt,
    }
}

/**
 * Get client IP from request headers.
 * Works with Vercel, Cloudflare, nginx, and direct connections.
 */
export function getClientIp(request: Request): string {
    return (
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        request.headers.get('cf-connecting-ip') ||
        'unknown'
    )
}

// Pre-configured rate limit configs for common use cases
export const RATE_LIMITS = {
    /** Auth endpoints: 5 attempts per minute */
    auth: { maxRequests: 5, windowSeconds: 60, prefix: 'auth' } as RateLimitConfig,
    /** Standard API: 60 requests per minute */
    api: { maxRequests: 60, windowSeconds: 60, prefix: 'api' } as RateLimitConfig,
    /** Heavy operations (email, PDF generation): 10 per minute */
    heavy: { maxRequests: 10, windowSeconds: 60, prefix: 'heavy' } as RateLimitConfig,
    /** Public endpoints (showroom, intake): 30 per minute */
    public: { maxRequests: 30, windowSeconds: 60, prefix: 'public' } as RateLimitConfig,
} as const
