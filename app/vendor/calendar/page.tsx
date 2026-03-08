
import { getVendorBookingRequests, getVendorAvailability } from '@/lib/actions/vendor-actions'
import { VendorCalendarClient, CalendarEvent } from './VendorCalendarClient'

export const dynamic = 'force-dynamic'

export default async function VendorCalendarPage() {
    // Calculate date range (current year +/- 1 year)
    const today = new Date()
    const startDate = new Date(today.getFullYear() - 1, 0, 1).toISOString().split('T')[0]
    const endDate = new Date(today.getFullYear() + 1, 11, 31).toISOString().split('T')[0]

    // Fetch data from database in parallel
    const [bookingRequests, availability] = await Promise.all([
        getVendorBookingRequests(),
        getVendorAvailability(startDate, endDate)
    ])

    // Transform to Calendar Events
    const events: CalendarEvent[] = []

    // Filter out declined events as they are not relevant for the calendar
    const activeBookings = bookingRequests.filter(b => b.status !== 'declined')

    activeBookings.forEach(booking => {
        // Use eventDate from the joined event data
        const startDateStr = booking.eventDate
        const endDateStr = booking.eventEndDate

        // Skip if no valid start date
        if (!startDateStr || startDateStr === '') {
            return
        }

        const start = new Date(startDateStr)

        // Safety check for invalid start date
        if (isNaN(start.getTime())) {
            return
        }

        // If there's a valid end date, show on the range of actual event days
        // Otherwise just show on the single event date
        const end = (endDateStr && !isNaN(new Date(endDateStr).getTime()))
            ? new Date(endDateStr)
            : new Date(start)

        // Iterate from start to end date (actual event dates only)
        for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
            const dateStr = dt.toISOString().split('T')[0]

            events.push({
                id: `${booking.id}-${dateStr}`,
                date: dateStr,
                title: booking.eventName || `Event ${booking.id.slice(0, 4)}`,
                venue: booking.venue || 'TBD',
                time: 'All Day',
                status: booking.status
            })
        }
    })

    return <VendorCalendarClient
        initialEvents={events}
        initialAvailability={availability}
        bookings={activeBookings}
    />
}
