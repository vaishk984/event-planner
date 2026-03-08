/**
 * Client DTOs
 * 
 * Request DTOs for client/CRM operations using Zod validation.
 */

import { z } from 'zod';

export const ClientStatusEnum = z.enum(['prospect', 'active', 'past', 'inactive']);

// Client Preferences
export const ClientPreferencesSchema = z.object({
    communicationMethod: z.enum(['email', 'phone', 'whatsapp']).default('whatsapp'),
    budgetRange: z.object({
        min: z.number().min(0),
        max: z.number().min(0),
    }).nullable().optional(),
    preferredVenues: z.array(z.string()).default([]),
    dietaryRestrictions: z.array(z.string()).default([]),
    notes: z.string().max(2000).default(''),
});

// Create Client
export const CreateClientSchema = z.object({
    name: z.string().min(1).max(200),
    email: z.string().email().optional(),
    phone: z.string().max(20).optional(),
    alternatePhone: z.string().max(20).optional(),
    address: z.string().max(500).optional(),
    city: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
    preferences: ClientPreferencesSchema.optional(),
    referralSource: z.string().max(100).optional(),
    notes: z.string().max(2000).optional(),
});

export type CreateClientDto = z.infer<typeof CreateClientSchema>;

// Update Client
export const UpdateClientSchema = z.object({
    name: z.string().min(1).max(200).optional(),
    email: z.string().email().nullable().optional(),
    phone: z.string().max(20).nullable().optional(),
    alternatePhone: z.string().max(20).nullable().optional(),
    address: z.string().max(500).nullable().optional(),
    city: z.string().max(100).nullable().optional(),
    state: z.string().max(100).nullable().optional(),
    status: ClientStatusEnum.optional(),
    preferences: ClientPreferencesSchema.partial().optional(),
    notes: z.string().max(2000).nullable().optional(),
});

export type UpdateClientDto = z.infer<typeof UpdateClientSchema>;

// Query Clients
export const QueryClientsSchema = z.object({
    status: ClientStatusEnum.optional(),
    city: z.string().optional(),
    search: z.string().optional(),
    highValueOnly: z.coerce.boolean().default(false),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type QueryClientsDto = z.infer<typeof QueryClientsSchema>;
