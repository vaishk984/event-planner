/**
 * Payment Controller
 * 
 * API endpoints for Payment operations.
 */

import { NextRequest } from 'next/server';
import { PaymentService, paymentService } from '../services';
import {
    CreatePaymentSchema,
    UpdatePaymentSchema,
    CompletePaymentSchema,
    QueryPaymentsSchema
} from '../dto/request';
import { validateBody, validateQuery, validatePathParam } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { successResponse, createdResponse, errorResponse } from '../utils/response';
import { createLogger } from '../utils/logger';

const logger = createLogger('PaymentController');

export class PaymentController {
    constructor(private service: PaymentService = paymentService) { }

    // ============================================
    // GET /api/v1/payments
    // ============================================
    async list(request: NextRequest) {
        await authenticate(request);
        const query = validateQuery(request, QueryPaymentsSchema);

        if (query.eventId) {
            const payments = await this.service.getByEvent(query.eventId);
            return successResponse(payments);
        }

        if (query.overdueOnly) {
            const payments = await this.service.getOverdue();
            return successResponse(payments);
        }

        const payments = await this.service.getPending();
        return successResponse(payments);
    }

    // ============================================
    // GET /api/v1/payments/:id
    // ============================================
    async getById(request: NextRequest, params: { id: string }) {
        await authenticate(request);
        const id = validatePathParam(params.id, 'id', { uuid: true });

        const payment = await this.service.getById(id);
        return successResponse(payment);
    }

    // ============================================
    // POST /api/v1/payments
    // ============================================
    async create(request: NextRequest) {
        await authenticate(request);
        const dto = await validateBody(request, CreatePaymentSchema);

        const payment = await this.service.create(dto);
        return createdResponse(payment);
    }

    // ============================================
    // PUT /api/v1/payments/:id
    // ============================================
    async update(request: NextRequest, params: { id: string }) {
        await authenticate(request);
        const id = validatePathParam(params.id, 'id', { uuid: true });
        const dto = await validateBody(request, UpdatePaymentSchema);

        const payment = await this.service.update(id, dto);
        return successResponse(payment);
    }

    // ============================================
    // POST /api/v1/payments/:id/complete
    // ============================================
    async complete(request: NextRequest, params: { id: string }) {
        await authenticate(request);
        const id = validatePathParam(params.id, 'id', { uuid: true });
        const dto = await validateBody(request, CompletePaymentSchema);

        const payment = await this.service.complete(id, dto);
        return successResponse(payment);
    }

    // ============================================
    // POST /api/v1/payments/:id/cancel
    // ============================================
    async cancel(request: NextRequest, params: { id: string }) {
        await authenticate(request);
        const id = validatePathParam(params.id, 'id', { uuid: true });
        const body = await request.json().catch(() => ({}));

        const payment = await this.service.cancel(id, body.reason);
        return successResponse(payment);
    }

    // ============================================
    // GET /api/v1/events/:eventId/payments/totals
    // ============================================
    async getTotals(request: NextRequest, params: { eventId: string }) {
        await authenticate(request);
        const eventId = validatePathParam(params.eventId, 'eventId', { uuid: true });

        const totals = await this.service.getTotals(eventId);
        return successResponse(totals);
    }

    // ============================================
    // GET /api/v1/payments/overdue
    // ============================================
    async getOverdue(request: NextRequest) {
        await authenticate(request);

        const payments = await this.service.getOverdue();
        return successResponse(payments);
    }

    // ============================================
    // GET /api/v1/payments/upcoming?days=7
    // ============================================
    async getUpcoming(request: NextRequest) {
        await authenticate(request);
        const url = new URL(request.url);
        const days = parseInt(url.searchParams.get('days') || '7', 10);

        const payments = await this.service.getUpcoming(days);
        return successResponse(payments);
    }

    // ============================================
    // GET /api/v1/payments/alerts
    // ============================================
    async getAlerts(request: NextRequest) {
        await authenticate(request);

        const alerts = await this.service.getAlerts();
        return successResponse(alerts);
    }
}

// Export singleton instance
export const paymentController = new PaymentController();
