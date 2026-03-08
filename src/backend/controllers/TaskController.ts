/**
 * Task Controller
 * 
 * Handles API requests for task management.
 */

import { NextRequest, NextResponse } from 'next/server';
import { taskService, TaskResponseDto } from '../services';
import { CreateTaskSchema, UpdateTaskSchema, QueryTasksSchema, UpdateTaskStatusSchema, CompleteTaskSchema } from '../dto/request';
import { validateBody, validateQuery, validatePathParam } from '../middleware';
import { ApiResponse } from '../utils';
import { createLogger } from '../utils';

const logger = createLogger('TaskController');

export class TaskController {
    /**
     * GET /api/v1/tasks
     * List tasks (by event or vendor)
     */
    async list(request: NextRequest): Promise<NextResponse> {
        const query = validateQuery(request, QueryTasksSchema);

        if (query.eventId) {
            const result = await taskService.getByEvent(query.eventId, query);
            return ApiResponse.paginated(result.items, result.meta);
        }

        if (query.vendorId) {
            const result = await taskService.getByVendor(query.vendorId, query);
            return ApiResponse.paginated(result.items, result.meta);
        }

        // Default: return empty if no filter
        return ApiResponse.success([]);
    }

    /**
     * GET /api/v1/tasks/:id
     * Get a single task
     */
    async getById(request: NextRequest, params: { id: string }): Promise<NextResponse> {
        const id = validatePathParam(params.id, 'id', { uuid: true });
        const task = await taskService.getById(id);
        return ApiResponse.success(task);
    }

    /**
     * POST /api/v1/tasks
     * Create a new task
     */
    async create(request: NextRequest): Promise<NextResponse> {
        const body = await validateBody(request, CreateTaskSchema);
        const task = await taskService.create(body);
        return ApiResponse.created(task);
    }

    /**
     * PUT /api/v1/tasks/:id
     * Update a task
     */
    async update(request: NextRequest, params: { id: string }): Promise<NextResponse> {
        const id = validatePathParam(params.id, 'id', { uuid: true });
        const body = await validateBody(request, UpdateTaskSchema);

        const task = await taskService.update(id, body);
        return ApiResponse.success(task);
    }

    /**
     * PATCH /api/v1/tasks/:id/status
     * Update task status
     */
    async updateStatus(request: NextRequest, params: { id: string }): Promise<NextResponse> {
        const id = validatePathParam(params.id, 'id', { uuid: true });
        const body = await validateBody(request, UpdateTaskStatusSchema);

        const task = await taskService.updateStatus(id, body.status, body.reason);
        return ApiResponse.success(task);
    }

    /**
     * POST /api/v1/tasks/:id/complete
     * Complete a task with proof
     */
    async complete(request: NextRequest, params: { id: string }): Promise<NextResponse> {
        const id = validatePathParam(params.id, 'id', { uuid: true });
        const body = await validateBody(request, CompleteTaskSchema);

        const task = await taskService.complete(id, body);
        return ApiResponse.success(task, 'Task completed');
    }

    /**
     * POST /api/v1/tasks/:id/verify
     * Verify a completed task
     */
    async verify(request: NextRequest, params: { id: string }): Promise<NextResponse> {
        const id = validatePathParam(params.id, 'id', { uuid: true });
        const task = await taskService.verify(id);
        return ApiResponse.success(task, 'Task verified');
    }

    /**
     * DELETE /api/v1/tasks/:id
     * Delete a task
     */
    async delete(request: NextRequest, params: { id: string }): Promise<NextResponse> {
        const id = validatePathParam(params.id, 'id', { uuid: true });
        await taskService.delete(id);
        return ApiResponse.deleted(id);
    }

    /**
     * GET /api/v1/tasks/pending
     * Get pending tasks for a vendor
     */
    async getPending(request: NextRequest): Promise<NextResponse> {
        // TODO: Get vendor ID from auth context
        const vendorId = 'demo-vendor-id';

        const tasks = await taskService.getPending(vendorId);
        return ApiResponse.success(tasks);
    }

    /**
     * GET /api/v1/tasks/overdue
     * Get overdue tasks
     */
    async getOverdue(request: NextRequest): Promise<NextResponse> {
        const tasks = await taskService.getOverdue();
        return ApiResponse.success(tasks);
    }
}

export const taskController = new TaskController();
