/**
 * Lead Controller
 * 
 * Handles API requests for lead management.
 */

import { NextRequest, NextResponse } from 'next/server';
import { leadService, LeadResponseDto } from '../services';
import { CreateLeadSchema, UpdateLeadSchema, QueryLeadsSchema, UpdateLeadStatusSchema } from '../dto/request';
import { validateBody, validateQuery, validatePathParam } from '../middleware';
import { ApiResponse } from '../utils';
import { createLogger } from '../utils';

const logger = createLogger('LeadController');

export class LeadController {
    /**
     * GET /api/v1/leads
     * List leads for the authenticated planner
     */
    async list(request: NextRequest): Promise<NextResponse> {
        const query = validateQuery(request, QueryLeadsSchema);

        // TODO: Get planner ID from auth context
        const plannerId = 'demo-planner-id';

        const result = await leadService.getByPlanner(plannerId, query);
        return ApiResponse.paginated(result.items, result.meta);
    }

    /**
     * GET /api/v1/leads/:id
     * Get a single lead
     */
    async getById(request: NextRequest, params: { id: string }): Promise<NextResponse> {
        const id = validatePathParam(params.id, 'id', { uuid: true });
        const lead = await leadService.getById(id);
        return ApiResponse.success(lead);
    }

    /**
     * POST /api/v1/leads
     * Create a new lead
     */
    async create(request: NextRequest): Promise<NextResponse> {
        const body = await validateBody(request, CreateLeadSchema);

        // TODO: Get planner ID from auth context
        const plannerId = 'demo-planner-id';

        const lead = await leadService.create(body, plannerId);
        return ApiResponse.created(lead);
    }

    /**
     * PUT /api/v1/leads/:id
     * Update a lead
     */
    async update(request: NextRequest, params: { id: string }): Promise<NextResponse> {
        const id = validatePathParam(params.id, 'id', { uuid: true });
        const body = await validateBody(request, UpdateLeadSchema);

        const lead = await leadService.update(id, body);
        return ApiResponse.success(lead);
    }

    /**
     * PATCH /api/v1/leads/:id/status
     * Update lead status
     */
    async updateStatus(request: NextRequest, params: { id: string }): Promise<NextResponse> {
        const id = validatePathParam(params.id, 'id', { uuid: true });
        const body = await validateBody(request, UpdateLeadStatusSchema);

        const lead = await leadService.updateStatus(id, body.status);
        return ApiResponse.success(lead);
    }

    /**
     * DELETE /api/v1/leads/:id
     * Delete a lead
     */
    async delete(request: NextRequest, params: { id: string }): Promise<NextResponse> {
        const id = validatePathParam(params.id, 'id', { uuid: true });
        await leadService.delete(id);
        return ApiResponse.deleted(id);
    }

    /**
     * GET /api/v1/leads/hot
     * Get hot leads (score >= 70)
     */
    async getHotLeads(request: NextRequest): Promise<NextResponse> {
        // TODO: Get planner ID from auth context
        const plannerId = 'demo-planner-id';

        const leads = await leadService.getHotLeads(plannerId);
        return ApiResponse.success(leads);
    }

    /**
     * POST /api/v1/leads/:id/convert
     * Convert lead to event
     */
    async convertToEvent(request: NextRequest, params: { id: string }): Promise<NextResponse> {
        const id = validatePathParam(params.id, 'id', { uuid: true });
        const lead = await leadService.convertToEvent(id);
        return ApiResponse.success(lead, 'Lead converted to event');
    }
}

export const leadController = new LeadController();
