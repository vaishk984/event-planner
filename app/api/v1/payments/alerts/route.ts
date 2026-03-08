/**
 * Payment Alerts API Route
 * 
 * GET /api/v1/payments/alerts - Get payment alerts (overdue + due soon)
 */

import { NextRequest } from 'next/server';
import { paymentController } from '@/src/backend/controllers';
import { withErrorHandler, withLogging, withRateLimit } from '@/src/backend/middleware';

export async function GET(request: NextRequest) {
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => {
            return paymentController.getAlerts(req);
        }
    )))(request, { params: {} });
}
