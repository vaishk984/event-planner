/**
 * Unauthorized Exception
 * 
 * Thrown when authentication fails.
 * Similar to Spring Security's AuthenticationException.
 */

import { AppException } from './AppException';

export class UnauthorizedException extends AppException {
    constructor(message: string = 'Authentication required') {
        super(message, 401, 'UNAUTHORIZED');
    }
}
