/**
 * Complete Payment API Route
 * 
 * POST /api/v1/payments/:id/complete - Mark payment as completed
 */

import { NextRequest } from 'next/server';
import { paymentController } from '@/src/backend/controllers';
import { withErrorHandler, withLogging, withRateLimit } from '@/src/backend/middleware';

type Context = { params: Promise<{ id: string }> };

export async function POST(
    request: NextRequest,
    context: Context
) {
    const params = await context.params;
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => {
            return paymentController.complete(req, params);
        }
    )))(request, { params });
}
