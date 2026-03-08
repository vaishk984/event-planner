import { getEventByClientToken, getClientUpdates } from '@/actions/client-portal'
import { UpdatesPageClient } from './updates-client'
import { notFound } from 'next/navigation'

export default async function UpdatesPage({
    params,
}: {
    params: Promise<{ token: string }>
}) {
    const { token } = await params

    const eventResult = await getEventByClientToken(token)
    if (eventResult.error || !eventResult.data) {
        notFound()
    }

    const updatesResult = await getClientUpdates(token)

    return (
        <UpdatesPageClient
            token={token}
            eventName={eventResult.data.name}
            initialUpdates={updatesResult.data || []}
        />
    )
}
