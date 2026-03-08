/**
 * Lead Status API Route Handler
 */

import { NextRequest } from 'next/server';
import { leadController } from '@/src/backend/controllers';
import { withErrorHandler, withLogging, withRateLimit } from '@/src/backend/middleware';

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Context) {
    const params = await context.params;
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => leadController.updateStatus(req, params)
    )))(request, { params });
}
