/**
 * Budget API Route Handler
 * 
 * GET /api/v1/budget - List budget items
 * POST /api/v1/budget - Create budget item
 */

import { NextRequest } from 'next/server';
import { budgetController } from '@/src/backend/controllers';
import { withErrorHandler, withLogging, withRateLimit } from '@/src/backend/middleware';

export async function POST(request: NextRequest) {
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => {
            return budgetController.create(req);
        }
    )))(request, { params: {} });
}
