/**
 * Function Timeline Template Route
 * 
 * POST /api/v1/functions/:id/timeline/template - Apply template to function
 */

import { NextRequest } from 'next/server';
import { timelineController } from '@/src/backend/controllers';
import { withErrorHandler } from '@/src/backend/middleware';

const handler = {
    POST: withErrorHandler(async (request: NextRequest, context: { params: Record<string, string> }) => {
        return timelineController.applyTemplate(request, { id: context.params.id });
    }),
};

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    const { id } = await params;
    return handler.POST(request, { params: { id } });
}
