/**
 * Booking Controller
 * 
 * API endpoints for BookingRequest operations (planner-vendor workflow).
 */

import { NextRequest } from 'next/server';
import { BookingService, bookingService } from '../services';
import {
    CreateBookingRequestSchema,
    UpdateBookingRequestSchema,
    SubmitQuoteSchema,
    AcceptQuoteSchema,
    QueryBookingsSchema
} from '../dto/request';
import { validateBody, validateQuery, validatePathParam } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { successResponse, createdResponse, errorResponse } from '../utils/response';
import { createLogger } from '../utils/logger';

const logger = createLogger('BookingController');

export class BookingController {
    constructor(private service: BookingService = bookingService) { }

    // ============================================
    // GET /api/v1/bookings
    // ============================================
    async list(request: NextRequest) {
        const auth = await authenticate(request);
        const query = validateQuery(request, QueryBookingsSchema);

        if (query.eventId) {
            const bookings = await this.service.getByEvent(query.eventId);
            return successResponse(bookings);
        }

        const bookings = await this.service.getActiveForPlanner(auth.user.id);
        return successResponse(bookings);
    }

    // ============================================
    // GET /api/v1/bookings/:id
    // ============================================
    async getById(request: NextRequest, params: { id: string }) {
        await authenticate(request);
        const id = validatePathParam(params.id, 'id', { uuid: true });

        const booking = await this.service.getById(id);
        return successResponse(booking);
    }

    // ============================================
    // POST /api/v1/bookings
    // ============================================
    async create(request: NextRequest) {
        const auth = await authenticate(request);
        const dto = await validateBody(request, CreateBookingRequestSchema);

        const booking = await this.service.create(dto, auth.user.id);
        return createdResponse(booking);
    }

    // ============================================
    // PUT /api/v1/bookings/:id
    // ============================================
    async update(request: NextRequest, params: { id: string }) {
        await authenticate(request);
        const id = validatePathParam(params.id, 'id', { uuid: true });
        const dto = await validateBody(request, UpdateBookingRequestSchema);

        const booking = await this.service.update(id, dto);
        return successResponse(booking);
    }

    // ============================================
    // POST /api/v1/bookings/:id/submit-quote
    // ============================================
    async submitQuote(request: NextRequest, params: { id: string }) {
        await authenticate(request);
        const id = validatePathParam(params.id, 'id', { uuid: true });
        const dto = await validateBody(request, SubmitQuoteSchema);

        const booking = await this.service.submitQuote(id, dto);
        return successResponse(booking);
    }

    // ============================================
    // POST /api/v1/bookings/:id/accept
    // ============================================
    async acceptQuote(request: NextRequest, params: { id: string }) {
        await authenticate(request);
        const id = validatePathParam(params.id, 'id', { uuid: true });
        const dto = await validateBody(request, AcceptQuoteSchema);

        const booking = await this.service.acceptQuote(id, dto);
        return successResponse(booking);
    }

    // ============================================
    // POST /api/v1/bookings/:id/decline
    // ============================================
    async declineQuote(request: NextRequest, params: { id: string }) {
        await authenticate(request);
        const id = validatePathParam(params.id, 'id', { uuid: true });
        const body = await request.json().catch(() => ({}));

        const booking = await this.service.declineQuote(id, body.reason);
        return successResponse(booking);
    }

    // ============================================
    // POST /api/v1/bookings/:id/cancel
    // ============================================
    async cancel(request: NextRequest, params: { id: string }) {
        await authenticate(request);
        const id = validatePathParam(params.id, 'id', { uuid: true });
        const body = await request.json().catch(() => ({}));

        const booking = await this.service.cancel(id, body.reason);
        return successResponse(booking);
    }

    // ============================================
    // POST /api/v1/bookings/:id/milestones/:milestoneId/pay
    // ============================================
    async markMilestonePaid(request: NextRequest, params: { id: string; milestoneId: string }) {
        await authenticate(request);
        const id = validatePathParam(params.id, 'id', { uuid: true });
        const milestoneId = validatePathParam(params.milestoneId, 'milestoneId', { uuid: true });

        const booking = await this.service.markMilestonePaid(id, milestoneId);
        return successResponse(booking);
    }

    // ============================================
    // GET /api/v1/bookings/stats
    // ============================================
    async getStats(request: NextRequest) {
        const auth = await authenticate(request);

        const stats = await this.service.getStats(auth.user.id);
        return successResponse(stats);
    }

    // ============================================
    // GET /api/v1/vendors/:vendorId/bookings/pending
    // ============================================
    async getPendingForVendor(request: NextRequest, params: { vendorId: string }) {
        await authenticate(request);
        const vendorId = validatePathParam(params.vendorId, 'vendorId', { uuid: true });

        const bookings = await this.service.getPendingForVendor(vendorId);
        return successResponse(bookings);
    }
}

// Export singleton instance
export const bookingController = new BookingController();
