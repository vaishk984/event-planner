import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { DashboardWrapper } from '@/components/layout/dashboard-wrapper'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getSession()

    if (!session) {
        redirect('/login')
    }

    return (
        <DashboardWrapper userEmail={session.displayName || session.email} userRole={session.role}>
            {children}
        </DashboardWrapper>
    )
}
