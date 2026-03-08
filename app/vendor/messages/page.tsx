
import { getVendorBookingRequests } from '@/lib/actions/vendor-actions'
import MessagesClient from './messages-client'
import { getCurrentUser } from '@/actions/auth/login'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function VendorMessagesPage() {
    const user = await getCurrentUser()
    if (!user) redirect('/login')

    const bookings = await getVendorBookingRequests()

    return (
        <div className="container md:max-w-[1400px] h-[calc(100vh-4rem)] flex flex-col py-4 md:py-6">
            <h1 className="text-2xl font-bold mb-6 px-4 md:px-0">Messages</h1>
            <MessagesClient
                bookings={bookings}
                currentUserId={user.id}
            />
        </div>
    )
}
