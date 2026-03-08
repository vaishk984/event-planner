/**
 * Overdue Payments API Route
 * 
 * GET /api/v1/payments/overdue - Get overdue payments
 */

import { NextRequest } from 'next/server';
import { paymentController } from '@/src/backend/controllers';
import { withErrorHandler, withLogging, withRateLimit } from '@/src/backend/middleware';

export async function GET(request: NextRequest) {
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => {
            return paymentController.getOverdue(req);
        }
    )))(request, { params: {} });
}
