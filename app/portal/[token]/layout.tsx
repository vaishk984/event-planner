import '@/app/globals.css'
import { getEventByClientToken } from '@/actions/client-portal'
import { PortalLayoutWrapper } from '@/components/layout/portal-layout-wrapper'
import { notFound } from 'next/navigation'

export const metadata = {
    title: 'My Event Portal — PlannerOS',
    description: 'Track your event progress',
}

export default async function PortalLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ token: string }>
}) {
    const { token } = await params

    const eventResult = await getEventByClientToken(token)

    if (eventResult.error || !eventResult.data) {
        notFound()
    }

    return (
        <html lang="en">
            <body>
                <PortalLayoutWrapper
                    token={token}
                    eventName={eventResult.data.name}
                    clientName={eventResult.data.client_name || 'Client'}
                >
                    {children}
                </PortalLayoutWrapper>
            </body>
        </html>
    )
}
