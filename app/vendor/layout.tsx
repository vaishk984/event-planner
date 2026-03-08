import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { VendorLayoutWrapper } from '@/components/layout/vendor-layout-wrapper'

export default async function VendorLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getSession()

    if (!session) {
        redirect('/login')
    }

    // Ensure only vendors can access this section
    if (session.role !== 'vendor') {
        redirect(`/${session.role}`)
    }

    return (
        <VendorLayoutWrapper userEmail={session.email} vendorName={session.displayName || 'Vendor'}>
            {children}
        </VendorLayoutWrapper>
    )

}
