/**
 * Event Controller
 * 
 * Thin controller for Event API endpoints.
 * Only handles request/response - delegates to EventService.
 * Similar to Spring's @RestController.
 */

import { NextRequest } from 'next/server';
import { EventService, eventService } from '../services';
import { CreateEventSchema, UpdateEventSchema, UpdateEventStatusSchema, QueryEventsSchema } from '../dto/request';
import { validateBody, validateQuery, validatePathParam } from '../middleware/validation.middleware';
import { authenticate, AuthContext } from '../middleware/auth.middleware';
import { successResponse, createdResponse, errorResponse } from '../utils/response';
import { createLogger } from '../utils/logger';

const logger = createLogger('EventController');

export class EventController {
    constructor(private service: EventService = eventService) { }

    // ============================================
    // GET /api/v1/events
    // ============================================
    async list(request: NextRequest) {
        const auth = await authenticate(request);
        const query = validateQuery(request, QueryEventsSchema);

        const result = await this.service.getByPlanner(auth.user.id, query);
        return successResponse(result);
    }

    // ============================================
    // GET /api/v1/events/:id
    // ============================================
    async getById(request: NextRequest, params: { id: string }) {
        await authenticate(request);
        const id = validatePathParam(params.id, 'id', { uuid: true });

        const event = await this.service.getById(id);
        return successResponse(event);
    }

    // ============================================
    // POST /api/v1/events
    // ============================================
    async create(request: NextRequest) {
        const auth = await authenticate(request);
        const dto = await validateBody(request, CreateEventSchema);

        const event = await this.service.create(dto, auth.user.id);
        return createdResponse(event);
    }

    // ============================================
    // PUT /api/v1/events/:id
    // ============================================
    async update(request: NextRequest, params: { id: string }) {
        await authenticate(request);
        const id = validatePathParam(params.id, 'id', { uuid: true });
        const dto = await validateBody(request, UpdateEventSchema);

        const event = await this.service.update(id, dto);
        return successResponse(event);
    }

    // ============================================
    // PATCH /api/v1/events/:id/status
    // ============================================
    async updateStatus(request: NextRequest, params: { id: string }) {
        await authenticate(request);
        const id = validatePathParam(params.id, 'id', { uuid: true });
        const dto = await validateBody(request, UpdateEventStatusSchema);

        const event = await this.service.updateStatus(id, dto.status);
        return successResponse(event);
    }

    // ============================================
    // POST /api/v1/events/:id/send-proposal
    // ============================================
    async sendProposal(request: NextRequest, params: { id: string }) {
        await authenticate(request);
        const id = validatePathParam(params.id, 'id', { uuid: true });

        const event = await this.service.sendProposal(id);
        return successResponse(event);
    }

    // ============================================
    // POST /api/v1/events/:id/approve
    // ============================================
    async approve(request: NextRequest, params: { id: string }) {
        await authenticate(request);
        const id = validatePathParam(params.id, 'id', { uuid: true });

        const event = await this.service.approve(id);
        return successResponse(event);
    }

    // ============================================
    // DELETE /api/v1/events/:id
    // ============================================
    async delete(request: NextRequest, params: { id: string }) {
        await authenticate(request);
        const id = validatePathParam(params.id, 'id', { uuid: true });

        await this.service.delete(id);
        return successResponse({ deleted: true, id });
    }

    // ============================================
    // GET /api/v1/events/stats
    // ============================================
    async getStats(request: NextRequest) {
        const auth = await authenticate(request);

        const stats = await this.service.getStats(auth.user.id);
        return successResponse(stats);
    }

    // ============================================
    // GET /api/v1/events/upcoming
    // ============================================
    async getUpcoming(request: NextRequest) {
        const auth = await authenticate(request);

        const events = await this.service.getUpcoming(auth.user.id);
        return successResponse(events);
    }

    // ============================================
    // GET /api/v1/events/today
    // ============================================
    async getToday(request: NextRequest) {
        const auth = await authenticate(request);

        const events = await this.service.getToday(auth.user.id);
        return successResponse(events);
    }
}

// Export singleton instance
export const eventController = new EventController();
