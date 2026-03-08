/**
 * My Vendor Profile API Route Handler
 */

import { NextRequest } from 'next/server';
import { vendorController } from '@/src/backend/controllers';
import { withErrorHandler, withLogging, withRateLimit } from '@/src/backend/middleware';

export async function GET(request: NextRequest) {
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => vendorController.getMyProfile(req)
    )))(request, { params: {} });
}
