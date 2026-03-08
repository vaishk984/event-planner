'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Camera, MapPin, Calendar, Clock, CheckCircle2, Users, Send,
    Loader2, Upload, AlertCircle, Zap, ArrowLeft
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { getVendorEventDayData, submitVendorUpdate, markVendorArrival } from '@/actions/vendor-updates'

const STATUS_OPTIONS = [
    { tag: 'setup_started', label: '🔧 Setup Started', color: 'bg-blue-100 text-blue-700' },
    { tag: 'setup_complete', label: '✅ Setup Complete', color: 'bg-green-100 text-green-700' },
    { tag: 'in_progress', label: '🎯 Service In Progress', color: 'bg-purple-100 text-purple-700' },
    { tag: 'completed', label: '🏁 Work Completed', color: 'bg-emerald-100 text-emerald-700' },
    { tag: 'issue', label: '⚠️ Issue / Delay', color: 'bg-red-100 text-red-700' },
    { tag: 'departed', label: '👋 Departed', color: 'bg-gray-100 text-gray-700' },
]

export default function VendorEventDayPage() {
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<any>(null)
    const [selectedEvent, setSelectedEvent] = useState<any>(null)
    const [message, setMessage] = useState('')
    const [sending, setSending] = useState(false)
    const [arrivedMap, setArrivedMap] = useState<Record<string, boolean>>({})

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const result = await getVendorEventDayData()
            setData(result)

            // Merge all events from bookings and assignments
            const allEvents: any[] = []
            const eventIds = new Set<string>()

            for (const b of (result.bookings || [])) {
                if (b.event && !eventIds.has(b.event.id)) {
                    eventIds.add(b.event.id)
                    allEvents.push({
                        ...b.event,
                        bookingId: b.id,
                        service: b.service,
                        status: b.status
                    })
                }
            }

            for (const a of (result.assignments || [])) {
                if (a.event && !eventIds.has(a.event.id)) {
                    eventIds.add(a.event.id)
                    allEvents.push({
                        ...a.event,
                        assignmentId: a.id,
                        service: a.vendor_category,
                        arrivalStatus: a.arrival_status
                    })
                }
            }

            // Auto-select today's or the nearest upcoming event
            const today = new Date().toISOString().split('T')[0]
            const todayEvent = allEvents.find(e => e.date === today)
            if (todayEvent) {
                setSelectedEvent(todayEvent)
            } else if (allEvents.length > 0) {
                setSelectedEvent(allEvents[0])
            }

            // Build arrived map from updates
            const arrived: Record<string, boolean> = {}
            for (const u of (result.updates || [])) {
                if (u.status_tag === 'arrived' || u.update_type === 'arrival') {
                    arrived[u.event_id] = true
                }
            }
            setArrivedMap(arrived)
        } catch (error) {
            console.error('Failed to load event day data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleArrival = async () => {
        if (!selectedEvent) return
        setSending(true)
        const result = await markVendorArrival(selectedEvent.id)
        if (result.success) {
            setArrivedMap(prev => ({ ...prev, [selectedEvent.id]: true }))
            toast.success('You have been marked as arrived!')
            loadData()
        } else {
            toast.error(result.error || 'Failed to mark arrival')
        }
        setSending(false)
    }

    const handleStatusUpdate = async (statusTag: string, label: string) => {
        if (!selectedEvent) return
        setSending(true)
        const result = await submitVendorUpdate({
            eventId: selectedEvent.id,
            updateType: 'status',
            statusTag,
            message: label
        })
        if (result.success) {
            toast.success(`Status updated: ${label}`)
            loadData()
        } else {
            toast.error(result.error || 'Failed to update status')
        }
        setSending(false)
    }

    const handleSendNote = async () => {
        if (!selectedEvent || !message.trim()) return
        setSending(true)
        const result = await submitVendorUpdate({
            eventId: selectedEvent.id,
            updateType: 'note',
            message: message.trim()
        })
        if (result.success) {
            toast.success('Note sent to planner!')
            setMessage('')
            loadData()
        } else {
            toast.error(result.error || 'Failed to send note')
        }
        setSending(false)
    }

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!selectedEvent || !e.target.files?.[0]) return
        const file = e.target.files[0]

        // For now, create a local URL preview and submit as a note with photo indication
        // In production, you'd upload to Supabase Storage first
        setSending(true)

        // Create object URL for immediate preview
        const caption = prompt('Add a caption for this photo:') || 'Photo update'

        const result = await submitVendorUpdate({
            eventId: selectedEvent.id,
            updateType: 'photo',
            message: caption,
            photoUrl: URL.createObjectURL(file) // Placeholder; real impl uploads to storage
        })
        if (result.success) {
            toast.success('Photo update sent!')
            loadData()
        } else {
            toast.error(result.error || 'Failed to send photo')
        }
        setSending(false)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        )
    }

    const allEvents = [
        ...(data?.bookings || []).filter((b: any) => b.event).map((b: any) => ({
            ...b.event,
            service: b.service,
            bookingStatus: b.status
        })),
        ...(data?.assignments || []).filter((a: any) => a.event).map((a: any) => ({
            ...a.event,
            service: a.vendor_category,
            arrivalStatus: a.arrival_status
        }))
    ]

    // Deduplicate
    const uniqueEvents: any[] = []
    const seenEventIds = new Set<string>()
    for (const evt of allEvents) {
        if (!seenEventIds.has(evt.id)) {
            seenEventIds.add(evt.id)
            uniqueEvents.push(evt)
        }
    }

    const myUpdates = (data?.updates || []).filter((u: any) =>
        selectedEvent && u.event_id === selectedEvent.id
    )

    const isArrived = selectedEvent && arrivedMap[selectedEvent.id]

    return (
        <div className="space-y-6 container max-w-4xl mx-auto py-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">Event Day</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">D-Day Dashboard</h1>
                    <p className="text-gray-500 text-sm">Post updates, photos, and status for the planner</p>
                </div>
                <Link href="/vendor/bookings">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                </Link>
            </div>

            {/* Event Selector */}
            {uniqueEvents.length === 0 ? (
                <Card className="p-12 text-center">
                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-700 mb-2">No Active Events</h3>
                    <p className="text-gray-500 text-sm">You don't have any accepted bookings yet.</p>
                </Card>
            ) : (
                <>
                    {uniqueEvents.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {uniqueEvents.map((evt: any) => (
                                <Button
                                    key={evt.id}
                                    variant={selectedEvent?.id === evt.id ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedEvent(evt)}
                                    className={selectedEvent?.id === evt.id ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                                >
                                    {evt.name}
                                </Button>
                            ))}
                        </div>
                    )}

                    {selectedEvent && (
                        <>
                            {/* Event Info Card */}
                            <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0">
                                <CardContent className="py-6">
                                    <h2 className="text-xl font-bold mb-3">{selectedEvent.name}</h2>
                                    <div className="flex flex-wrap gap-4 text-emerald-100 text-sm">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {selectedEvent.date ? new Date(selectedEvent.date).toLocaleDateString('en-IN', {
                                                weekday: 'short', day: 'numeric', month: 'short'
                                            }) : 'Date TBD'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            {selectedEvent.venue_name || selectedEvent.city || 'Venue TBD'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Users className="w-4 h-4" />
                                            {selectedEvent.guest_count || '—'} guests
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Arrival Button */}
                            <Card className={isArrived
                                ? 'border-emerald-300 bg-emerald-50'
                                : 'border-amber-300 bg-amber-50'
                            }>
                                <CardContent className="py-6 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isArrived ? 'bg-emerald-100' : 'bg-amber-100'
                                            }`}>
                                            {isArrived
                                                ? <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                                                : <Clock className="w-6 h-6 text-amber-600" />
                                            }
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {isArrived ? 'You have arrived!' : 'Mark your arrival'}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {isArrived
                                                    ? 'The planner has been notified'
                                                    : 'Let the planner know you\'re at the venue'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    {!isArrived && (
                                        <Button
                                            className="bg-emerald-600 hover:bg-emerald-700"
                                            onClick={handleArrival}
                                            disabled={sending}
                                        >
                                            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                                <>
                                                    <MapPin className="w-4 h-4 mr-2" /> I'm Here
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Quick Status Updates */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Zap className="w-5 h-5 text-emerald-500" />
                                        Quick Status Update
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {STATUS_OPTIONS.map(opt => (
                                            <Button
                                                key={opt.tag}
                                                variant="outline"
                                                size="sm"
                                                className={`text-left justify-start h-auto py-3 ${opt.color} border-0 hover:opacity-80`}
                                                onClick={() => handleStatusUpdate(opt.tag, opt.label)}
                                                disabled={sending}
                                            >
                                                {opt.label}
                                            </Button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Photo Upload + Note */}
                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Photo Upload */}
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Camera className="w-5 h-5 text-blue-500" />
                                            Send Photo
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <label className="flex flex-col items-center gap-3 p-6 border-2 border-dashed rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
                                            <Upload className="w-8 h-8 text-blue-400" />
                                            <span className="text-sm text-gray-500">Tap to upload a photo</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                capture="environment"
                                                className="hidden"
                                                onChange={handlePhotoUpload}
                                                disabled={sending}
                                            />
                                        </label>
                                    </CardContent>
                                </Card>

                                {/* Note */}
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Send className="w-5 h-5 text-purple-500" />
                                            Send Note
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <textarea
                                            className="w-full border rounded-lg p-3 text-sm resize-none h-[100px] focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none"
                                            placeholder="Type a message to the planner..."
                                            value={message}
                                            onChange={e => setMessage(e.target.value)}
                                        />
                                        <Button
                                            className="w-full mt-2 bg-purple-600 hover:bg-purple-700"
                                            onClick={handleSendNote}
                                            disabled={sending || !message.trim()}
                                        >
                                            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send to Planner'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* My Updates Timeline */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">My Updates</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {myUpdates.length === 0 ? (
                                        <p className="text-center text-gray-400 py-6">No updates posted yet</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {myUpdates.map((u: any) => (
                                                <div key={u.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        {u.update_type === 'photo' ? <Camera className="w-4 h-4 text-emerald-600" /> :
                                                            u.update_type === 'arrival' ? <MapPin className="w-4 h-4 text-emerald-600" /> :
                                                                u.update_type === 'status' ? <Zap className="w-4 h-4 text-emerald-600" /> :
                                                                    <Send className="w-4 h-4 text-emerald-600" />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900">{u.message || u.status_tag}</p>
                                                        {u.status_tag && (
                                                            <Badge variant="outline" className="mt-1 text-xs">{u.status_tag}</Badge>
                                                        )}
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            {new Date(u.created_at).toLocaleTimeString('en-IN', {
                                                                hour: '2-digit', minute: '2-digit'
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </>
                    )}
                </>
            )}
        </div>
    )
}
