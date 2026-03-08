/**
 * Overdue Tasks API Route Handler
 */

import { NextRequest } from 'next/server';
import { taskController } from '@/src/backend/controllers';
import { withErrorHandler, withLogging, withRateLimit } from '@/src/backend/middleware';

export async function GET(request: NextRequest) {
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => taskController.getOverdue(req)
    )))(request, { params: {} });
}
