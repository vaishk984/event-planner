/**
 * Business Exception
 * 
 * Thrown when a business rule is violated.
 * For domain-specific errors that are not validation errors.
 */

import { AppException } from './AppException';

export class BusinessException extends AppException {
    constructor(message: string, code: string = 'BUSINESS_ERROR', details?: Record<string, unknown>) {
        super(message, 422, code, details);
    }
}
