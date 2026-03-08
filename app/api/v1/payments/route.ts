/**
 * Payments API Route Handler
 * 
 * GET /api/v1/payments - List payments
 * POST /api/v1/payments - Create payment
 */

import { NextRequest } from 'next/server';
import { paymentController } from '@/src/backend/controllers';
import { withErrorHandler, withLogging, withRateLimit } from '@/src/backend/middleware';

// Compose middleware
const handler = {
    GET: withErrorHandler(withLogging(withRateLimit(
        async (request: NextRequest) => {
            return paymentController.list(request);
        }
    ))),

    POST: withErrorHandler(withLogging(withRateLimit(
        async (request: NextRequest) => {
            return paymentController.create(request);
        }
    ))),
};

export async function GET(request: NextRequest) {
    return handler.GET(request, { params: {} });
}

export async function POST(request: NextRequest) {
    return handler.POST(request, { params: {} });
}
