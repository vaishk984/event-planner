/**
 * Messages API Route Handler
 * 
 * POST /api/v1/messages - Send a message
 */

import { NextRequest } from 'next/server';
import { messageController } from '@/src/backend/controllers';
import { withErrorHandler, withLogging, withRateLimit } from '@/src/backend/middleware';

export async function POST(request: NextRequest) {
    return withErrorHandler(withLogging(withRateLimit(
        async (req: NextRequest) => {
            return messageController.send(req);
        }
    )))(request, { params: {} });
}
