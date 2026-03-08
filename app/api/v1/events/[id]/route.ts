/**
 * Single Event API Route Handler
 * 
 * GET /api/v1/events/:id - Get event by ID
 * PUT /api/v1/events/:id - Update event
 * DELETE /api/v1/events/:id - Delete event
 */

import { NextRequest } from 'next/server';
import { eventController } from '@/src/backend/controllers';
import { withErrorHandler, withLogging, withRateLimit } from '@/src/backend/middleware';

type Context = { params: Promise<{ id: string }> };

export async function GET(
    request: NextRequest,
    context: Context
) {
    const params = await context.params;
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => {
            return eventController.getById(req, params);
        }
    )))(request, { params });
}

export async function PUT(
    request: NextRequest,
    context: Context
) {
    const params = await context.params;
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => {
            return eventController.update(req, params);
        }
    )))(request, { params });
}

export async function DELETE(
    request: NextRequest,
    context: Context
) {
    const params = await context.params;
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => {
            return eventController.delete(req, params);
        }
    )))(request, { params });
}
