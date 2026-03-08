/**
 * Booking Stats API Route
 * 
 * GET /api/v1/bookings/stats - Get booking statistics
 */

import { NextRequest } from 'next/server';
import { bookingController } from '@/src/backend/controllers';
import { withErrorHandler, withLogging, withRateLimit } from '@/src/backend/middleware';

export async function GET(request: NextRequest) {
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => {
            return bookingController.getStats(req);
        }
    )))(request, { params: {} });
}
