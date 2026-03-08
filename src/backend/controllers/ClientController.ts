/**
 * Client Controller
 * 
 * API endpoints for Client/CRM operations.
 */

import { NextRequest } from 'next/server';
import { ClientService, clientService } from '../services';
import {
    CreateClientSchema,
    UpdateClientSchema,
    QueryClientsSchema
} from '../dto/request';
import { validateBody, validateQuery, validatePathParam } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { successResponse, createdResponse, errorResponse } from '../utils/response';
import { createLogger } from '../utils/logger';

const logger = createLogger('ClientController');

export class ClientController {
    constructor(private service: ClientService = clientService) { }

    // ============================================
    // GET /api/v1/clients
    // ============================================
    async list(request: NextRequest) {
        const auth = await authenticate(request);
        const query = validateQuery(request, QueryClientsSchema);

        if (query.search) {
            const clients = await this.service.search(auth.user.id, query.search);
            return successResponse(clients);
        }

        if (query.status) {
            const clients = await this.service.getByStatus(auth.user.id, query.status);
            return successResponse(clients);
        }

        if (query.highValueOnly) {
            const clients = await this.service.getHighValue(auth.user.id);
            return successResponse(clients);
        }

        const clients = await this.service.getByPlanner(auth.user.id);
        return successResponse(clients);
    }

    // ============================================
    // GET /api/v1/clients/:id
    // ============================================
    async getById(request: NextRequest, params: { id: string }) {
        await authenticate(request);
        const id = validatePathParam(params.id, 'id', { uuid: true });

        const client = await this.service.getById(id);
        return successResponse(client);
    }

    // ============================================
    // POST /api/v1/clients
    // ============================================
    async create(request: NextRequest) {
        const auth = await authenticate(request);
        const dto = await validateBody(request, CreateClientSchema);

        const client = await this.service.create(dto, auth.user.id);
        return createdResponse(client);
    }

    // ============================================
    // PUT /api/v1/clients/:id
    // ============================================
    async update(request: NextRequest, params: { id: string }) {
        await authenticate(request);
        const id = validatePathParam(params.id, 'id', { uuid: true });
        const dto = await validateBody(request, UpdateClientSchema);

        const client = await this.service.update(id, dto);
        return successResponse(client);
    }

    // ============================================
    // DELETE /api/v1/clients/:id
    // ============================================
    async delete(request: NextRequest, params: { id: string }) {
        await authenticate(request);
        const id = validatePathParam(params.id, 'id', { uuid: true });

        await this.service.delete(id);
        return successResponse({ deleted: true, id });
    }

    // ============================================
    // POST /api/v1/clients/:id/record-event
    // ============================================
    async recordEvent(request: NextRequest, params: { id: string }) {
        await authenticate(request);
        const id = validatePathParam(params.id, 'id', { uuid: true });
        const body = await request.json();

        const client = await this.service.recordEvent(id, body.eventAmount);
        return successResponse(client);
    }

    // ============================================
    // GET /api/v1/clients/stats
    // ============================================
    async getStats(request: NextRequest) {
        const auth = await authenticate(request);

        const stats = await this.service.getStats(auth.user.id);
        return successResponse(stats);
    }

    // ============================================
    // GET /api/v1/clients/high-value
    // ============================================
    async getHighValue(request: NextRequest) {
        const auth = await authenticate(request);

        const clients = await this.service.getHighValue(auth.user.id);
        return successResponse(clients);
    }
}

// Export singleton instance
export const clientController = new ClientController();
