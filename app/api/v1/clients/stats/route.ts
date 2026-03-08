/**
 * Client Stats API Route
 * 
 * GET /api/v1/clients/stats - Get client statistics
 */

import { NextRequest } from 'next/server';
import { clientController } from '@/src/backend/controllers';
import { withErrorHandler, withLogging, withRateLimit } from '@/src/backend/middleware';

export async function GET(request: NextRequest) {
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => {
            return clientController.getStats(req);
        }
    )))(request, { params: {} });
}
