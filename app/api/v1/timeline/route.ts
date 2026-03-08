/**
 * Timeline Routes
 * 
 * GET /api/v1/timeline - List timeline items
 * POST /api/v1/timeline - Create new timeline item
 */

import { NextRequest } from 'next/server';
import { timelineController } from '@/src/backend/controllers';
import { withErrorHandler } from '@/src/backend/middleware';

const handler = {
    GET: withErrorHandler(async (request: NextRequest) => {
        return timelineController.list(request);
    }),
    POST: withErrorHandler(async (request: NextRequest) => {
        return timelineController.create(request);
    }),
};

export async function GET(request: NextRequest) {
    return handler.GET(request, { params: {} });
}

export async function POST(request: NextRequest) {
    return handler.POST(request, { params: {} });
}
