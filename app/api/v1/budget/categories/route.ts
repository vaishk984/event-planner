/**
 * Budget Categories API Route
 * 
 * GET /api/v1/budget/categories - Get available budget categories
 */

import { NextRequest } from 'next/server';
import { budgetController } from '@/src/backend/controllers';
import { withErrorHandler, withLogging, withRateLimit } from '@/src/backend/middleware';

export async function GET(request: NextRequest) {
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => {
            return budgetController.getCategories(req);
        }
    )))(request, { params: {} });
}
