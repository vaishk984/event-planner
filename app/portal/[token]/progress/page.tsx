import { getEventByClientToken, getClientServices, getClientDayProgress } from '@/actions/client-portal'
import { notFound } from 'next/navigation'
import { ProgressClient } from './progress-client'

export default async function ProgressPage({
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
        <ProgressClient
            event={eventResult.data}
            services={servicesResult.data || []}
            progress={progressResult.data}
        />
    )
}
