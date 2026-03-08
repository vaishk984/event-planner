/**
 * Leads API Route Handler
 * 
 * GET /api/v1/leads - List leads
 * POST /api/v1/leads - Create lead
 */

import { NextRequest } from 'next/server';
import { leadController } from '@/src/backend/controllers';
import { withErrorHandler, withLogging, withRateLimit } from '@/src/backend/middleware';

export async function GET(request: NextRequest) {
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => leadController.list(req)
    )))(request, { params: {} });
}

export async function POST(request: NextRequest) {
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => leadController.create(req)
    )))(request, { params: {} });
}
