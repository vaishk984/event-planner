/**
 * Event Budget API Route Handler
 * 
 * GET /api/v1/events/:id/budget - List budget items for event
 */

import { NextRequest } from 'next/server';
import { budgetController } from '@/src/backend/controllers';
import { withErrorHandler, withLogging, withRateLimit } from '@/src/backend/middleware';

type Context = { params: Promise<{ id: string }> };

export async function GET(
    request: NextRequest,
    context: Context
) {
    const params = await context.params;
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => {
            return budgetController.list(req, { eventId: params.id });
        }
    )))(request, { params });
}
