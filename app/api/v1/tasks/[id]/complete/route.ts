/**
 * Task Complete API Route Handler
 */

import { NextRequest } from 'next/server';
import { taskController } from '@/src/backend/controllers';
import { withErrorHandler, withLogging, withRateLimit } from '@/src/backend/middleware';

type Context = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: Context) {
    const params = await context.params;
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => taskController.complete(req, params)
    )))(request, { params });
}
