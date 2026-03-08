/**
 * Tasks API Route Handler
 * 
 * GET /api/v1/tasks - List tasks
 * POST /api/v1/tasks - Create task
 */

import { NextRequest } from 'next/server';
import { taskController } from '@/src/backend/controllers';
import { withErrorHandler, withLogging, withRateLimit } from '@/src/backend/middleware';

export async function GET(request: NextRequest) {
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => taskController.list(req)
    )))(request, { params: {} });
}

export async function POST(request: NextRequest) {
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => taskController.create(req)
    )))(request, { params: {} });
}
