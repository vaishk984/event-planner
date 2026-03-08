/**
 * Single Vendor API Route Handler
 */

import { NextRequest } from 'next/server';
import { vendorController } from '@/src/backend/controllers';
import { withErrorHandler, withLogging, withRateLimit } from '@/src/backend/middleware';

type Context = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Context) {
    const params = await context.params;
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => vendorController.getById(req, params)
    )))(request, { params });
}

export async function PUT(request: NextRequest, context: Context) {
    const params = await context.params;
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => vendorController.update(req, params)
    )))(request, { params });
}

export async function DELETE(request: NextRequest, context: Context) {
    const params = await context.params;
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => vendorController.delete(req, params)
    )))(request, { params });
}
