/**
 * Events API Route Handler
 * 
 * GET /api/v1/events - List events
 * POST /api/v1/events - Create event
 */

import { NextRequest } from 'next/server';
import { eventController } from '@/src/backend/controllers';
import { withErrorHandler, withLogging, withRateLimit } from '@/src/backend/middleware';

// Compose middleware
const handler = {
    GET: withErrorHandler(withLogging(withRateLimit(
        async (request: NextRequest) => {
            return eventController.list(request);
        }
    ))),

    POST: withErrorHandler(withLogging(withRateLimit(
        async (request: NextRequest) => {
            return eventController.create(request);
        }
    ))),
};

export async function GET(request: NextRequest) {
    return handler.GET(request, { params: {} });
}

export async function POST(request: NextRequest) {
    return handler.POST(request, { params: {} });
}
