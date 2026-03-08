/**
 * High Value Clients API Route
 * 
 * GET /api/v1/clients/high-value - Get high value clients
 */

import { NextRequest } from 'next/server';
import { clientController } from '@/src/backend/controllers';
import { withErrorHandler, withLogging, withRateLimit } from '@/src/backend/middleware';

export async function GET(request: NextRequest) {
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => {
            return clientController.getHighValue(req);
        }
    )))(request, { params: {} });
}
