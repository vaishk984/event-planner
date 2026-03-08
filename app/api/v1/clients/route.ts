/**
 * Clients API Route Handler
 * 
 * GET /api/v1/clients - List clients
 * POST /api/v1/clients - Create client
 */

import { NextRequest } from 'next/server';
import { clientController } from '@/src/backend/controllers';
import { withErrorHandler, withLogging, withRateLimit } from '@/src/backend/middleware';

// Compose middleware
const handler = {
    GET: withErrorHandler(withLogging(withRateLimit(
        async (request: NextRequest) => {
            return clientController.list(request);
        }
    ))),

    POST: withErrorHandler(withLogging(withRateLimit(
        async (request: NextRequest) => {
            return clientController.create(request);
        }
    ))),
};

export async function GET(request: NextRequest) {
    return handler.GET(request, { params: {} });
}

export async function POST(request: NextRequest) {
    return handler.POST(request, { params: {} });
}
