/**
 * Vendors API Route Handler
 * 
 * GET /api/v1/vendors - Search/list vendors
 * POST /api/v1/vendors - Create vendor profile
 */

import { NextRequest } from 'next/server';
import { vendorController } from '@/src/backend/controllers';
import { withErrorHandler, withLogging, withRateLimit } from '@/src/backend/middleware';

export async function GET(request: NextRequest) {
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => vendorController.list(req)
    )))(request, { params: {} });
}

export async function POST(request: NextRequest) {
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => vendorController.create(req)
    )))(request, { params: {} });
}
