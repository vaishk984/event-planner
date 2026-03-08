import { getEventByClientToken, getClientServices, getClientDayProgress } from '@/actions/client-portal'
import { PortalDashboardClient } from './portal-client'
import { notFound } from 'next/navigation'

export default async function PortalPage({
    params,
}: {
    params: Promise<{ token: string }>
}) {
    const { token } = await params

    const eventResult = await getEventByClientToken(token)
    if (eventResult.error || !eventResult.data) {
        notFound()
    }

    const [servicesResult, progressResult] = await Promise.all([
        getClientServices(token),
        getClientDayProgress(token),
    ])

    return (
        <PortalDashboardClient
            token={token}
            event={eventResult.data}
            services={servicesResult.data || []}
            progress={progressResult.data}
        />
    )
}
