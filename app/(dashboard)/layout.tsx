export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { runWithRequestStore } from '@/lib/request-store'
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

    return runWithRequestStore(
        session.userId,
        session.role,
        session.email || null,
        session.displayName || null,
        () => (
            <DashboardWrapper
                userEmail={session.displayName || session.email}
                userRole={session.role}
                userId={session.userId}
            >
                {children}
            </DashboardWrapper>
        )
    )
}
