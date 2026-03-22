'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { EventWorkspaceLayout } from '@/components/events/event-workspace-layout'
import { formatDate } from '@/lib/utils/format'
import type { Event } from '@/types/domain'
import { Loader2 } from 'lucide-react'
import { getEvent } from '@/lib/actions/event-actions'
import { getEventVendors } from '@/lib/actions/event-vendor-actions'
import { EventHydrator } from '@/components/events/event-hydrator'

export default function EventLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const params = useParams()
    const id = params.id as string

    const [event, setEvent] = useState<Event | null>(null)
    const [vendors, setVendors] = useState<{ id: string; name: string; category: string; service: string; cost: number; imageUrl: string }[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadEvent = async () => {
            const [eventData, eventVendors] = await Promise.all([
                getEvent(id),
                getEventVendors(id),
            ])

            if (!eventData) {
                setLoading(false)
                return
            }

            const vendors = eventVendors.map((vendor) => ({
                id: vendor.vendorId,
                name: vendor.vendorName || 'Unknown Vendor',
                category: vendor.vendorCategory || vendor.category || 'other',
                service: vendor.vendorCategory || 'Service',
                cost: vendor.agreedAmount || vendor.price || 0,
                imageUrl: ''
            }))

            setEvent(eventData)
            setVendors(vendors)
            setLoading(false)
        }
        loadEvent()
    }, [id])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        )
    }

    if (!event) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <h2 className="text-xl font-semibold text-red-600">Layout Error: Could not load event</h2>
                <p className="text-gray-500">Event ID: {id}</p>
                <div className="p-4 bg-gray-100 rounded text-xs font-mono">
                    Check console for [Event Layout] errors.
                </div>
            </div>
        )
    }

    return (
        <EventWorkspaceLayout
            eventId={event.id}
            eventName={event.name || 'Untitled Event'}
            eventDate={formatDate(event.date)}
            eventType={event.type || 'event'}
        >
            <EventHydrator event={event} vendors={vendors} />
            {children}
        </EventWorkspaceLayout>
    )
}
