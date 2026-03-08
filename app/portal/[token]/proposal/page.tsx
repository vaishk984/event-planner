import { getEventByClientToken, getClientServices } from '@/actions/client-portal'
import { notFound } from 'next/navigation'
import { ProposalClient } from './proposal-client'

export default async function ProposalPage({
    params,
}: {
    params: Promise<{ token: string }>
}) {
    const { token } = await params

    const eventResult = await getEventByClientToken(token)
    if (eventResult.error || !eventResult.data) {
        notFound()
    }

    const servicesResult = await getClientServices(token)

    return (
        <ProposalClient
            event={eventResult.data}
            services={servicesResult.data || []}
        />
    )
}
