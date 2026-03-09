'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ============================================
// VENDOR-SIDE ACTIONS
// ============================================

/**
 * Submit a vendor update (photo, status, note) for an event
 */
export async function submitVendorUpdate(data: {
    eventId: string
    bookingRequestId?: string
    updateType: 'photo' | 'status' | 'note' | 'arrival'
    message?: string
    photoUrl?: string
    statusTag?: string
}) {
    const supabase = await createClient()

    // Get current user
    const session = await getSession();
        if (!session) {
            return { error: 'Unauthorized' }
        }
        const user = { id: session.userId, email: session.email };

    // Get vendor ID for this user
    const { data: vendor } = await supabase
        .from('vendors')
        .select('id, company_name')
        .eq('user_id', user.id)
        .single()

    if (!vendor) {
        return { error: 'Vendor profile not found' }
    }

    // Insert the update
    const { data: update, error } = await supabase
        .from('vendor_updates')
        .insert({
            event_id: data.eventId,
            vendor_id: vendor.id,
            booking_request_id: data.bookingRequestId || null,
            update_type: data.updateType,
            message: data.message || null,
            photo_url: data.photoUrl || null,
            status_tag: data.statusTag || null,
        })
        .select()
        .single()

    if (error) {
        console.error('Error submitting vendor update:', error)
        return { error: 'Failed to submit update' }
    }

    // If it's an arrival update, also update the vendor_assignments table
    if (data.updateType === 'arrival' || data.statusTag === 'arrived') {
        await supabase
            .from('vendor_assignments')
            .update({
                arrival_status: 'arrived',
                arrived_at: new Date().toISOString()
            })
            .eq('event_id', data.eventId)
            .eq('vendor_id', vendor.id)
    }

    // If vendor departed
    if (data.statusTag === 'departed') {
        await supabase
            .from('vendor_assignments')
            .update({
                arrival_status: 'departed',
                departed_at: new Date().toISOString()
            })
            .eq('event_id', data.eventId)
            .eq('vendor_id', vendor.id)
    }

    revalidatePath(`/vendor/event-day`)
    return { success: true, data: update }
}

/**
 * Mark vendor as arrived at event
 */
export async function markVendorArrival(eventId: string) {
    return submitVendorUpdate({
        eventId,
        updateType: 'arrival',
        statusTag: 'arrived',
        message: 'Vendor has arrived at the venue'
    })
}

/**
 * Upload a photo to Supabase Storage and return the public URL
 */
export async function uploadEventPhoto(formData: FormData) {
    const supabase = await createClient()

    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return { error: 'Unauthorized' }

    const file = formData.get('file') as File
    if (!file) return { error: 'No file provided' }

    const eventId = formData.get('eventId') as string
    const ext = file.name.split('.').pop()
    const fileName = `${eventId}/${user.id}/${Date.now()}.${ext}`

    const { data, error } = await supabase.storage
        .from('event-photos')
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
        })

    if (error) {
        console.error('Upload error:', error)
        return { error: 'Failed to upload photo' }
    }

    const { data: urlData } = supabase.storage
        .from('event-photos')
        .getPublicUrl(data.path)

    return { success: true, url: urlData.publicUrl }
}

// ============================================
// PLANNER-SIDE ACTIONS
// ============================================

/**
 * Get all vendor updates for an event (planner view)
 */
export async function getUpdatesForEvent(eventId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('vendor_updates')
        .select(`
            *,
            vendor:vendors (
                id,
                company_name,
                category,
                image_url
            )
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching event updates:', error)
        return []
    }

    return data || []
}

/**
 * Get vendor assignments with arrival status for an event
 */
export async function getEventDayVendors(eventId: string) {
    const supabase = await createClient()

    // Get from vendor_assignments
    const { data: assignments, error: assignError } = await supabase
        .from('vendor_assignments')
        .select(`
            *,
            vendor:vendor_id (
                id,
                company_name,
                category,
                image_url
            )
        `)
        .eq('event_id', eventId)

    if (assignError) {
        console.error('Error fetching vendor assignments:', assignError)
    }

    // Also get from booking_requests for vendors not in assignments
    const { data: bookings, error: bookError } = await supabase
        .from('booking_requests')
        .select(`
            *,
            vendor:vendors (
                id,
                company_name,
                category,
                image_url
            )
        `)
        .eq('event_id', eventId)
        .neq('status', 'declined')

    if (bookError) {
        console.error('Error fetching booking requests:', bookError)
    }

    // Get latest vendor_updates for this event to determine real arrival status
    const { data: latestUpdates } = await supabase
        .from('vendor_updates')
        .select('vendor_id, status_tag, update_type, created_at')
        .eq('event_id', eventId)
        .in('status_tag', ['arrived', 'departed'])
        .order('created_at', { ascending: false })

    // Build a map of vendor_id -> latest arrival status from updates
    const arrivalMap = new Map<string, { status: string; at: string }>()
    for (const u of (latestUpdates || [])) {
        if (!arrivalMap.has(u.vendor_id)) {
            arrivalMap.set(u.vendor_id, {
                status: u.status_tag === 'departed' ? 'departed' : 'arrived',
                at: u.created_at
            })
        }
    }

    // Merge and deduplicate by vendor_id
    const vendorMap = new Map<string, any>()

    for (const a of (assignments || [])) {
        const arrival = arrivalMap.get(a.vendor_id)
        vendorMap.set(a.vendor_id, {
            id: a.id,
            vendorId: a.vendor_id,
            vendorName: (a as any).vendor?.company_name || a.vendor_name || 'Unknown',
            vendorCategory: (a as any).vendor?.category || a.vendor_category || 'other',
            vendorImage: (a as any).vendor?.image_url || null,
            arrivalStatus: arrival?.status || a.arrival_status || 'pending',
            arrivedAt: arrival?.at || null,
            departedAt: arrival?.status === 'departed' ? arrival.at : null,
            agreedAmount: a.agreed_amount || 0,
            status: a.status,
            source: 'assignment'
        })
    }

    for (const b of (bookings || [])) {
        if (!vendorMap.has(b.vendor_id)) {
            const arrival = arrivalMap.get(b.vendor_id)
            vendorMap.set(b.vendor_id, {
                id: b.id,
                vendorId: b.vendor_id,
                vendorName: (b as any).vendor?.company_name || 'Unknown',
                vendorCategory: (b as any).vendor?.category || b.service || 'other',
                vendorImage: (b as any).vendor?.image_url || null,
                arrivalStatus: arrival?.status || 'pending',
                arrivedAt: arrival?.at || null,
                departedAt: arrival?.status === 'departed' ? arrival.at : null,
                agreedAmount: b.budget || b.quoted_amount || 0,
                status: b.status,
                source: 'booking'
            })
        }
    }

    return Array.from(vendorMap.values())
}

/**
 * Get updates for the vendor's own events (vendor side)
 */
export async function getVendorEventDayData() {
    const supabase = await createClient()

    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return { events: [], updates: [] }

    // Get vendor profile
    const { data: vendor } = await supabase
        .from('vendors')
        .select('id, company_name')
        .eq('user_id', user.id)
        .single()

    if (!vendor) return { events: [], updates: [] }

    // Get upcoming accepted bookings
    const { data: bookings } = await supabase
        .from('booking_requests')
        .select(`
            *,
            event:events (
                id, name, date, city, venue_name, guest_count
            )
        `)
        .eq('vendor_id', vendor.id)
        .in('status', ['accepted', 'confirmed', 'completed'])
        .order('event_date', { ascending: true })

    // Get vendor's own updates
    const { data: updates } = await supabase
        .from('vendor_updates')
        .select('*')
        .eq('vendor_id', vendor.id)
        .order('created_at', { ascending: false })
        .limit(50)

    // Also check vendor_assignments
    const { data: assignments } = await supabase
        .from('vendor_assignments')
        .select(`
            *,
            event:event_id (
                id, name, date, city, venue_name, guest_count
            )
        `)
        .eq('vendor_id', vendor.id)

    return {
        vendor,
        bookings: bookings || [],
        assignments: assignments || [],
        updates: updates || []
    }
}
