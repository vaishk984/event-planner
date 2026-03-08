/**
 * Base Application Exception
 * 
 * Abstract base class for all application exceptions.
 * Similar to Spring's RuntimeException hierarchy.
 */

export abstract class AppException extends Error {
    public readonly statusCode: number;
    public readonly code: string;
    public readonly timestamp: string;
    public readonly details?: Record<string, unknown>;

    constructor(
        message: string,
        statusCode: number = 500,
        code: string = 'INTERNAL_ERROR',
        details?: Record<string, unknown>
    ) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.code = code;
        this.timestamp = new Date().toISOString();
        this.details = details;

        // Maintains proper stack trace for where error was thrown
        Error.captureStackTrace(this, this.constructor);
    }

    /**
     * Convert exception to JSON response format
     */
    toJSON() {
        return {
            success: false,
            error: {
                code: this.code,
                message: this.message,
                details: this.details,
                timestamp: this.timestamp,
            },
        };
    }
}
