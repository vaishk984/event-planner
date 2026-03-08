/**
 * Mark Messages as Read API Route
 * 
 * POST /api/v1/messages/mark-read - Mark messages as read
 */

import { NextRequest } from 'next/server';
import { messageController } from '@/src/backend/controllers';
import { withErrorHandler, withLogging, withRateLimit } from '@/src/backend/middleware';

export async function POST(request: NextRequest) {
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => {
            return messageController.markAsRead(req);
        }
    )))(request, { params: {} });
}
