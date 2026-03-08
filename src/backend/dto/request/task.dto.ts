/**
 * Task Request DTOs
 * 
 * Data Transfer Objects for task-related API requests.
 */

import { z } from 'zod';

// ============================================
// CREATE TASK DTO
// ============================================

export const CreateTaskSchema = z.object({
    eventId: z.string().uuid('Valid event ID is required'),
    vendorId: z.string().uuid('Valid vendor ID is required'),
    serviceId: z.string().uuid().optional(),
    title: z.string().min(1, 'Title is required').max(255),
    description: z.string().max(2000).optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional(),
    dueDate: z.string().datetime().optional(),
});

export type CreateTaskDto = z.infer<typeof CreateTaskSchema>;

// ============================================
// UPDATE TASK DTO
// ============================================

export const UpdateTaskSchema = z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().max(2000).optional().nullable(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    startTime: z.string().datetime().optional().nullable(),
    endTime: z.string().datetime().optional().nullable(),
    dueDate: z.string().datetime().optional().nullable(),
    notes: z.string().max(2000).optional().nullable(),
});

export type UpdateTaskDto = z.infer<typeof UpdateTaskSchema>;

// ============================================
// UPDATE TASK STATUS DTO
// ============================================

export const UpdateTaskStatusSchema = z.object({
    status: z.enum(['pending', 'accepted', 'rejected', 'in_progress', 'completed', 'verified']),
    reason: z.string().max(500).optional(), // For rejection reason
});

export type UpdateTaskStatusDto = z.infer<typeof UpdateTaskStatusSchema>;

// ============================================
// COMPLETE TASK DTO
// ============================================

export const CompleteTaskSchema = z.object({
    proofUrls: z.array(z.string().url()).min(1, 'At least one proof is required').max(10),
    notes: z.string().max(1000).optional(),
});

export type CompleteTaskDto = z.infer<typeof CompleteTaskSchema>;

// ============================================
// QUERY TASKS DTO
// ============================================

export const QueryTasksSchema = z.object({
    eventId: z.string().uuid().optional(),
    vendorId: z.string().uuid().optional(),
    status: z.enum(['pending', 'accepted', 'rejected', 'in_progress', 'completed', 'verified']).optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.enum(['createdAt', 'dueDate', 'priority', 'status']).default('dueDate'),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type QueryTasksDto = z.infer<typeof QueryTasksSchema>;
