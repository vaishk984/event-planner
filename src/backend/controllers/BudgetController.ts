/**
 * Budget Controller
 * 
 * API endpoints for BudgetItem operations.
 */

import { NextRequest } from 'next/server';
import { BudgetService, budgetService } from '../services';
import {
    CreateBudgetItemSchema,
    UpdateBudgetItemSchema,
    AddBudgetPaymentSchema,
    QueryBudgetItemsSchema
} from '../dto/request';
import { validateBody, validateQuery, validatePathParam } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { successResponse, createdResponse, errorResponse } from '../utils/response';
import { createLogger } from '../utils/logger';

const logger = createLogger('BudgetController');

export class BudgetController {
    constructor(private service: BudgetService = budgetService) { }

    // ============================================
    // GET /api/v1/events/:eventId/budget
    // ============================================
    async list(request: NextRequest, params: { eventId: string }) {
        await authenticate(request);
        const eventId = validatePathParam(params.eventId, 'eventId', { uuid: true });

        const items = await this.service.getByEvent(eventId);
        return successResponse(items);
    }

    // ============================================
    // GET /api/v1/budget/:id
    // ============================================
    async getById(request: NextRequest, params: { id: string }) {
        await authenticate(request);
        const id = validatePathParam(params.id, 'id', { uuid: true });

        const item = await this.service.getById(id);
        return successResponse(item);
    }

    // ============================================
    // POST /api/v1/budget
    // ============================================
    async create(request: NextRequest) {
        await authenticate(request);
        const dto = await validateBody(request, CreateBudgetItemSchema);

        const item = await this.service.create(dto);
        return createdResponse(item);
    }

    // ============================================
    // PUT /api/v1/budget/:id
    // ============================================
    async update(request: NextRequest, params: { id: string }) {
        await authenticate(request);
        const id = validatePathParam(params.id, 'id', { uuid: true });
        const dto = await validateBody(request, UpdateBudgetItemSchema);

        const item = await this.service.update(id, dto);
        return successResponse(item);
    }

    // ============================================
    // DELETE /api/v1/budget/:id
    // ============================================
    async delete(request: NextRequest, params: { id: string }) {
        await authenticate(request);
        const id = validatePathParam(params.id, 'id', { uuid: true });

        await this.service.delete(id);
        return successResponse({ deleted: true, id });
    }

    // ============================================
    // POST /api/v1/budget/:id/payment
    // ============================================
    async addPayment(request: NextRequest, params: { id: string }) {
        await authenticate(request);
        const id = validatePathParam(params.id, 'id', { uuid: true });
        const dto = await validateBody(request, AddBudgetPaymentSchema);

        const item = await this.service.addPayment(id, dto.amount);
        return successResponse(item);
    }

    // ============================================
    // GET /api/v1/events/:eventId/budget/summary
    // ============================================
    async getSummary(request: NextRequest, params: { eventId: string }) {
        await authenticate(request);
        const eventId = validatePathParam(params.eventId, 'eventId', { uuid: true });

        const summary = await this.service.getSummary(eventId);
        return successResponse(summary);
    }

    // ============================================
    // GET /api/v1/events/:eventId/budget/over-budget
    // ============================================
    async getOverBudget(request: NextRequest, params: { eventId: string }) {
        await authenticate(request);
        const eventId = validatePathParam(params.eventId, 'eventId', { uuid: true });

        const items = await this.service.getOverBudget(eventId);
        return successResponse(items);
    }

    // ============================================
    // GET /api/v1/budget/categories
    // ============================================
    async getCategories(request: NextRequest) {
        await authenticate(request);

        const categories = this.service.getCategories();
        return successResponse(categories);
    }

    // ============================================
    // GET /api/v1/budget/recommended-split?total=5000000
    // ============================================
    async getRecommendedSplit(request: NextRequest) {
        await authenticate(request);
        const url = new URL(request.url);
        const total = parseInt(url.searchParams.get('total') || '0', 10);

        const split = this.service.getRecommendedSplit(total);
        return successResponse(split);
    }
}

// Export singleton instance
export const budgetController = new BudgetController();
