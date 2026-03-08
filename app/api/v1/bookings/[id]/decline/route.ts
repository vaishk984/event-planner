/**
 * Decline Quote API Route
 * 
 * POST /api/v1/bookings/:id/decline - Planner declines quote
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
            return bookingController.declineQuote(req, params);
        }
    )))(request, { params });
}
