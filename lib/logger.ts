/**
 * Application Logger
 *
 * Unified structured logging service for the application.
 * In production, outputs JSON for log aggregators.
 * In development, outputs human-readable colored output.
 *
 * Usage:
 *   // Named context (recommended for modules)
 *   const logger = createLogger('Booking')
 *   logger.info('Created booking', { eventId: '...' })
 *   logger.error('Failed to create', error)
 *
 *   // Quick usage without named context
 *   import { logger } from '@/lib/logger'
 *   logger.info('Auth', 'User logged in')
 *
 *   // Audit logging for sensitive operations
 *   logger.audit('DELETE_EVENT', userId, { eventId: '...' })
 *
 *   // API request logging
 *   logger.api('POST', '/api/auth/login', 200, 142)
 *
 *   // Timer for measuring performance
 *   const timer = createTimer()
 *   // ... do work ...
 *   logger.info('Auth', `Login completed in ${timer.elapsed()}ms`)
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogMeta {
    [key: string]: unknown
}

class Logger {
    private context: string

    constructor(context: string) {
        this.context = context
    }

    debug(message: string, meta?: LogMeta): void {
        this.log('debug', message, meta)
    }

    info(message: string, meta?: LogMeta): void {
        this.log('info', message, meta)
    }

    warn(message: string, meta?: LogMeta): void {
        this.log('warn', message, meta)
    }

    error(message: string, error?: unknown, meta?: LogMeta): void {
        const errorMeta = error instanceof Error
            ? {
                errorName: error.name,
                errorMessage: error.message,
                stack: process.env.NODE_ENV === 'development'
                    ? error.stack?.split('\n').slice(0, 3).join('\n')
                    : undefined,
            }
            : error !== undefined ? { error } : {}

        this.log('error', message, { ...errorMeta, ...meta })
    }

    private log(level: LogLevel, message: string, meta?: LogMeta): void {
        // Skip debug in production
        if (level === 'debug' && process.env.NODE_ENV !== 'development') return

        const entry = {
            level,
            context: this.context,
            message,
            timestamp: new Date().toISOString(),
            ...(meta && Object.keys(meta).length > 0 ? { meta } : {}),
        }

        if (process.env.NODE_ENV === 'production') {
            // JSON for log aggregators (Datadog, CloudWatch, etc.)
            const method = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log
            method(JSON.stringify(entry))
        } else {
            // Human-readable for development
            const colors: Record<LogLevel, string> = {
                debug: '\x1b[36m',  // cyan
                info: '\x1b[32m',   // green
                warn: '\x1b[33m',   // yellow
                error: '\x1b[31m',  // red
            }
            const reset = '\x1b[0m'
            const metaStr = meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : ''
            const method = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log
            method(`${colors[level]}${level.toUpperCase()}${reset} [${this.context}] ${message}${metaStr}`)
        }
    }
}

export function createLogger(context: string): Logger {
    return new Logger(context)
}

/** Default logger for quick usage without a dedicated context */
export const logger = {
    debug(context: string, message: string, meta?: LogMeta) {
        new Logger(context).debug(message, meta)
    },
    info(context: string, message: string, meta?: LogMeta) {
        new Logger(context).info(message, meta)
    },
    warn(context: string, message: string, meta?: LogMeta) {
        new Logger(context).warn(message, meta)
    },
    error(context: string, message: string, error?: unknown, meta?: LogMeta) {
        new Logger(context).error(message, error, meta)
    },

    /** Audit log for sensitive operations (always logged, even in production) */
    audit(action: string, userId: string, details?: Record<string, unknown>) {
        new Logger('AUDIT').info(action, { userId, ...details })
    },

    /** API request logging with automatic level based on status code */
    api(method: string, path: string, statusCode: number, durationMs: number) {
        const message = `${method} ${path} ${statusCode} ${durationMs}ms`
        if (statusCode >= 500) {
            new Logger('API').error(message)
        } else if (statusCode >= 400) {
            new Logger('API').warn(message)
        } else {
            new Logger('API').info(message)
        }
    },
}

/** Helper for timing operations */
export function createTimer() {
    const start = Date.now()
    return {
        elapsed: () => Date.now() - start,
    }
}

/** Error formatting for user-friendly messages */
export function formatUserError(error: unknown): string {
    if (error instanceof Error) {
        if (process.env.NODE_ENV === 'development') {
            return error.message
        }

        const errorMap: Record<string, string> = {
            'Invalid login credentials': 'Invalid email or password',
            'User already registered': 'An account with this email already exists',
            'Email not confirmed': 'Please check your email to confirm your account',
            'duplicate key value': 'This record already exists',
        }

        for (const [key, value] of Object.entries(errorMap)) {
            if (error.message.includes(key)) {
                return value
            }
        }

        return 'Something went wrong. Please try again.'
    }

    return 'An unexpected error occurred'
}

export type { Logger, LogLevel, LogMeta }
