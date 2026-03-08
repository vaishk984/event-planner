import { getTimelineData } from '@/actions/timeline'
import { getVendors } from '@/actions/vendors'
import { TimelineClient } from './timeline-client'

export default async function TimelinePage({ params }: { params: Promise<{ id: string }> }) {
    const { id: eventId } = await params

    // Parallel fetch
    const [timelineData, vendorsResult] = await Promise.all([
        getTimelineData(eventId),
        getVendors() // Needed for assigning vendors in the dialog
    ])

    const items = timelineData.items || []
    const functions = timelineData.functions || []
    const vendors = vendorsResult.data || []

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight">Timeline & Run Sheet</h1>
                <p className="text-muted-foreground">
                    Organize every minute of your event. Drag and drop items to reorder.
                </p>
            </div>

            <TimelineClient
                eventId={eventId}
                items={items}
                functions={functions}
                vendors={vendors}
            />
        </div>
    )
}
