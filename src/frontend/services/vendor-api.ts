/**
 * Vendor API Service
 * 
 * Frontend service for vendor-related API calls.
 */

import { api } from './api-client';
import type { PaginatedResponseDto } from '@/src/backend/dto';

export interface VendorResponse {
    id: string;
    userId: string;
    companyName: string;
    category: string;
    description?: string;
    location: string;
    priceRange: { min: number; max: number };
    rating: number;
    reviewCount: number;
    isVerified: boolean;
    imageUrl?: string;
    portfolioUrls: string[];
    priceLevel: 'budget' | 'mid-range' | 'premium';
    createdAt: string;
    updatedAt: string;
}

export interface CreateVendorParams {
    companyName: string;
    category: string;
    description?: string;
    location: string;
    priceMin: number;
    priceMax: number;
    imageUrl?: string;
    portfolioUrls?: string[];
}

export interface UpdateVendorParams {
    companyName?: string;
    category?: string;
    description?: string | null;
    location?: string;
    priceMin?: number;
    priceMax?: number;
    imageUrl?: string | null;
    portfolioUrls?: string[];
}

export interface QueryVendorsParams {
    category?: string;
    location?: string;
    maxPrice?: number;
    minRating?: number;
    isVerified?: boolean;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const vendorApi = {
    /**
     * Search/list vendors
     */
    async list(params?: QueryVendorsParams): Promise<PaginatedResponseDto<VendorResponse>> {
        return api.get('/vendors', params as Record<string, string | number | boolean | undefined>);
    },

    /**
     * Get single vendor by ID
     */
    async getById(id: string): Promise<VendorResponse> {
        return api.get(`/vendors/${id}`);
    },

    /**
     * Create vendor profile
     */
    async create(data: CreateVendorParams): Promise<VendorResponse> {
        return api.post('/vendors', data);
    },

    /**
     * Update vendor
     */
    async update(id: string, data: UpdateVendorParams): Promise<VendorResponse> {
        return api.put(`/vendors/${id}`, data);
    },

    /**
     * Delete vendor
     */
    async delete(id: string): Promise<{ deleted: boolean; id: string }> {
        return api.delete(`/vendors/${id}`);
    },

    /**
     * Get verified vendors
     */
    async getVerified(): Promise<VendorResponse[]> {
        return api.get('/vendors/verified');
    },

    /**
     * Get current user's vendor profile
     */
    async getMyProfile(): Promise<VendorResponse | null> {
        return api.get('/vendors/me');
    },
};
