/**
 * Timeline Request DTOs
 * 
 * Data Transfer Objects for timeline-related API requests.
 */

import { z } from 'zod';

// Time format: "HH:MM" (24h)
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

// ============================================
// CREATE TIMELINE ITEM DTO
// ============================================

export const CreateTimelineItemSchema = z.object({
    eventId: z.string().uuid('Valid event ID required'),
    functionId: z.string().uuid('Valid function ID required'),

    startTime: z.string().regex(timeRegex, 'Time must be in HH:MM format'),
    endTime: z.string().regex(timeRegex, 'Time must be in HH:MM format').optional(),
    duration: z.number().int().min(1).max(1440).optional(), // max 24 hours

    title: z.string().min(1, 'Title is required').max(255),
    description: z.string().max(1000).optional(),
    location: z.string().max(255).optional(),

    owner: z.string().min(1, 'Owner is required').max(100),
    vendorId: z.string().uuid().optional(),

    notes: z.string().max(2000).optional(),
    dependsOn: z.array(z.string().uuid()).optional(),
});

export type CreateTimelineItemDto = z.infer<typeof CreateTimelineItemSchema>;

// ============================================
// UPDATE TIMELINE ITEM DTO
// ============================================

export const UpdateTimelineItemSchema = z.object({
    startTime: z.string().regex(timeRegex, 'Time must be in HH:MM format').optional(),
    endTime: z.string().regex(timeRegex, 'Time must be in HH:MM format').optional().nullable(),
    duration: z.number().int().min(1).max(1440).optional().nullable(),

    title: z.string().min(1).max(255).optional(),
    description: z.string().max(1000).optional().nullable(),
    location: z.string().max(255).optional().nullable(),

    owner: z.string().min(1).max(100).optional(),
    vendorId: z.string().uuid().optional().nullable(),

    notes: z.string().max(2000).optional().nullable(),
    dependsOn: z.array(z.string().uuid()).optional().nullable(),
});

export type UpdateTimelineItemDto = z.infer<typeof UpdateTimelineItemSchema>;

// ============================================
// UPDATE STATUS DTO
// ============================================

export const UpdateTimelineStatusSchema = z.object({
    status: z.enum(['pending', 'in_progress', 'completed', 'delayed']),
    notes: z.string().max(500).optional(),
});

export type UpdateTimelineStatusDto = z.infer<typeof UpdateTimelineStatusSchema>;

// ============================================
// REORDER DTO
// ============================================

export const ReorderTimelineSchema = z.object({
    items: z.array(z.object({
        id: z.string().uuid(),
        sortOrder: z.number().int().min(0),
    })).min(1, 'At least one item required'),
});

export type ReorderTimelineDto = z.infer<typeof ReorderTimelineSchema>;

// ============================================
// QUERY TIMELINE DTO
// ============================================

export const QueryTimelineSchema = z.object({
    eventId: z.string().uuid().optional(),
    functionId: z.string().uuid().optional(),
    status: z.enum(['pending', 'in_progress', 'completed', 'delayed']).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(50),
    sortBy: z.enum(['startTime', 'sortOrder', 'status', 'createdAt']).default('sortOrder'),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type QueryTimelineDto = z.infer<typeof QueryTimelineSchema>;

// ============================================
// APPLY TEMPLATE DTO
// ============================================

export const ApplyTemplateSchema = z.object({
    template: z.enum(['wedding_ceremony', 'reception', 'sangeet', 'mehendi', 'haldi']),
    clearExisting: z.boolean().default(false),
});

export type ApplyTemplateDto = z.infer<typeof ApplyTemplateSchema>;
