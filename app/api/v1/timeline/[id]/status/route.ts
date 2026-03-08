/**
 * Timeline Status Route
 * 
 * PATCH /api/v1/timeline/:id/status - Update timeline item status
 */

import { NextRequest } from 'next/server';
import { timelineController } from '@/src/backend/controllers';
import { withErrorHandler } from '@/src/backend/middleware';

const handler = {
    PATCH: withErrorHandler(async (request: NextRequest, context: { params: Record<string, string> }) => {
        return timelineController.updateStatus(request, { id: context.params.id });
    }),
};

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
    const { id } = await params;
    return handler.PATCH(request, { params: { id } });
}
