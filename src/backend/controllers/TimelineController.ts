/**
 * Timeline Controller
 * 
 * Handles HTTP requests for timeline/run sheet operations.
 */

import { NextRequest } from 'next/server';
import { TimelineService, timelineService } from '../services/TimelineService';
import { ApiResponse } from '../utils';
import {
    CreateTimelineItemSchema,
    UpdateTimelineItemSchema,
    UpdateTimelineStatusSchema,
    ReorderTimelineSchema,
    QueryTimelineSchema,
    ApplyTemplateSchema,
} from '../dto/request/timeline.dto';
import { mapTimelineItemToResponse, TimelineItemResponseDto } from '../dto/response/timeline.response';

export class TimelineController {
    constructor(private service: TimelineService = timelineService) { }

    /**
     * GET /api/v1/timeline - List timeline items
     */
    async list(request: NextRequest) {
        const searchParams = Object.fromEntries(request.nextUrl.searchParams);
        const query = QueryTimelineSchema.parse(searchParams);

        if (query.functionId) {
            const items = await this.service.getByFunction(query.functionId);
            return ApiResponse.success(items.map(mapTimelineItemToResponse));
        }

        if (query.eventId) {
            const items = await this.service.getByEvent(query.eventId);
            return ApiResponse.success(items.map(mapTimelineItemToResponse));
        }

        return ApiResponse.error('Either functionId or eventId required', 'VALIDATION_ERROR', 400);
    }

    /**
     * GET /api/v1/timeline/:id - Get single item
     */
    async getById(request: NextRequest, params: { id: string }) {
        const item = await this.service.getById(params.id);
        return ApiResponse.success(mapTimelineItemToResponse(item));
    }

    /**
     * POST /api/v1/timeline - Create item
     */
    async create(request: NextRequest) {
        const body = await request.json();
        const dto = CreateTimelineItemSchema.parse(body);
        const item = await this.service.create(dto);
        return ApiResponse.created(mapTimelineItemToResponse(item));
    }

    /**
     * PUT /api/v1/timeline/:id - Update item
     */
    async update(request: NextRequest, params: { id: string }) {
        const body = await request.json();
        const dto = UpdateTimelineItemSchema.parse(body);
        const item = await this.service.update(params.id, dto);
        return ApiResponse.success(mapTimelineItemToResponse(item));
    }

    /**
     * DELETE /api/v1/timeline/:id - Delete item
     */
    async delete(request: NextRequest, params: { id: string }) {
        await this.service.delete(params.id);
        return ApiResponse.deleted(params.id);
    }

    /**
     * PATCH /api/v1/timeline/:id/status - Update status
     */
    async updateStatus(request: NextRequest, params: { id: string }) {
        const body = await request.json();
        const dto = UpdateTimelineStatusSchema.parse(body);
        const item = await this.service.updateStatus(params.id, dto);
        return ApiResponse.success(mapTimelineItemToResponse(item));
    }

    /**
     * POST /api/v1/timeline/reorder - Reorder items
     */
    async reorder(request: NextRequest) {
        const body = await request.json();
        const dto = ReorderTimelineSchema.parse(body);
        await this.service.reorder(dto.items);
        return ApiResponse.success({ reordered: true, count: dto.items.length });
    }

    /**
     * GET /api/v1/functions/:id/timeline - Get by function
     */
    async getByFunction(request: NextRequest, params: { id: string }) {
        const items = await this.service.getByFunction(params.id);
        return ApiResponse.success(items.map(mapTimelineItemToResponse));
    }

    /**
     * POST /api/v1/functions/:id/timeline/template - Apply template
     */
    async applyTemplate(request: NextRequest, params: { id: string }) {
        const body = await request.json();
        const dto = ApplyTemplateSchema.parse(body);

        // We need eventId - get it from the first existing item or require in body
        const searchParams = Object.fromEntries(request.nextUrl.searchParams);
        const eventId = searchParams.eventId as string;

        if (!eventId) {
            return ApiResponse.error('eventId query parameter required', 'VALIDATION_ERROR', 400);
        }

        const items = await this.service.applyTemplate(
            eventId,
            params.id,
            dto.template,
            dto.clearExisting
        );

        return ApiResponse.created({
            applied: true,
            template: dto.template,
            items: items.map(mapTimelineItemToResponse),
        });
    }

    /**
     * GET /api/v1/functions/:id/timeline/overview - Get function overview
     */
    async getOverview(request: NextRequest, params: { id: string }) {
        const overview = await this.service.getOverview(params.id);
        return ApiResponse.success({
            ...overview,
            nextItem: overview.nextItem ? mapTimelineItemToResponse(overview.nextItem) : null,
        });
    }

    /**
     * GET /api/v1/timeline/templates - Get available templates
     */
    async getTemplates() {
        const templates = this.service.getTemplateNames();
        return ApiResponse.success({ templates });
    }
}

// Singleton instance
export const timelineController = new TimelineController();
