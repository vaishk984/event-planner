'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { EventWorkspaceLayout } from '@/components/events/event-workspace-layout'
import { formatDate } from '@/lib/utils/format'
import { createClient } from '@/lib/supabase/client'
import type { Event } from '@/types/domain'
import { Loader2 } from 'lucide-react'

export default function EventLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const [event, setEvent] = useState<Event | null>(null)
    const [vendors, setVendors] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadEvent = async () => {
            const supabase = createClient()

            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('id', id)
                .single()

            if (error || !data) {
                console.error('[Event Layout] Error loading event:', error?.message)
                setLoading(false)
                return
            }

            // Fetch Vendors
            const { data: vendorData, error: vendorError } = await supabase
                .from('vendor_assignments')
                .select(`
                    *,
                    vendor:vendor_id (
                        id,
                        name:company_name,
                        category,
                        price_range
                    )
                `)
                .eq('event_id', id)

            const vendors = vendorData ? vendorData.map((v: any) => ({
                id: v.vendor?.id,
                name: v.vendor?.name || 'Unknown Vendor',
                category: v.vendor?.category || v.category,
                service: v.vendor?.category || 'Service',
                cost: v.price || 0,
                imageUrl: ''
            })) : []

            // Convert snake_case to camelCase manually
            const eventData: Event = {
                id: data.id,
                plannerId: data.planner_id,
                clientId: data.client_id,
                submissionId: data.submission_id,
                status: data.status,
                type: data.type,
                name: data.name,
                publicToken: data.public_token,
                proposalStatus: data.proposal_status,
                date: data.date,
                endDate: data.end_date,
                isDateFlexible: data.is_date_flexible || false,
                city: data.city || '',
                venueType: data.venue_type || 'showroom',
                venueName: data.venue_name,
                venueAddress: data.venue_address,
                guestCount: data.guest_count || 0,
                budgetMin: data.budget_min || 0,
                budgetMax: data.budget_max || 0,
                clientName: data.client_name || '',
                clientPhone: data.client_phone || '',
                clientEmail: data.client_email,
                source: data.source,
                notes: data.notes,
                createdAt: data.created_at,
                updatedAt: data.updated_at,
            }

            setEvent(eventData)
            setVendors(vendors) // New state
            setLoading(false)
        }
        loadEvent()
    }, [id, router])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        )
    }

    if (!event) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <h2 className="text-xl font-semibold text-red-600">Layout Error: Could not load event</h2>
                <p className="text-gray-500">Event ID: {id}</p>
                <div className="p-4 bg-gray-100 rounded text-xs font-mono">
                    Check console for [Event Layout] errors.
                </div>
            </div>
        )
    }

    return (
        <EventWorkspaceLayout
            eventId={event.id}
            eventName={event.name || 'Untitled Event'}
            eventDate={formatDate(event.date)}
            eventType={event.type || 'event'}
        >
            <EventHydrator event={event} vendors={vendors} />
            {children}
        </EventWorkspaceLayout>
    )
}

import { EventHydrator } from '@/components/events/event-hydrator'

