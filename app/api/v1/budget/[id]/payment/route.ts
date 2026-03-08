/**
 * Add Payment to Budget Item API Route
 * 
 * POST /api/v1/budget/:id/payment - Add payment to budget item
 */

import { NextRequest } from 'next/server';
import { budgetController } from '@/src/backend/controllers';
import { withErrorHandler, withLogging, withRateLimit } from '@/src/backend/middleware';

type Context = { params: Promise<{ id: string }> };

export async function POST(
    request: NextRequest,
    context: Context
) {
    const params = await context.params;
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => {
            return budgetController.addPayment(req, params);
        }
    )))(request, { params });
}
