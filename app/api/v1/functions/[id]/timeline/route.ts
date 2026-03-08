/**
 * Function Timeline Routes
 * 
 * GET /api/v1/functions/:id/timeline - Get timeline for function
 */

import { NextRequest } from 'next/server';
import { timelineController } from '@/src/backend/controllers';
import { withErrorHandler } from '@/src/backend/middleware';

const handler = {
    GET: withErrorHandler(async (request: NextRequest, context: { params: Record<string, string> }) => {
        return timelineController.getByFunction(request, { id: context.params.id });
    }),
};

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    const { id } = await params;
    return handler.GET(request, { params: { id } });
}
