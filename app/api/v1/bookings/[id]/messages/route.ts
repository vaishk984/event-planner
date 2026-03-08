/**
 * Booking Messages API Route Handler
 * 
 * GET /api/v1/bookings/:id/messages - List messages for booking
 */

import { NextRequest } from 'next/server';
import { messageController } from '@/src/backend/controllers';
import { withErrorHandler, withLogging, withRateLimit } from '@/src/backend/middleware';

type Context = { params: Promise<{ id: string }> };

export async function GET(
    request: NextRequest,
    context: Context
) {
    const params = await context.params;
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => {
            return messageController.list(req, { bookingId: params.id });
        }
    )))(request, { params });
}
