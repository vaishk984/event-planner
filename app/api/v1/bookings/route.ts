/**
 * Bookings API Route Handler
 * 
 * GET /api/v1/bookings - List bookings
 * POST /api/v1/bookings - Create booking
 */

import { NextRequest } from 'next/server';
import { bookingController } from '@/src/backend/controllers';
import { withErrorHandler, withLogging, withRateLimit } from '@/src/backend/middleware';

// Compose middleware
const handler = {
    GET: withErrorHandler(withLogging(withRateLimit(
        async (request: NextRequest) => {
            return bookingController.list(request);
        }
    ))),

    POST: withErrorHandler(withLogging(withRateLimit(
        async (request: NextRequest) => {
            return bookingController.create(request);
        }
    ))),
};

export async function GET(request: NextRequest) {
    return handler.GET(request, { params: {} });
}

export async function POST(request: NextRequest) {
    return handler.POST(request, { params: {} });
}
