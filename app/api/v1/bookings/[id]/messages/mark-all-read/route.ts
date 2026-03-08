/**
 * Mark All Messages Read API Route
 * 
 * POST /api/v1/bookings/:id/messages/mark-all-read - Mark all messages as read
 */

import { NextRequest } from 'next/server';
import { messageController } from '@/src/backend/controllers';
import { withErrorHandler, withLogging, withRateLimit } from '@/src/backend/middleware';

type Context = { params: Promise<{ id: string }> };

export async function POST(
    request: NextRequest,
    context: Context
) {
    const params = await context.params;
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => {
            return messageController.markAllAsRead(req, { bookingId: params.id });
        }
    )))(request, { params });
}
