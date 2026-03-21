import { EventHydrator } from '@/components/events/event-hydrator'
import { EventWorkspaceLayout } from '@/components/events/event-workspace-layout'
import { getRequestUserId } from '@/lib/request-store'
import { supabaseEventVendorRepository } from '@/lib/repositories/supabase-event-vendor-repository'
import { getUserId } from '@/lib/session'
import { eventService } from '@/lib/services/event-service'
import { formatDate } from '@/lib/utils/format'

export default async function EventLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const plannerId = getRequestUserId() || await getUserId()

    if (!plannerId) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <h2 className="text-xl font-semibold text-red-600">Layout Error: Could not load event</h2>
                <p className="text-gray-500">Event ID: {id}</p>
                <div className="p-4 bg-gray-100 rounded text-xs font-mono">
                    Authentication session is missing.
                </div>
            </div>
        )
    }

    const event = await eventService.getEvent(id, plannerId)

    if (!event) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <h2 className="text-xl font-semibold text-red-600">Layout Error: Could not load event</h2>
                <p className="text-gray-500">Event ID: {id}</p>
                <div className="p-4 bg-gray-100 rounded text-xs font-mono">
                    Event not found for this planner.
                </div>
            </div>
        )
    }

    const eventVendors = await supabaseEventVendorRepository.findByEventId(id)
    const vendors = eventVendors.map((vendor) => ({
        id: vendor.vendorId,
        name: vendor.vendorName || 'Unknown Vendor',
        category: vendor.vendorCategory || vendor.category || 'other',
        service: vendor.vendorCategory || 'Service',
        cost: vendor.agreedAmount || vendor.price || 0,
        imageUrl: '',
    }))

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
