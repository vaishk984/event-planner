/**
 * Timeline API Service
 * 
 * Frontend API client for timeline/run sheet operations.
 */

import { api as apiClient } from './api-client';

// ============================================
// TYPES
// ============================================

export type TimelineItemStatus = 'pending' | 'in_progress' | 'completed' | 'delayed';

export interface TimelineItemResponse {
    id: string;
    eventId: string;
    functionId: string;
    startTime: string;
    endTime: string | null;
    duration: number | null;
    calculatedEndTime: string | null;
    title: string;
    description: string | null;
    location: string | null;
    owner: string;
    vendorId: string | null;
    status: TimelineItemStatus;
    notes: string | null;
    dependsOn: string[] | null;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTimelineItemInput {
    eventId: string;
    functionId: string;
    startTime: string;
    endTime?: string;
    duration?: number;
    title: string;
    description?: string;
    location?: string;
    owner: string;
    vendorId?: string;
    notes?: string;
    dependsOn?: string[];
}

export interface UpdateTimelineItemInput {
    startTime?: string;
    endTime?: string | null;
    duration?: number | null;
    title?: string;
    description?: string | null;
    location?: string | null;
    owner?: string;
    vendorId?: string | null;
    notes?: string | null;
    dependsOn?: string[] | null;
}

export interface TimelineOverview {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    delayed: number;
    nextItem: TimelineItemResponse | null;
    completionPercent: number;
}

export type TemplateName = 'wedding_ceremony' | 'reception' | 'sangeet' | 'mehendi' | 'haldi';

// ============================================
// API SERVICE
// ============================================

export const timelineApi = {
    /**
     * Get timeline items for a function
     */
    getByFunction: async (functionId: string) => {
        return apiClient.get<TimelineItemResponse[]>(`/functions/${functionId}/timeline`);
    },

    /**
     * Get timeline items for an event
     */
    getByEvent: async (eventId: string) => {
        return apiClient.get<TimelineItemResponse[]>('/timeline', { eventId });
    },

    /**
     * Get single timeline item
     */
    getById: async (id: string) => {
        return apiClient.get<TimelineItemResponse>(`/timeline/${id}`);
    },

    /**
     * Create a new timeline item
     */
    create: async (data: CreateTimelineItemInput) => {
        return apiClient.post<TimelineItemResponse>('/timeline', data);
    },

    /**
     * Update a timeline item
     */
    update: async (id: string, data: UpdateTimelineItemInput) => {
        return apiClient.put<TimelineItemResponse>(`/timeline/${id}`, data);
    },

    /**
     * Delete a timeline item
     */
    delete: async (id: string) => {
        return apiClient.delete(`/timeline/${id}`);
    },

    /**
     * Update item status
     */
    updateStatus: async (id: string, status: TimelineItemStatus, notes?: string) => {
        return apiClient.patch<TimelineItemResponse>(`/timeline/${id}/status`, { status, notes });
    },

    /**
     * Reorder timeline items
     */
    reorder: async (items: Array<{ id: string; sortOrder: number }>) => {
        return apiClient.post<{ reordered: boolean; count: number }>('/timeline/reorder', { items });
    },

    /**
     * Get timeline overview for a function
     */
    getOverview: async (functionId: string) => {
        return apiClient.get<TimelineOverview>(`/functions/${functionId}/timeline/overview`);
    },

    /**
     * Apply a template to a function
     */
    applyTemplate: async (
        functionId: string,
        eventId: string,
        template: TemplateName,
        clearExisting: boolean = false
    ) => {
        return apiClient.post<{
            applied: boolean;
            template: string;
            items: TimelineItemResponse[];
        }>(`/functions/${functionId}/timeline/template?eventId=${eventId}`, {
            template,
            clearExisting,
        });
    },

    /**
     * Get available template names
     */
    getTemplates: async () => {
        return apiClient.get<{ templates: string[] }>('/timeline/templates');
    },
};
