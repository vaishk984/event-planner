/**
 * Timeline Templates Route
 * 
 * GET /api/v1/timeline/templates - Get available templates
 */

import { NextRequest } from 'next/server';
import { timelineController } from '@/src/backend/controllers';
import { withErrorHandler } from '@/src/backend/middleware';

const handler = {
    GET: withErrorHandler(async () => {
        return timelineController.getTemplates();
    }),
};

export async function GET(request: NextRequest) {
    return handler.GET(request, { params: {} });
}
