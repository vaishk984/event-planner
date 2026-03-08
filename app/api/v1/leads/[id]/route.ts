/**
 * Single Lead API Route Handler
 * 
 * GET /api/v1/leads/:id - Get lead
 * PUT /api/v1/leads/:id - Update lead
 * DELETE /api/v1/leads/:id - Delete lead
 */

import { NextRequest } from 'next/server';
import { leadController } from '@/src/backend/controllers';
import { withErrorHandler, withLogging, withRateLimit } from '@/src/backend/middleware';

type Context = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Context) {
    const params = await context.params;
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => leadController.getById(req, params)
    )))(request, { params });
}

export async function PUT(request: NextRequest, context: Context) {
    const params = await context.params;
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => leadController.update(req, params)
    )))(request, { params });
}

export async function DELETE(request: NextRequest, context: Context) {
    const params = await context.params;
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => leadController.delete(req, params)
    )))(request, { params });
}
