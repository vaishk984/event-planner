import { getRequestUserId } from '@/lib/request-store'
import { getUserId } from '@/lib/session'
import { eventService } from '@/lib/services/event-service'
import { supabaseIntakeRepository } from '@/lib/repositories/supabase-intake-repository'
import EventsPageClient from './events-page-client'

export const dynamic = 'force-dynamic'

export default async function EventsPage() {
    const plannerId = getRequestUserId() || await getUserId()

    if (!plannerId) {
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

    return (
        <EventsPageClient
            initialEvents={events}
            initialIntakes={intakes}
        />
    )
}
