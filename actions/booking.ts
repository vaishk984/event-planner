'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createBookingRequest(data: {
    eventId: string
    vendorId: string
    eventName: string
    eventDate: string
    city?: string
    venue?: string
    guestCount?: number
    service: string
    budget?: number
    requirements?: string
    status?: 'draft' | 'pending' | 'quoted' | 'accepted' | 'declined' | 'completed' | 'cancelled'
}) {
    const supabase = await createClient()

    // Get current user (planner)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { error: 'Unauthorized' }
    }

    // Ensure user profile exists
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .single()

    if (!profile) {
        // Create basic profile if missing
        const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
                id: user.id,
                company_name: user.user_metadata?.company_name || 'My Company'
            })

        if (profileError) {
            console.error('Error auto-creating profile:', profileError)
            return { error: 'Failed to create user profile' }
        }

        // Create planner profile (optional, for newer schema)
        const { error: plannerError } = await supabase
            .from('planner_profiles')
            .upsert({
                id: user.id,
                company_name: user.user_metadata?.company_name || 'My Company'
            })

        if (plannerError) {
            // Ignore error as table might not exist or duplicate
            console.log('Optional planner_profiles insert failed (safe to ignore if using old schema)')
        }
    }

    // Check if booking request already exists for this event+vendor
    const { data: existing } = await supabase
        .from('booking_requests')
        .select('id')
        .eq('event_id', data.eventId)
        .eq('vendor_id', data.vendorId)
        .single()

    if (existing) {
        // Already exists, skip insert
        console.log('Booking request already exists for this event+vendor')
        return { success: true, alreadyExists: true }
    }

    const { error } = await supabase
        .from('booking_requests')
        .insert({
            event_id: data.eventId,
            vendor_id: data.vendorId,
            planner_id: user.id,
            event_name: data.eventName,
            event_date: data.eventDate,
            city: data.city,
            venue: data.venue,
            guest_count: data.guestCount,
            service: data.service,
            budget: data.budget,
            requirements: data.requirements,
            status: data.status || 'pending',
        })

    if (error) {
        console.error('Error creating booking request:', error)
        return { error: 'Failed to create booking request' }
    }

    revalidatePath(`/planner/events/${data.eventId}/builder`)
    return { success: true }
}

export async function getRequestsForEvent(eventId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('booking_requests')
        .select(`
            *,
            vendor:vendors (
                company_name,
                start_price,
                rating,
                image_url,
                description,
                category
            )
        `)
        .eq('event_id', eventId)

    if (error) {
        console.error('Error fetching booking requests:', error)
        return []
    }

    // Map snake_case to camelCase
    return data.map((req: any) => ({
        id: req.id,
        eventId: req.event_id,
        vendorId: req.vendor_id,
        plannerId: req.planner_id,
        // event details
        eventName: req.event_name,
        eventDate: req.event_date,
        city: req.city,
        venue: req.venue,
        guestCount: req.guest_count,
        // service
        service: req.service || req.event_name, // Fallback
        requirements: req.requirements,
        budget: req.budget,
        quotedAmount: req.quoted_amount,
        vendorCategory: req.vendor?.category || req.service, // Use vendor category if available
        category: req.vendor?.category || req.service,

        // Vendor Details (Joins)
        vendorName: req.vendor?.company_name || 'Unknown Vendor',
        vendorPrice: req.vendor?.start_price || 0,
        vendorRating: req.vendor?.rating || 0,
        vendorImage: req.vendor?.image_url || '',
        vendorDescription: req.vendor?.description || '',

        // status
        status: req.status,
        createdAt: req.created_at,
        updatedAt: req.updated_at
    }))
}

import { supabaseVendorRepository } from '@/lib/repositories/supabase-vendor-repository'
import type { VendorCategory } from '@/types/domain'

export async function searchVendors(category?: string, query?: string) {
    try {
        const results = await supabaseVendorRepository.search(query || '', {
            category: category as VendorCategory
        })
        return results
    } catch (error) {
        console.error('Error searching vendors:', error)
        return []
    }
}

export async function deleteBookingRequest(eventId: string, vendorId: string) {
    const supabase = await createClient()

    // Get current user (planner)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { error: 'Unauthorized' }
    }

    const { error } = await supabase
        .from('booking_requests')
        .delete()
        .eq('event_id', eventId)
        .eq('vendor_id', vendorId)
        .eq('planner_id', user.id) // Security check

    if (error) {
        console.error('Error deleting booking request:', error)
        return { error: 'Failed to delete booking request' }
    }

    revalidatePath(`/planner/events/${eventId}/builder`)
    return { success: true }
}
