/**
 * Event Request DTOs
 * 
 * Data Transfer Objects for event-related API requests.
 * Uses Zod for validation (similar to Spring's @Valid annotations).
 */

import { z } from 'zod';

// ============================================
// CREATE EVENT DTO
// ============================================

export const CreateEventSchema = z.object({
    name: z.string().min(1, 'Event name is required').max(255),
    type: z.enum(['wedding', 'corporate', 'birthday', 'social', 'other']),
    date: z.string().datetime({ message: 'Valid date is required' }),
    endDate: z.string().datetime().optional(),
    guestCount: z.number().int().min(1, 'Must have at least 1 guest').max(100000),
    budgetMin: z.number().positive('Budget must be positive'),
    budgetMax: z.number().positive('Budget must be positive'),
    city: z.string().min(1, 'City is required').max(100),
    venueType: z.enum(['personal', 'showroom']).default('personal'),
    venueId: z.string().uuid().optional(),
    notes: z.string().max(2000).optional(),
}).refine(data => data.budgetMax >= data.budgetMin, {
    message: 'Maximum budget must be greater than or equal to minimum budget',
    path: ['budgetMax'],
});

export type CreateEventDto = z.infer<typeof CreateEventSchema>;

// ============================================
// UPDATE EVENT DTO
// ============================================

export const UpdateEventSchema = z.object({
    name: z.string().min(1).max(255).optional(),
    type: z.enum(['wedding', 'corporate', 'birthday', 'social', 'other']).optional(),
    date: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    guestCount: z.number().int().min(1).max(100000).optional(),
    budgetMin: z.number().positive().optional(),
    budgetMax: z.number().positive().optional(),
    city: z.string().min(1).max(100).optional(),
    venueType: z.enum(['personal', 'showroom']).optional(),
    venueId: z.string().uuid().optional().nullable(),
    notes: z.string().max(2000).optional().nullable(),
});

export type UpdateEventDto = z.infer<typeof UpdateEventSchema>;

// ============================================
// UPDATE EVENT STATUS DTO
// ============================================

export const UpdateEventStatusSchema = z.object({
    status: z.enum(['draft', 'planning', 'proposed', 'approved', 'live', 'completed', 'archived', 'cancelled']),
});

export type UpdateEventStatusDto = z.infer<typeof UpdateEventStatusSchema>;

// ============================================
// QUERY EVENTS DTO
// ============================================

export const QueryEventsSchema = z.object({
    status: z.enum(['draft', 'planning', 'proposed', 'approved', 'live', 'completed', 'archived', 'cancelled']).optional(),
    type: z.enum(['wedding', 'corporate', 'birthday', 'social', 'other']).optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
    city: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.enum(['date', 'createdAt', 'name', 'status']).default('date'),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type QueryEventsDto = z.infer<typeof QueryEventsSchema>;
