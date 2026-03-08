import { getEventBookings } from '@/actions/bookings'
import { getVendors } from '@/actions/vendors'
import { AssignVendorDialog } from './assign-vendor-dialog'
import { BookingsList } from './bookings-list'
import { Store } from 'lucide-react'

// Define the VendorData interface locally or import it if exported from vendors.ts or Entity
// We used Entity return type in actions, which is VendorData.
// We need to type cast or ensure compatibility.

export default async function EventVendorsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: eventId } = await params

    const [bookingsResult, vendorsResult] = await Promise.all([
        getEventBookings(eventId),
        getVendors()
    ])

    const bookings = bookingsResult.data || []

    // Filter available vendors: 
    // Ideally exclude those already booked? 
    // Or just pass all. Let's pass all for now, maybe mark them as assigned in dialog visually if needed.
    const allVendors = vendorsResult.data || []

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

            <BookingsList bookings={bookings as any[]} eventId={eventId} />
        </div>
    )
}
