/**
 * Timeline Response DTOs
 * 
 * Response formatting for timeline API endpoints.
 */

import { TimelineItem, TimelineItemStatus } from '../../entities/TimelineItem';

// ============================================
// SINGLE ITEM RESPONSE
// ============================================

export interface TimelineItemResponseDto {
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

// ============================================
// MAPPER
// ============================================

export function mapTimelineItemToResponse(item: TimelineItem): TimelineItemResponseDto {
    return {
        id: item.id,
        eventId: item.eventId,
        functionId: item.functionId,
        startTime: item.startTime,
        endTime: item.endTime ?? null,
        duration: item.duration ?? null,
        calculatedEndTime: item.getCalculatedEndTime(),
        title: item.title,
        description: item.description ?? null,
        location: item.location ?? null,
        owner: item.owner,
        vendorId: item.vendorId ?? null,
        status: item.status,
        notes: item.notes ?? null,
        dependsOn: item.dependsOn ?? null,
        sortOrder: item.sortOrder,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
    };
}

// ============================================
// TIMELINE OVERVIEW (for dashboard)
// ============================================

export interface TimelineOverviewDto {
    functionId: string;
    totalItems: number;
    pending: number;
    inProgress: number;
    completed: number;
    delayed: number;
    nextItem: TimelineItemResponseDto | null;
    completionPercent: number;
}
