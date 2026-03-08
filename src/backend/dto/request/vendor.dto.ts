/**
 * Vendor Request DTOs
 * 
 * Data Transfer Objects for vendor-related API requests.
 */

import { z } from 'zod';

// ============================================
// CREATE VENDOR DTO
// ============================================

export const CreateVendorSchema = z.object({
    companyName: z.string().min(1, 'Company name is required').max(255),
    category: z.enum([
        'photography', 'videography', 'catering', 'decoration',
        'music', 'venue', 'makeup', 'transportation', 'other'
    ]),
    description: z.string().max(2000).optional(),
    location: z.string().min(1, 'Location is required').max(255),
    priceMin: z.number().positive('Price must be positive'),
    priceMax: z.number().positive('Price must be positive'),
    imageUrl: z.string().url().optional(),
    portfolioUrls: z.array(z.string().url()).max(10).optional(),
}).refine(data => data.priceMax >= data.priceMin, {
    message: 'Maximum price must be greater than or equal to minimum price',
    path: ['priceMax'],
});

export type CreateVendorDto = z.infer<typeof CreateVendorSchema>;

// ============================================
// UPDATE VENDOR DTO
// ============================================

export const UpdateVendorSchema = z.object({
    companyName: z.string().min(1).max(255).optional(),
    category: z.enum([
        'photography', 'videography', 'catering', 'decoration',
        'music', 'venue', 'makeup', 'transportation', 'other'
    ]).optional(),
    description: z.string().max(2000).optional().nullable(),
    location: z.string().max(255).optional(),
    priceMin: z.number().positive().optional(),
    priceMax: z.number().positive().optional(),
    imageUrl: z.string().url().optional().nullable(),
    portfolioUrls: z.array(z.string().url()).max(10).optional(),
});

export type UpdateVendorDto = z.infer<typeof UpdateVendorSchema>;

// ============================================
// QUERY VENDORS DTO
// ============================================

export const QueryVendorsSchema = z.object({
    category: z.enum([
        'photography', 'videography', 'catering', 'decoration',
        'music', 'venue', 'makeup', 'transportation', 'other'
    ]).optional(),
    location: z.string().optional(),
    maxPrice: z.coerce.number().positive().optional(),
    minRating: z.coerce.number().min(0).max(5).optional(),
    isVerified: z.coerce.boolean().optional(),
    search: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.enum(['rating', 'priceMin', 'createdAt', 'companyName']).default('rating'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type QueryVendorsDto = z.infer<typeof QueryVendorsSchema>;

// ============================================
// UPDATE AVAILABILITY DTO
// ============================================

export const UpdateAvailabilitySchema = z.object({
    dates: z.array(z.object({
        date: z.string().datetime(),
        status: z.enum(['available', 'busy', 'off_duty']),
    })).min(1).max(365),
});

export type UpdateAvailabilityDto = z.infer<typeof UpdateAvailabilitySchema>;
