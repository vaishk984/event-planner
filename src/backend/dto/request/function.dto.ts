/**
 * EventFunction DTOs
 * 
 * Request DTOs for function operations using Zod validation.
 */

import { z } from 'zod';

// Function Types
export const FunctionTypeEnum = z.enum([
    'wedding',
    'reception',
    'sangeet',
    'mehendi',
    'haldi',
    'cocktail',
    'after_party',
    'ceremony',
    'conference',
    'dinner',
    'custom',
]);

// Create Function
export const CreateFunctionSchema = z.object({
    eventId: z.string().uuid(),
    name: z.string().min(1).max(100),
    type: FunctionTypeEnum,
    date: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    venueName: z.string().max(200).optional(),
    venueAddress: z.string().max(500).optional(),
    guestCount: z.number().int().min(0).optional(),
    budget: z.number().min(0).optional(),
    notes: z.string().max(2000).optional(),
});

export type CreateFunctionDto = z.infer<typeof CreateFunctionSchema>;

// Update Function
export const UpdateFunctionSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    type: FunctionTypeEnum.optional(),
    date: z.string().nullable().optional(),
    startTime: z.string().nullable().optional(),
    endTime: z.string().nullable().optional(),
    venueName: z.string().max(200).nullable().optional(),
    venueAddress: z.string().max(500).nullable().optional(),
    guestCount: z.number().int().min(0).nullable().optional(),
    budget: z.number().min(0).nullable().optional(),
    notes: z.string().max(2000).nullable().optional(),
});

export type UpdateFunctionDto = z.infer<typeof UpdateFunctionSchema>;

// Query Functions
export const QueryFunctionsSchema = z.object({
    eventId: z.string().uuid().optional(),
    type: FunctionTypeEnum.optional(),
});

export type QueryFunctionsDto = z.infer<typeof QueryFunctionsSchema>;

// Reorder Functions
export const ReorderFunctionsSchema = z.object({
    items: z.array(z.object({
        id: z.string().uuid(),
        sortOrder: z.number().int().min(0),
    })),
});

export type ReorderFunctionsDto = z.infer<typeof ReorderFunctionsSchema>;
