'use client'

import { useEffect, useState } from 'react'
import { useParams, notFound, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EventStatusBadge } from '@/components/events/event-status-badge'
import {
    Calendar, Users, MapPin, IndianRupee, Clock, CheckCircle2,
    AlertCircle, ArrowRight, Share2, Sparkles, Loader2
} from 'lucide-react'
import { FeasibilityCheck } from '@/components/workspace/feasibility-check'
import Link from 'next/link'
import type { Event } from '@/types/domain'
import { createClient } from '@/lib/supabase/client'

export default function EventOverviewPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const [event, setEvent] = useState<Event | null>(null)
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
                const errorMsg = error?.message || 'Event not found (data is null)'
                console.error('[Event Detail] Error loading event:', errorMsg)
                setLoading(false)
                // router.push('/planner/events') // DISABLED FOR DEBUGGING
                setEvent(null) // Ensure event remains null to trigger fallback UI
                return
            }

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

            console.log('[Event Detail] Loaded event:', eventData.name)
            setEvent(eventData)
            setLoading(false)
        }
        loadEvent()
    }, [id, router])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        )
    }

    if (!event) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <h2 className="text-xl font-semibold">Could not load event</h2>
                <p className="text-gray-500">
                    Event ID: {id}
                </p>
                <div className="p-4 bg-gray-100 rounded text-xs font-mono max-w-lg overflow-auto">
                    Check console for detailed error.
                    Possible causes: RLS policies, invalid ID, or missing data.
                </div>
                <Button onClick={() => window.location.reload()}>Retry</Button>
                <Link href="/planner/events">
                    <Button variant="outline">Back to Events</Button>
                </Link>
            </div>
        )
    }

    // Calculate days countdown
    const daysUntil = Math.floor(
        (new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )

    // Mock progress data
    const progress = {
        venue: event.venueName ? 100 : 0,
        caterer: 0,
        decor: 50,
        photographer: 0,
        overall: 25,
    }

    return (
        <div className="space-y-6">
            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-orange-700">
                                    {daysUntil > 0 ? daysUntil : daysUntil === 0 ? '🎉' : 'Done'}
                                </p>
                                <p className="text-xs text-orange-600">Days to Go</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-blue-700">{event.guestCount || 0}</p>
                                <p className="text-xs text-blue-600">Guests</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                                <IndianRupee className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-700">
                                    {event.budgetMax ? `${(event.budgetMax / 100000).toFixed(1)}L` : '-'}
                                </p>
                                <p className="text-xs text-green-600">Budget</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-purple-700">{progress.overall}%</p>
                                <p className="text-xs text-purple-600">Progress</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Proposal Builder CTA */}
            <Card className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 border-0 text-white overflow-hidden">
                <CardContent className="py-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                            <Sparkles className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Proposal Builder</h3>
                            <p className="text-white/80 text-sm">Design packages, source vendors, and create proposals</p>
                        </div>
                    </div>
                    <Link href={`/planner/events/${id}/builder`}>
                        <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90 font-bold shadow-lg">
                            Open Builder <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                </CardContent>
            </Card>

            {/* Main Content Grid */}
            <div className="grid md:grid-cols-3 gap-6">
                {/* Left Column - Event Details */}
                <div className="md:col-span-2 space-y-6">
                    {/* Event Info Card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">Event Information</CardTitle>
                                <EventStatusBadge status={event.status} />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Date</p>
                                        <p className="font-medium">{new Date(event.date).toLocaleDateString('en-IN', {
                                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                        })}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Venue</p>
                                        <p className="font-medium">{event.venueName || 'Not selected'}</p>
                                    </div>
                                </div>
                            </div>

                            {event.notes && (
                                <div className="pt-3 border-t">
                                    <p className="text-sm text-gray-500 mb-2">Notes</p>
                                    <p className="text-sm bg-orange-50 p-3 rounded-lg text-gray-700">
                                        {event.notes}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Planning Progress Card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Planning Progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { label: 'Venue', progress: progress.venue, link: 'venue' },
                                    { label: 'Caterer', progress: progress.caterer, link: 'food' },
                                    { label: 'Decor & Design', progress: progress.decor, link: 'design' },
                                    { label: 'Photography', progress: progress.photographer, link: 'services' },
                                ].map((item) => (
                                    <Link
                                        key={item.label}
                                        href={`/planner/events/${id}/${item.link}`}
                                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-orange-50 transition-colors group"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium text-sm">{item.label}</span>
                                                <span className="text-xs text-gray-500">{item.progress}%</span>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full transition-all"
                                                    style={{ width: `${item.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-orange-500 transition-colors" />
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Quick Actions */}
                <div className="space-y-6">
                    {/* Quick Actions Card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Link href={`/planner/events/${id}/client`}>
                                <Button variant="outline" className="w-full justify-start gap-2">
                                    <Users className="w-4 h-4" /> View Client Intake
                                </Button>
                            </Link>
                            <Link href={`/planner/events/${id}/proposal`}>
                                <Button variant="outline" className="w-full justify-start gap-2">
                                    <Share2 className="w-4 h-4" /> Generate Proposal
                                </Button>
                            </Link>
                            <Link href={`/planner/events/${id}/execute`}>
                                <Button variant="outline" className="w-full justify-start gap-2">
                                    <CheckCircle2 className="w-4 h-4" /> Go to Execution
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Feasibility Check */}
                    <div className="md:col-span-2">
                        <FeasibilityCheck
                            date={event.date}
                            budgetMax={event.budgetMax || 0}
                            guestCount={event.guestCount || 0}
                            onPassed={() => {
                                console.log('Passed feasibility check')
                            }}
                        />
                    </div>

                    {/* Alerts Card */}
                    <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg text-amber-800 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" /> Reminders
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-amber-700 space-y-2">
                            <p>• Confirm venue booking</p>
                            <p>• Finalize caterer selection</p>
                            <p>• Send proposal to client</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

