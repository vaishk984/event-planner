/**
 * Conflict Exception
 * 
 * Thrown when there's a conflict with existing data.
 * Similar to DataIntegrityViolationException.
 */

import { AppException } from './AppException';

export class ConflictException extends AppException {
    constructor(message: string, resource?: string) {
        super(message, 409, 'CONFLICT', { resource });
    }

    /**
     * Create for duplicate resource
     */
    static duplicate(resource: string, field: string, value: unknown): ConflictException {
        return new ConflictException(
            `${resource} with ${field} '${value}' already exists`,
            resource
        );
    }
}
