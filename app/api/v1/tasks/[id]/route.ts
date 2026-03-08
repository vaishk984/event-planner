/**
 * Single Task API Route Handler
 */

import { NextRequest } from 'next/server';
import { taskController } from '@/src/backend/controllers';
import { withErrorHandler, withLogging, withRateLimit } from '@/src/backend/middleware';

type Context = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Context) {
    const params = await context.params;
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => taskController.getById(req, params)
    )))(request, { params });
}

export async function PUT(request: NextRequest, context: Context) {
    const params = await context.params;
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => taskController.update(req, params)
    )))(request, { params });
}

export async function DELETE(request: NextRequest, context: Context) {
    const params = await context.params;
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => taskController.delete(req, params)
    )))(request, { params });
}
