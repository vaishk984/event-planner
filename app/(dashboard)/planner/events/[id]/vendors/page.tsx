import { getEventBookings } from '@/actions/bookings'
import { getVendors } from '@/actions/vendors'
import { AssignVendorDialog } from './assign-vendor-dialog'
import { BookingsList } from './bookings-list'
import { Store } from 'lucide-react'
import type { VendorData } from '@/src/backend/entities/Vendor'

interface BookingsResult {
    data?: Array<{
        id: string
        event_id: string
        status: string
        service: string
        quoted_amount: number | null
        agreed_amount: number | null
        vendors: {
            company_name: string
            category: string
            contact_name: string | null
            email: string | null
            phone: string | null
            location: string | null
        }
    }>
    error?: string
}

interface VendorsResult {
    data?: VendorData[]
    error?: string
}

export default async function EventVendorsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: eventId } = await params

    const [bookingsResult, vendorsResult] = await Promise.all([
        getEventBookings(eventId),
        getVendors()
    ])

    const bookings = (bookingsResult as BookingsResult).data || []

    const allVendors = (vendorsResult as VendorsResult).data || []

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Event Vendors</h2>
                    <p className="text-muted-foreground">Manage service providers and bookings for this event.</p>
                </div>
                <div>
                    <AssignVendorDialog
                        eventId={eventId}
                        availableVendors={allVendors}
                    />
                </div>
            </div>

            <BookingsList bookings={bookings} eventId={eventId} />
        </div>
    )
}
