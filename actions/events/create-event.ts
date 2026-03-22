'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getUserId } from '@/lib/session'
import { eventService } from '@/lib/services/event-service'
import type { EventType, VenueType } from '@/types/domain'

export async function createEvent(formData: FormData) {
    const userId = await getUserId()

    if (!userId) {
        return { error: 'Not authenticated' }
    }

    // Extract form data
    const name = formData.get('name') as string
    const eventType = (formData.get('eventType') as EventType) || 'other'
    const eventDate = formData.get('eventDate') as string
    const budget = formData.get('budget') ? Number(formData.get('budget')) : 0
    const guestCount = formData.get('guestCount') ? Number(formData.get('guestCount')) : 0

    // Construct venue info based on inputs
    const venueMode = formData.get('venueMode') as string
    let venueName = formData.get('venue') as string
    let venueAddress = ''
    let venueType: VenueType = 'showroom'

    if (venueMode === 'personal') {
        venueAddress = (formData.get('personalVenueAddress') as string) || ''
        const personalVenueType = (formData.get('personalVenueType') as string) || 'Private'
        venueName = personalVenueType
        venueType = 'personal'
    } else if (venueMode === 'platform') {
        venueName = 'Platform Venue (Selection Pending)'
        venueType = 'showroom'
    } else if (formData.get('location')) {
        venueName = formData.get('location') as string
    }

    const clientName = (formData.get('clientName') as string) || name || 'Unnamed Client'
    const clientPhone = (formData.get('clientPhone') as string) || ''
    const city = (formData.get('city') as string) || ''
    const notes = (formData.get('visionDescription') as string) || ''

    // Use the EventService to create the event through the proper architecture
    const result = await eventService.createEvent(
        {
            name: name || `${clientName}'s Event`,
            type: eventType,
            date: eventDate || '',
            isDateFlexible: false,
            city,
            venueType,
            venueName,
            venueAddress,
            guestCount,
            budgetMin: budget,
            budgetMax: budget,
            clientName,
            clientPhone,
            notes,
        },
        userId
    )

    if (!result.success) {
        console.error('❌ Event creation failed:', result.error)
        return { error: result.error }
    }

    revalidatePath('/planner/events')
    redirect('/planner/events')
}
