/**
 * Today's Events API Route Handler
 * 
 * GET /api/v1/events/today - Get today's events
 */

import { NextRequest } from 'next/server';
import { eventController } from '@/src/backend/controllers';
import { withErrorHandler, withLogging, withRateLimit } from '@/src/backend/middleware';

export async function GET(request: NextRequest) {
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => {
            return eventController.getToday(req);
        }
    )))(request, { params: {} });
}
