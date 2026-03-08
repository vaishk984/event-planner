/**
 * Timeline Item Routes
 * 
 * GET /api/v1/timeline/:id - Get timeline item
 * PUT /api/v1/timeline/:id - Update timeline item
 * DELETE /api/v1/timeline/:id - Delete timeline item
 */

import { NextRequest } from 'next/server';
import { timelineController } from '@/src/backend/controllers';
import { withErrorHandler } from '@/src/backend/middleware';

const handler = {
    GET: withErrorHandler(async (request: NextRequest, context: { params: Record<string, string> }) => {
        return timelineController.getById(request, { id: context.params.id });
    }),
    PUT: withErrorHandler(async (request: NextRequest, context: { params: Record<string, string> }) => {
        return timelineController.update(request, { id: context.params.id });
    }),
    DELETE: withErrorHandler(async (request: NextRequest, context: { params: Record<string, string> }) => {
        return timelineController.delete(request, { id: context.params.id });
    }),
};

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    const { id } = await params;
    return handler.GET(request, { params: { id } });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    const { id } = await params;
    return handler.PUT(request, { params: { id } });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const { id } = await params;
    return handler.DELETE(request, { params: { id } });
}
