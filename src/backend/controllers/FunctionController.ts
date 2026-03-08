/**
 * Function Controller
 * 
 * API endpoints for EventFunction operations.
 */

import { NextRequest } from 'next/server';
import { FunctionService, functionService } from '../services';
import {
    CreateFunctionSchema,
    UpdateFunctionSchema,
    QueryFunctionsSchema,
    ReorderFunctionsSchema
} from '../dto/request';
import { validateBody, validateQuery, validatePathParam } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { successResponse, createdResponse, errorResponse } from '../utils/response';
import { createLogger } from '../utils/logger';

const logger = createLogger('FunctionController');

export class FunctionController {
    constructor(private service: FunctionService = functionService) { }

    // ============================================
    // GET /api/v1/events/:eventId/functions
    // ============================================
    async list(request: NextRequest, params: { eventId: string }) {
        await authenticate(request);
        const eventId = validatePathParam(params.eventId, 'eventId', { uuid: true });

        const functions = await this.service.getByEvent(eventId);
        return successResponse(functions);
    }

    // ============================================
    // GET /api/v1/functions/:id
    // ============================================
    async getById(request: NextRequest, params: { id: string }) {
        await authenticate(request);
        const id = validatePathParam(params.id, 'id', { uuid: true });

        const fn = await this.service.getById(id);
        return successResponse(fn);
    }

    // ============================================
    // POST /api/v1/functions
    // ============================================
    async create(request: NextRequest) {
        await authenticate(request);
        const dto = await validateBody(request, CreateFunctionSchema);

        const fn = await this.service.create(dto);
        return createdResponse(fn);
    }

    // ============================================
    // PUT /api/v1/functions/:id
    // ============================================
    async update(request: NextRequest, params: { id: string }) {
        await authenticate(request);
        const id = validatePathParam(params.id, 'id', { uuid: true });
        const dto = await validateBody(request, UpdateFunctionSchema);

        const fn = await this.service.update(id, dto);
        return successResponse(fn);
    }

    // ============================================
    // DELETE /api/v1/functions/:id
    // ============================================
    async delete(request: NextRequest, params: { id: string }) {
        await authenticate(request);
        const id = validatePathParam(params.id, 'id', { uuid: true });

        await this.service.delete(id);
        return successResponse({ deleted: true, id });
    }

    // ============================================
    // PUT /api/v1/events/:eventId/functions/reorder
    // ============================================
    async reorder(request: NextRequest, params: { eventId: string }) {
        await authenticate(request);
        validatePathParam(params.eventId, 'eventId', { uuid: true });
        const dto = await validateBody(request, ReorderFunctionsSchema);

        await this.service.reorder(dto.items);
        return successResponse({ reordered: true });
    }

    // ============================================
    // GET /api/v1/functions/types
    // ============================================
    async getTypes(request: NextRequest) {
        await authenticate(request);

        const types = this.service.getAvailableTypes();
        return successResponse(types);
    }
}

// Export singleton instance
export const functionController = new FunctionController();
