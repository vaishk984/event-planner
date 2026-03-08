import { getEventByClientToken, getClientMessages } from '@/actions/client-portal'
import { ContactPageClient } from './contact-client'
import { notFound } from 'next/navigation'

export default async function ContactPage({
    params,
}: {
    params: Promise<{ token: string }>
}) {
    const { token } = await params

    const eventResult = await getEventByClientToken(token)
    if (eventResult.error || !eventResult.data) {
        notFound()
    }

    const messagesResult = await getClientMessages(token)

    return (
        <ContactPageClient
            token={token}
            eventName={eventResult.data.name}
            initialMessages={messagesResult.data || []}
        />
    )
}
