/**
 * Cancel Booking API Route
 * 
 * POST /api/v1/bookings/:id/cancel - Cancel booking
 */

import { NextRequest } from 'next/server';
import { bookingController } from '@/src/backend/controllers';
import { withErrorHandler, withLogging, withRateLimit } from '@/src/backend/middleware';

type Context = { params: Promise<{ id: string }> };

export async function POST(
    request: NextRequest,
    context: Context
) {
    const params = await context.params;
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => {
            return bookingController.cancel(req, params);
        }
    )))(request, { params });
}
