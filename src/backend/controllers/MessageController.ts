/**
 * Message Controller
 * 
 * API endpoints for Message/communication operations.
 */

import { NextRequest } from 'next/server';
import { MessageService, messageService } from '../services';
import {
    SendMessageSchema,
    QueryMessagesSchema,
    MarkMessagesReadSchema
} from '../dto/request';
import { validateBody, validateQuery, validatePathParam } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { successResponse, createdResponse, errorResponse } from '../utils/response';
import { createLogger } from '../utils/logger';

const logger = createLogger('MessageController');

export class MessageController {
    constructor(private service: MessageService = messageService) { }

    // ============================================
    // GET /api/v1/bookings/:bookingId/messages
    // ============================================
    async list(request: NextRequest, params: { bookingId: string }) {
        await authenticate(request);
        const bookingId = validatePathParam(params.bookingId, 'bookingId', { uuid: true });
        const url = new URL(request.url);
        const limit = parseInt(url.searchParams.get('limit') || '50', 10);

        const messages = await this.service.getByBookingRequest(bookingId, limit);
        return successResponse(messages);
    }

    // ============================================
    // POST /api/v1/messages
    // ============================================
    async send(request: NextRequest) {
        const auth = await authenticate(request);
        const dto = await validateBody(request, SendMessageSchema);

        // Determine sender type based on user role
        const senderType = auth.user.role === 'vendor' ? 'vendor' : 'planner';

        const message = await this.service.send(dto, auth.user.id, senderType);
        return createdResponse(message);
    }

    // ============================================
    // GET /api/v1/bookings/:bookingId/messages/unread
    // ============================================
    async getUnread(request: NextRequest, params: { bookingId: string }) {
        const auth = await authenticate(request);
        const bookingId = validatePathParam(params.bookingId, 'bookingId', { uuid: true });

        const senderType = auth.user.role === 'vendor' ? 'vendor' : 'planner';
        const messages = await this.service.getUnread(bookingId, senderType);
        return successResponse(messages);
    }

    // ============================================
    // POST /api/v1/messages/mark-read
    // ============================================
    async markAsRead(request: NextRequest) {
        await authenticate(request);
        const dto = await validateBody(request, MarkMessagesReadSchema);

        await this.service.markAsRead(dto.messageIds);
        return successResponse({ marked: dto.messageIds.length });
    }

    // ============================================
    // POST /api/v1/bookings/:bookingId/messages/mark-all-read
    // ============================================
    async markAllAsRead(request: NextRequest, params: { bookingId: string }) {
        const auth = await authenticate(request);
        const bookingId = validatePathParam(params.bookingId, 'bookingId', { uuid: true });

        const senderType = auth.user.role === 'vendor' ? 'vendor' : 'planner';
        await this.service.markAllAsRead(bookingId, senderType);
        return successResponse({ markedAllRead: true });
    }

    // ============================================
    // GET /api/v1/bookings/:bookingId/messages/unread-count
    // ============================================
    async getUnreadCount(request: NextRequest, params: { bookingId: string }) {
        const auth = await authenticate(request);
        const bookingId = validatePathParam(params.bookingId, 'bookingId', { uuid: true });

        const senderType = auth.user.role === 'vendor' ? 'vendor' : 'planner';
        const count = await this.service.getUnreadCount(bookingId, senderType);
        return successResponse({ unreadCount: count });
    }
}

// Export singleton instance
export const messageController = new MessageController();
