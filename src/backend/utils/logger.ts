/**
 * Logger Utility
 * 
 * Centralized logging for the application.
 * Can be extended to use external logging services.
 */

export enum LogLevel {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
}

interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    context?: string;
    data?: Record<string, unknown>;
}

class Logger {
    private context?: string;

    constructor(context?: string) {
        this.context = context;
    }

    /**
     * Create a child logger with context
     */
    child(context: string): Logger {
        return new Logger(this.context ? `${this.context}:${context}` : context);
    }

    /**
     * Log debug message
     */
    debug(message: string, data?: Record<string, unknown>): void {
        this.log(LogLevel.DEBUG, message, data);
    }

    /**
     * Log info message
     */
    info(message: string, data?: Record<string, unknown>): void {
        this.log(LogLevel.INFO, message, data);
    }

    /**
     * Log warning message
     */
    warn(message: string, data?: Record<string, unknown>): void {
        this.log(LogLevel.WARN, message, data);
    }

    /**
     * Log error message
     */
    error(message: string, error?: Error | unknown, data?: Record<string, unknown>): void {
        const errorData = error instanceof Error
            ? { errorName: error.name, errorMessage: error.message, stack: error.stack }
            : { error };

        this.log(LogLevel.ERROR, message, { ...errorData, ...data });
    }

    /**
     * Internal log method
     */
    private log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
        const entry: LogEntry = {
            level,
            message,
            timestamp: new Date().toISOString(),
            context: this.context,
            data,
        };

        // Format output based on environment
        if (process.env.NODE_ENV === 'production') {
            // JSON format for production (easily parseable by log aggregators)
            console.log(JSON.stringify(entry));
        } else {
            // Human-readable format for development
            const contextStr = this.context ? `[${this.context}]` : '';
            const levelColor = this.getLevelColor(level);
            const dataStr = data ? ` ${JSON.stringify(data)}` : '';

            console.log(`${levelColor}${level}${'\x1b[0m'} ${contextStr} ${message}${dataStr}`);
        }
    }

    /**
     * Get ANSI color for log level
     */
    private getLevelColor(level: LogLevel): string {
        switch (level) {
            case LogLevel.DEBUG: return '\x1b[36m'; // Cyan
            case LogLevel.INFO: return '\x1b[32m';  // Green
            case LogLevel.WARN: return '\x1b[33m';  // Yellow
            case LogLevel.ERROR: return '\x1b[31m'; // Red
            default: return '\x1b[0m';
        }
    }
}

// Export root logger
export const logger = new Logger();

// Export function to create child loggers
export const createLogger = (context: string): Logger => {
    return logger.child(context);
};
