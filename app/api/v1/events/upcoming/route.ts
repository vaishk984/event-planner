/**
 * Upcoming Events API Route Handler
 * 
 * GET /api/v1/events/upcoming - Get upcoming events
 */

import { NextRequest } from 'next/server';
import { eventController } from '@/src/backend/controllers';
import { withErrorHandler, withLogging, withRateLimit } from '@/src/backend/middleware';

export async function GET(request: NextRequest) {
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => {
            return eventController.getUpcoming(req);
        }
    )))(request, { params: {} });
}
