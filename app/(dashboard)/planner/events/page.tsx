import { getUserId, getSession } from '@/lib/session'
import { eventService } from '@/lib/services/event-service'
import { supabaseIntakeRepository } from '@/lib/repositories/supabase-intake-repository'
import EventsPageClient from './events-page-client'

export const dynamic = 'force-dynamic'

export default async function EventsPage() {
    const session = await getSession()
    const plannerId = session?.userId || null

    console.log('[EventsPage] session result:', session ? { userId: session.userId, role: session.role } : 'NULL')
    console.log('[EventsPage] plannerId:', plannerId)

    if (!plannerId) {
        console.error('[EventsPage] No planner ID found — user appears unauthenticated in page component')
        return (
            <EventsPageClient
                initialEvents={[]}
                initialIntakes={[]}
            />
        )
    }

    const [events, intakes] = await Promise.all([
        eventService.getEvents(plannerId),
        supabaseIntakeRepository.findPending(plannerId),
    ])

    console.log('[EventsPage] Found', events.length, 'events and', intakes.length, 'intakes for planner', plannerId)

    return (
        <EventsPageClient
            initialEvents={events}
            initialIntakes={intakes}
        />
    )
}
