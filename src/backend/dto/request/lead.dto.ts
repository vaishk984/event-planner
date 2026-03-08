/**
 * Lead Request DTOs
 * 
 * Data Transfer Objects for lead-related API requests.
 */

import { z } from 'zod';

// ============================================
// CREATE LEAD DTO
// ============================================

export const CreateLeadSchema = z.object({
    name: z.string().min(1, 'Name is required').max(255),
    email: z.string().email('Valid email is required'),
    phone: z.string().max(20).optional(),
    eventType: z.string().min(1, 'Event type is required'),
    budgetRange: z.string().optional(),
    eventDate: z.string().datetime().optional(),
    source: z.enum(['website', 'referral', 'social_media', 'advertisement', 'other']),
    notes: z.string().max(2000).optional(),
});

export type CreateLeadDto = z.infer<typeof CreateLeadSchema>;

// ============================================
// UPDATE LEAD DTO
// ============================================

export const UpdateLeadSchema = z.object({
    name: z.string().min(1).max(255).optional(),
    email: z.string().email().optional(),
    phone: z.string().max(20).optional().nullable(),
    eventType: z.string().optional(),
    budgetRange: z.string().optional().nullable(),
    eventDate: z.string().datetime().optional().nullable(),
    source: z.enum(['website', 'referral', 'social_media', 'advertisement', 'other']).optional(),
    status: z.enum(['new', 'contacted', 'qualified', 'proposal_sent', 'converted', 'lost']).optional(),
    score: z.number().int().min(0).max(100).optional(),
    notes: z.string().max(2000).optional().nullable(),
});

export type UpdateLeadDto = z.infer<typeof UpdateLeadSchema>;

// ============================================
// QUERY LEADS DTO
// ============================================

export const QueryLeadsSchema = z.object({
    status: z.enum(['new', 'contacted', 'qualified', 'proposal_sent', 'converted', 'lost']).optional(),
    source: z.enum(['website', 'referral', 'social_media', 'advertisement', 'other']).optional(),
    minScore: z.coerce.number().int().min(0).max(100).optional(),
    search: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.enum(['createdAt', 'score', 'name', 'status']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type QueryLeadsDto = z.infer<typeof QueryLeadsSchema>;

// ============================================
// UPDATE LEAD STATUS DTO
// ============================================

export const UpdateLeadStatusSchema = z.object({
    status: z.enum(['new', 'contacted', 'qualified', 'proposal_sent', 'converted', 'lost']),
});

export type UpdateLeadStatusDto = z.infer<typeof UpdateLeadStatusSchema>;

// ============================================
// IMPORT LEADS DTO (Bulk)
// ============================================

export const ImportLeadsSchema = z.object({
    leads: z.array(CreateLeadSchema).min(1, 'At least one lead is required').max(100, 'Maximum 100 leads per import'),
});

export type ImportLeadsDto = z.infer<typeof ImportLeadsSchema>;
