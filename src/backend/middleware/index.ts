/**
 * Middleware Index
 * 
 * Central export for all middleware functions.
 */

// Validation
export {
    validateBody,
    validateQuery,
    validatePathParam,
    withValidation,
} from './validation.middleware';

// Authentication
export {
    authenticate,
    requireRole,
    requirePermission,
    optionalAuthenticate,
    withAuth,
    type AuthenticatedUser,
    type AuthContext,
} from './auth.middleware';

// Error Handling
export {
    withErrorHandler,
    handleError,
    safeJsonParse,
    asyncHandler,
} from './error.middleware';

// Logging
export {
    withLogging,
    getCorrelationId,
} from './logging.middleware';

// Rate Limiting
export {
    checkRateLimit,
    withRateLimit,
    RateLimitExceededException,
} from './rate-limit.middleware';
