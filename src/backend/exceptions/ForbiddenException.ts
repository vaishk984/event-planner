/**
 * Forbidden Exception
 * 
 * Thrown when user lacks permission for an action.
 * Similar to Spring Security's AccessDeniedException.
 */

import { AppException } from './AppException';

export class ForbiddenException extends AppException {
    constructor(action?: string) {
        const message = action
            ? `You do not have permission to ${action}`
            : 'Access denied';

        super(message, 403, 'FORBIDDEN', { action });
    }
}
