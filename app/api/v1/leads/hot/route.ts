/**
 * Hot Leads API Route Handler
 */

import { NextRequest } from 'next/server';
import { leadController } from '@/src/backend/controllers';
import { withErrorHandler, withLogging, withRateLimit } from '@/src/backend/middleware';

export async function GET(request: NextRequest) {
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => leadController.getHotLeads(req)
    )))(request, { params: {} });
}
