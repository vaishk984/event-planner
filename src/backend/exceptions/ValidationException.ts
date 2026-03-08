/**
 * Validation Exception
 * 
 * Thrown when request validation fails.
 * Similar to Spring's MethodArgumentNotValidException.
 */

import { AppException } from './AppException';

export interface ValidationError {
    field: string;
    message: string;
    value?: unknown;
}

export class ValidationException extends AppException {
    public readonly errors: ValidationError[];

    constructor(errors: ValidationError[]) {
        const message = errors.length === 1
            ? errors[0].message
            : `Validation failed with ${errors.length} errors`;

        super(message, 400, 'VALIDATION_ERROR', { errors });
        this.errors = errors;
    }

    /**
     * Create from a single field error
     */
    static fromField(field: string, message: string, value?: unknown): ValidationException {
        return new ValidationException([{ field, message, value }]);
    }

    /**
     * Create from Zod error
     */
    static fromZodError(zodError: { issues: Array<{ path: (string | number)[]; message: string }> }): ValidationException {
        const errors = zodError.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
        }));
        return new ValidationException(errors);
    }
}
