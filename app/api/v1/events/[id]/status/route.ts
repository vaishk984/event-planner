/**
 * Event Status API Route Handler
 * 
 * PATCH /api/v1/events/:id/status - Update event status
 */

import { NextRequest } from 'next/server';
import { eventController } from '@/src/backend/controllers';
import { withErrorHandler, withLogging, withRateLimit } from '@/src/backend/middleware';

type Context = { params: Promise<{ id: string }> };

export async function PATCH(
    request: NextRequest,
    context: Context
) {
    const params = await context.params;
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => {
            return eventController.updateStatus(req, params);
        }
    )))(request, { params });
}
