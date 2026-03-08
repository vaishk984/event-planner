/**
 * useEvent Hook
 * 
 * React hook for fetching a single event by ID.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { eventApi } from '../services';
import type { EventResponseDto } from '@/src/backend/dto';

interface UseEventOptions {
    autoFetch?: boolean;
}

interface UseEventReturn {
    event: EventResponseDto | null;
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
    updateStatus: (status: string) => Promise<void>;
}

export function useEvent(id: string | undefined, options: UseEventOptions = {}): UseEventReturn {
    const { autoFetch = true } = options;

    const [event, setEvent] = useState<EventResponseDto | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchEvent = useCallback(async () => {
        if (!id) return;

        setIsLoading(true);
        setError(null);

        try {
            const result = await eventApi.getById(id);
            setEvent(result);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch event'));
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (autoFetch && id) {
            fetchEvent();
        }
    }, [fetchEvent, autoFetch, id]);

    const updateStatus = useCallback(async (status: string) => {
        if (!id) return;

        setIsLoading(true);
        try {
            const updated = await eventApi.updateStatus(id, status);
            setEvent(updated);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to update status'));
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    return {
        event,
        isLoading,
        error,
        refetch: fetchEvent,
        updateStatus,
    };
}
