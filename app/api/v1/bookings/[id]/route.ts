/**
 * Single Booking API Route Handler
 * 
 * GET /api/v1/bookings/:id - Get booking by ID
 * PUT /api/v1/bookings/:id - Update booking
 */

import { NextRequest } from 'next/server';
import { bookingController } from '@/src/backend/controllers';
import { withErrorHandler, withLogging, withRateLimit } from '@/src/backend/middleware';

type Context = { params: Promise<{ id: string }> };

export async function GET(
    request: NextRequest,
    context: Context
) {
    const params = await context.params;
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => {
            return bookingController.getById(req, params);
        }
    )))(request, { params });
}

export async function PUT(
    request: NextRequest,
    context: Context
) {
    const params = await context.params;
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => {
            return bookingController.update(req, params);
        }
    )))(request, { params });
}
