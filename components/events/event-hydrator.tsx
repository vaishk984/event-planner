'use client'

import { useEffect } from 'react'
import { useEventContext, EventData } from '@/components/providers/event-provider'
import { Event } from '@/types/domain'

// Map Domain Event to EventData (Context Type)
// Note: This matches the structure in EventProvider
function mapEventToContext(event: Event): EventData {
    // We map the domain event to the context structure
    // This is a bridge between the real DB data and the UI context
    return {
        id: event.id,
        name: event.name,
        // Map status safely
        status: (['requirements_captured', 'designing', 'proposal_sent', 'approved', 'in_progress', 'completed'].includes(event.status)
            ? event.status
            : 'designing') as any,

        // Reconstruct basic requirements from event flat data
        requirements: {
            basics: {
                eventName: event.name,
                eventType: event.type,
                eventDate: event.date,
                guestCount: event.guestCount,
                budget: event.budgetMax || 0
            },
            // Other fields would need to be populated if we had them or fetched separately
            // For now we map what we have
        } as any,

        selectedVendors: [], // We need to fetch these if we want them, or let the page fetch them
        designNotes: event.notes || '',
        proposalVersion: 1, // Default or from DB
        proposalLocked: event.proposalStatus === 'approved',
        createdAt: new Date(event.createdAt),
        updatedAt: new Date(event.updatedAt)
    }
}

export function EventHydrator({ event, vendors }: { event: Event, vendors: any[] }) {
    const { setActiveEvent, events } = useEventContext()

    useEffect(() => {
        if (event) {
            const contextEvent = mapEventToContext(event)
            // Hydrate vendors
            contextEvent.selectedVendors = vendors || []

            setActiveEvent(contextEvent)
        }
    }, [event, vendors, setActiveEvent])

    return null
}
