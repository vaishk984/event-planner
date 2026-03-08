/**
 * Lead API Service
 * 
 * Frontend service for lead-related API calls.
 */

import { api } from './api-client';
import type { PaginatedResponseDto } from '@/src/backend/dto';

export interface LeadResponse {
    id: string;
    name: string;
    email: string;
    phone?: string;
    eventType: string;
    budgetRange?: string;
    eventDate?: string;
    source: string;
    status: string;
    score: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateLeadParams {
    name: string;
    email: string;
    phone?: string;
    eventType: string;
    budgetRange?: string;
    eventDate?: string;
    source: 'website' | 'referral' | 'social_media' | 'advertisement' | 'other';
    notes?: string;
}

export interface UpdateLeadParams {
    name?: string;
    email?: string;
    phone?: string | null;
    eventType?: string;
    budgetRange?: string | null;
    eventDate?: string | null;
    source?: 'website' | 'referral' | 'social_media' | 'advertisement' | 'other';
    status?: 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'converted' | 'lost';
    score?: number;
    notes?: string | null;
}

export interface QueryLeadsParams {
    status?: string;
    source?: string;
    minScore?: number;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const leadApi = {
    /**
     * Get paginated list of leads
     */
    async list(params?: QueryLeadsParams): Promise<PaginatedResponseDto<LeadResponse>> {
        return api.get('/leads', params as Record<string, string | number | boolean | undefined>);
    },

    /**
     * Get single lead by ID
     */
    async getById(id: string): Promise<LeadResponse> {
        return api.get(`/leads/${id}`);
    },

    /**
     * Create a new lead
     */
    async create(data: CreateLeadParams): Promise<LeadResponse> {
        return api.post('/leads', data);
    },

    /**
     * Update a lead
     */
    async update(id: string, data: UpdateLeadParams): Promise<LeadResponse> {
        return api.put(`/leads/${id}`, data);
    },

    /**
     * Update lead status
     */
    async updateStatus(id: string, status: string): Promise<LeadResponse> {
        return api.patch(`/leads/${id}/status`, { status });
    },

    /**
     * Delete a lead
     */
    async delete(id: string): Promise<{ deleted: boolean; id: string }> {
        return api.delete(`/leads/${id}`);
    },

    /**
     * Get hot leads (score >= 70)
     */
    async getHotLeads(): Promise<LeadResponse[]> {
        return api.get('/leads/hot');
    },
};
