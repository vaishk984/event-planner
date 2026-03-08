/**
 * Validation Middleware
 * 
 * Validates request data against Zod schemas.
 * Similar to Spring's @Valid annotation processing.
 */

import { NextRequest } from 'next/server';
import { ZodSchema, ZodError } from 'zod';
import { ValidationException } from '../exceptions';
import { createLogger } from '../utils';

const logger = createLogger('ValidationMiddleware');

/**
 * Validate request body against a Zod schema
 */
export async function validateBody<T>(
    request: NextRequest,
    schema: ZodSchema<T>
): Promise<T> {
    try {
        const body = await request.json();
        return schema.parse(body);
    } catch (error) {
        if (error instanceof ZodError) {
            logger.warn('Validation failed', { errors: error.issues });
            // Handle Zod error directly
            const validationErrors = error.issues.map(issue => ({
                field: issue.path.map(String).join('.'),
                message: issue.message,
            }));
            throw new ValidationException(validationErrors);
        }
        if (error instanceof SyntaxError) {
            throw ValidationException.fromField('body', 'Invalid JSON in request body');
        }
        throw error;
    }
}

/**
 * Validate query parameters against a Zod schema
 */
export function validateQuery<T>(
    request: NextRequest,
    schema: ZodSchema<T>
): T {
    try {
        const searchParams = request.nextUrl.searchParams;
        const queryObj: Record<string, string | string[]> = {};

        searchParams.forEach((value, key) => {
            const existing = queryObj[key];
            if (existing) {
                if (Array.isArray(existing)) {
                    existing.push(value);
                } else {
                    queryObj[key] = [existing, value];
                }
            } else {
                queryObj[key] = value;
            }
        });

        return schema.parse(queryObj);
    } catch (error) {
        if (error instanceof ZodError) {
            logger.warn('Query validation failed', { errors: error.issues });
            const validationErrors = error.issues.map(issue => ({
                field: issue.path.map(String).join('.'),
                message: issue.message,
            }));
            throw new ValidationException(validationErrors);
        }
        throw error;
    }
}

/**
 * Validate path parameter
 */
export function validatePathParam(
    value: string | undefined,
    paramName: string,
    options: { uuid?: boolean } = {}
): string {
    if (!value) {
        throw ValidationException.fromField(paramName, `${paramName} is required`);
    }

    if (options.uuid) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(value)) {
            throw ValidationException.fromField(paramName, `${paramName} must be a valid UUID`);
        }
    }

    return value;
}

/**
 * Decorator-style validation wrapper for route handlers
 */
export function withValidation<TBody, TQuery>(options: {
    bodySchema?: ZodSchema<TBody>;
    querySchema?: ZodSchema<TQuery>;
}) {
    return function <TResult>(
        handler: (
            request: NextRequest,
            context: { params: Record<string, string>; body?: TBody; query?: TQuery }
        ) => Promise<TResult>
    ) {
        return async (
            request: NextRequest,
            context: { params: Record<string, string> }
        ): Promise<TResult> => {
            let body: TBody | undefined;
            let query: TQuery | undefined;

            if (options.bodySchema) {
                body = await validateBody(request, options.bodySchema);
            }

            if (options.querySchema) {
                query = validateQuery(request, options.querySchema);
            }

            return handler(request, { ...context, body, query });
        };
    };
}
