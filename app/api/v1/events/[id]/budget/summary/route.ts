/**
 * Event Budget Summary API Route
 * 
 * GET /api/v1/events/:id/budget/summary - Get budget summary for event
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
            return budgetController.getSummary(req, { eventId: params.id });
        }
    )))(request, { params });
}
