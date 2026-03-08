/**
 * Single Client API Route Handler
 * 
 * GET /api/v1/clients/:id - Get client by ID
 * PUT /api/v1/clients/:id - Update client
 * DELETE /api/v1/clients/:id - Delete client
 */

import { NextRequest } from 'next/server';
import { clientController } from '@/src/backend/controllers';
import { withErrorHandler, withLogging, withRateLimit } from '@/src/backend/middleware';

type Context = { params: Promise<{ id: string }> };

export async function GET(
    request: NextRequest,
    context: Context
) {
    const params = await context.params;
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => {
            return clientController.getById(req, params);
        }
    )))(request, { params });
}

export async function PUT(
    request: NextRequest,
    context: Context
) {
    const params = await context.params;
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => {
            return clientController.update(req, params);
        }
    )))(request, { params });
}

export async function DELETE(
    request: NextRequest,
    context: Context
) {
    const params = await context.params;
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => {
            return clientController.delete(req, params);
        }
    )))(request, { params });
}
