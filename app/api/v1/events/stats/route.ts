/**
 * Event Stats API Route Handler
 * 
 * GET /api/v1/events/stats - Get event statistics
 */

import { NextRequest } from 'next/server';
import { eventController } from '@/src/backend/controllers';
import { withErrorHandler, withLogging, withRateLimit } from '@/src/backend/middleware';

export async function GET(request: NextRequest) {
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => {
            return eventController.getStats(req);
        }
    )))(request, { params: {} });
}
