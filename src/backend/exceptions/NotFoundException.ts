/**
 * Not Found Exception
 * 
 * Thrown when a requested resource is not found.
 * Similar to Spring's ResourceNotFoundException.
 */

import { AppException } from './AppException';

export class NotFoundException extends AppException {
    constructor(resource: string, id?: string) {
        const message = id
            ? `${resource} with ID '${id}' not found`
            : `${resource} not found`;

        super(message, 404, 'NOT_FOUND', { resource, id });
    }
}
