/**
 * Single Payment API Route Handler
 * 
 * GET /api/v1/payments/:id - Get payment by ID
 * PUT /api/v1/payments/:id - Update payment
 */

import { NextRequest } from 'next/server';
import { paymentController } from '@/src/backend/controllers';
import { withErrorHandler, withLogging, withRateLimit } from '@/src/backend/middleware';

type Context = { params: Promise<{ id: string }> };

export async function GET(
    request: NextRequest,
    context: Context
) {
    const params = await context.params;
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => {
            return paymentController.getById(req, params);
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
            return paymentController.update(req, params);
        }
    )))(request, { params });
}
