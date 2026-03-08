/**
 * useEvents Hook
 * 
 * React hook for fetching and managing events data.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { eventApi, QueryEventsParams } from '../services';
import type { EventListResponseDto, PaginatedResponseDto } from '@/src/backend/dto';

interface UseEventsOptions extends QueryEventsParams {
    autoFetch?: boolean;
}

interface UseEventsReturn {
    events: EventListResponseDto[];
    total: number;
    page: number;
    totalPages: number;
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
    setPage: (page: number) => void;
}

export function useEvents(options: UseEventsOptions = {}): UseEventsReturn {
    const { autoFetch = true, ...queryParams } = options;

    const [data, setData] = useState<PaginatedResponseDto<EventListResponseDto> | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [page, setPageState] = useState(queryParams.page || 1);

    const fetchEvents = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await eventApi.list({ ...queryParams, page });
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch events'));
        } finally {
            setIsLoading(false);
        }
    }, [page, JSON.stringify(queryParams)]);

    useEffect(() => {
        if (autoFetch) {
            fetchEvents();
        }
    }, [fetchEvents, autoFetch]);

    const setPage = useCallback((newPage: number) => {
        setPageState(newPage);
    }, []);

    return {
        events: data?.items || [],
        total: data?.meta.total || 0,
        page: data?.meta.page || page,
        totalPages: data?.meta.totalPages || 0,
        isLoading,
        error,
        refetch: fetchEvents,
        setPage,
    };
}
