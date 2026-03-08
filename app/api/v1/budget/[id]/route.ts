/**
 * Single Budget Item API Route Handler
 * 
 * GET /api/v1/budget/:id - Get budget item by ID
 * PUT /api/v1/budget/:id - Update budget item
 * DELETE /api/v1/budget/:id - Delete budget item
 */

import { NextRequest } from 'next/server';
import { budgetController } from '@/src/backend/controllers';
import { withErrorHandler, withLogging, withRateLimit } from '@/src/backend/middleware';

type Context = { params: Promise<{ id: string }> };

export async function GET(
    request: NextRequest,
    context: Context
) {
    const params = await context.params;
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => {
            return budgetController.getById(req, params);
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
            return budgetController.update(req, params);
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
            return budgetController.delete(req, params);
        }
    )))(request, { params });
}
