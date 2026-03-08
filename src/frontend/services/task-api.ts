/**
 * Task API Service
 * 
 * Frontend service for task-related API calls.
 */

import { api } from './api-client';
import type { PaginatedResponseDto } from '@/src/backend/dto';

export interface TaskResponse {
    id: string;
    eventId: string;
    vendorId?: string;
    title: string;
    description?: string;
    status: 'pending' | 'in_progress' | 'completed' | 'verified' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    dueDate: string;
    completedAt?: string;
    completionProof?: string;
    completionNotes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTaskParams {
    eventId: string;
    vendorId?: string;
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    dueDate: string;
}

export interface UpdateTaskParams {
    title?: string;
    description?: string | null;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    dueDate?: string;
    vendorId?: string | null;
}

export interface CompleteTaskParams {
    proof?: string;
    notes?: string;
}

export interface QueryTasksParams {
    eventId?: string;
    vendorId?: string;
    status?: string;
    priority?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const taskApi = {
    /**
     * Get paginated list of tasks
     */
    async list(params?: QueryTasksParams): Promise<PaginatedResponseDto<TaskResponse>> {
        return api.get('/tasks', params as Record<string, string | number | boolean | undefined>);
    },

    /**
     * Get single task by ID
     */
    async getById(id: string): Promise<TaskResponse> {
        return api.get(`/tasks/${id}`);
    },

    /**
     * Create a new task
     */
    async create(data: CreateTaskParams): Promise<TaskResponse> {
        return api.post('/tasks', data);
    },

    /**
     * Update a task
     */
    async update(id: string, data: UpdateTaskParams): Promise<TaskResponse> {
        return api.put(`/tasks/${id}`, data);
    },

    /**
     * Update task status
     */
    async updateStatus(id: string, status: string, reason?: string): Promise<TaskResponse> {
        return api.patch(`/tasks/${id}/status`, { status, reason });
    },

    /**
     * Complete a task with proof
     */
    async complete(id: string, data: CompleteTaskParams): Promise<TaskResponse> {
        return api.post(`/tasks/${id}/complete`, data);
    },

    /**
     * Verify a completed task
     */
    async verify(id: string): Promise<TaskResponse> {
        return api.post(`/tasks/${id}/verify`);
    },

    /**
     * Delete a task
     */
    async delete(id: string): Promise<{ deleted: boolean; id: string }> {
        return api.delete(`/tasks/${id}`);
    },

    /**
     * Get overdue tasks
     */
    async getOverdue(): Promise<TaskResponse[]> {
        return api.get('/tasks/overdue');
    },
};
