import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AdminLayoutWrapper } from '@/components/layout/admin-layout-wrapper'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')

    if (!session) {
        redirect('/login')
    }

    const user = JSON.parse(session.value)

    if (user.role !== 'admin') {
        redirect(`/${user.role}`)
    }

    return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>
}
