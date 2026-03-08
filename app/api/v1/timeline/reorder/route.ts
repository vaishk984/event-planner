/**
 * Timeline Reorder Route
 * 
 * POST /api/v1/timeline/reorder - Reorder timeline items
 */

import { NextRequest } from 'next/server';
import { timelineController } from '@/src/backend/controllers';
import { withErrorHandler } from '@/src/backend/middleware';

const handler = {
    POST: withErrorHandler(async (request: NextRequest) => {
        return timelineController.reorder(request);
    }),
};

export async function POST(request: NextRequest) {
    return handler.POST(request, { params: {} });
}
