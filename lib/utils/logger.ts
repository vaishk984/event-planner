// Logging Utilities for Production
// Structured logging with different levels

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
    userId?: string
    action?: string
    resource?: string
    [key: string]: unknown
}

const LOG_COLORS = {
    debug: '\x1b[36m', // Cyan
    info: '\x1b[32m',  // Green
    warn: '\x1b[33m',  // Yellow
    error: '\x1b[31m', // Red
}

const RESET = '\x1b[0m'

function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` | ${JSON.stringify(context)}` : ''
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
}

export const logger = {
    debug(message: string, context?: LogContext) {
        if (process.env.NODE_ENV === 'development') {
            console.log(`${LOG_COLORS.debug}${formatMessage('debug', message, context)}${RESET}`)
        }
    },

    info(message: string, context?: LogContext) {
        console.log(`${LOG_COLORS.info}${formatMessage('info', message, context)}${RESET}`)
    },

    warn(message: string, context?: LogContext) {
        console.warn(`${LOG_COLORS.warn}${formatMessage('warn', message, context)}${RESET}`)
    },

    error(message: string, error?: Error, context?: LogContext) {
        const errorContext = error ? {
            ...context,
            errorMessage: error.message,
            errorStack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        } : context

        console.error(`${LOG_COLORS.error}${formatMessage('error', message, errorContext)}${RESET}`)
    },

    // Audit log for sensitive operations
    audit(action: string, userId: string, details?: Record<string, unknown>) {
        this.info(`AUDIT: ${action}`, { userId, ...details })
    },

    // API request logging
    api(method: string, path: string, statusCode: number, duration: number) {
        const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info'
        this[level](`${method} ${path} ${statusCode} ${duration}ms`)
    },
}

// Helper for timing operations
export function createTimer() {
    const start = Date.now()
    return {
        elapsed: () => Date.now() - start,
    }
}

// Error formatting for user-friendly messages
export function formatUserError(error: unknown): string {
    if (error instanceof Error) {
        // Don't expose internal errors to users
        if (process.env.NODE_ENV === 'development') {
            return error.message
        }

        // Map known errors to user-friendly messages
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
