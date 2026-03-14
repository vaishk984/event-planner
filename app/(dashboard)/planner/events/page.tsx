import { getEvents } from '@/lib/actions/event-actions'
import { getPendingIntakes } from '@/lib/actions/intake-actions'
import EventsPageClient from './events-page-client'

export const dynamic = 'force-dynamic'

export default async function EventsPage() {
    const [events, intakes] = await Promise.all([
        getEvents(),
        getPendingIntakes(),
    ])

    return (
        <EventsPageClient
            initialEvents={events}
            initialIntakes={intakes}
        />
    )
}
