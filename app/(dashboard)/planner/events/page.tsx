'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Calendar, MapPin, Users, IndianRupee,
    Plus, Search, Filter, MoreVertical,
    Clock, CheckCircle2, AlertCircle, Inbox,
    ArrowRight, Send, Zap, Archive, Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getEvents } from '@/lib/actions/event-actions'
import { getPendingIntakes, convertIntakeToEvent } from '@/lib/actions/intake-actions'
import { getEventStatusInfo, formatEventType, getDaysUntilEvent } from '@/lib/domain/event'
import type { Event, Intake, EventStatus } from '@/types/domain'

// Status badge component following architecture pattern
function StatusBadge({ status }: { status: EventStatus }) {
    const info = getEventStatusInfo(status)
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-100 text-blue-700',
        gray: 'bg-gray-100 text-gray-700',
        yellow: 'bg-yellow-100 text-yellow-700',
        orange: 'bg-orange-100 text-orange-700',
        green: 'bg-green-100 text-green-700',
        red: 'bg-red-100 text-red-700',
        emerald: 'bg-emerald-100 text-emerald-700',
        slate: 'bg-slate-100 text-slate-700',
    }

    return (
        <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${colorClasses[info.color]}`}>
            {info.label}
        </span>
    )
}

// Intake card component
function IntakeCard({
    intake,
    onConvert
}: {
    intake: Intake
    onConvert: (id: string) => void
}) {
    const [converting, setConverting] = useState(false)

    const handleConvert = async () => {
        setConverting(true)
        await onConvert(intake.id)
        setConverting(false)
    }

    return (
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <Inbox className="w-4 h-4 text-blue-500" />
                            <span className="text-xs font-medium text-blue-600 uppercase">
                                New Intake
                            </span>
                        </div>
                        <h3 className="font-semibold text-lg text-gray-900 mt-1">
                            {intake.clientName}
                        </h3>
                        <p className="text-sm text-gray-500">{intake.phone}</p>
                    </div>
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                        {formatEventType(intake.eventType || 'other')}
                    </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        {intake.eventDate ? new Date(intake.eventDate).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                        }) : 'Date TBD'}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4 text-blue-500" />
                        {intake.guestCount} guests
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        {intake.city}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                        <IndianRupee className="w-4 h-4 text-blue-500" />
                        {(intake.budgetMin / 100000).toFixed(0)}L - {(intake.budgetMax / 100000).toFixed(0)}L
                    </div>
                </div>

                {intake.submittedAt && (
                    <p className="text-xs text-gray-400 mb-3">
                        Submitted {new Date(intake.submittedAt).toLocaleString('en-IN')}
                    </p>
                )}

                <div className="flex gap-2">
                    <Button
                        onClick={handleConvert}
                        disabled={converting}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 gap-2"
                    >
                        {converting ? (
                            <>Converting...</>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                Convert to Event
                            </>
                        )}
                    </Button>
                    <Button variant="outline" size="icon">
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </Card>
    )
}

// Event card component
function EventCard({ event }: { event: Event }) {
    const daysUntil = getDaysUntilEvent(event)
    const isUrgent = daysUntil !== null && daysUntil >= 0 && daysUntil <= 7

    return (
        <Card className={`hover:shadow-lg transition-shadow ${isUrgent ? 'ring-2 ring-orange-200' : ''}`}>
            <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h3 className="font-semibold text-lg text-gray-900">{event.name}</h3>
                        <p className="text-sm text-gray-500">{event.clientName}</p>
                    </div>
                    <StatusBadge status={event.status} />
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 text-orange-500" />
                        {event.date ? new Date(event.date).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                        }) : 'Date TBD'}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4 text-orange-500" />
                        {event.guestCount} guests
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4 text-orange-500" />
                        {event.venueName || event.city}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                        <IndianRupee className="w-4 h-4 text-orange-500" />
                        {(event.budgetMax / 100000).toFixed(1)}L
                    </div>
                </div>

                {isUrgent && daysUntil !== null && (
                    <div className="mb-3 px-3 py-2 bg-orange-50 rounded-lg text-sm text-orange-700 flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        {daysUntil === 0 ? 'TODAY!' : `${daysUntil} days away`}
                    </div>
                )}

                <div className="flex gap-2">
                    <Link href={`/planner/events/${event.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full gap-2">
                            Open Workspace <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </Card>
    )
}

export default function EventsPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [events, setEvents] = useState<Event[]>([])
    const [intakes, setIntakes] = useState<Intake[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('all')

    // Load data on mount
    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            const [eventsData, intakesData] = await Promise.all([
                getEvents(),
                getPendingIntakes()
            ])
            setEvents(eventsData)
            setIntakes(intakesData)
        } catch (error) {
            console.error('Failed to load data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleConvertIntake = async (intakeId: string) => {
        const result = await convertIntakeToEvent(intakeId)
        if (result.success) {
            await loadData() // Refresh data
        } else {
            console.error('Failed to convert:', result.error)
        }
    }

    // Filter logic
    const filteredEvents = events.filter(event => {
        const matchesSearch =
            event.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.clientName?.toLowerCase().includes(searchQuery.toLowerCase())

        if (activeTab === 'all') return matchesSearch
        if (activeTab === 'planning') return matchesSearch && ['draft', 'planning'].includes(event.status)
        if (activeTab === 'proposed') return matchesSearch && event.status === 'proposed'
        if (activeTab === 'approved') return matchesSearch && ['approved', 'live'].includes(event.status)
        return matchesSearch
    })

    const filteredIntakes = intakes.filter((intake: Intake) =>
        intake.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        intake.phone?.includes(searchQuery)
    )

    // Stats
    const stats = {
        total: events.length,
        intakes: intakes.length,
        planning: events.filter(e => ['draft', 'planning'].includes(e.status)).length,
        approved: events.filter(e => ['approved', 'live'].includes(e.status)).length,
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Events</h1>
                    <p className="text-gray-500">
                        {stats.total} events • {stats.intakes} new intakes
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link href="/capture">
                        <Button variant="outline" className="gap-2">
                            <Plus className="w-4 h-4" /> Capture
                        </Button>
                    </Link>
                    <Link href="/planner/events/new">
                        <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 gap-2">
                            <Plus className="w-4 h-4" /> New Event
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
                <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Inbox className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-blue-700">{stats.intakes}</p>
                            <p className="text-xs text-blue-600">New Intakes</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Clock className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-yellow-700">{stats.planning}</p>
                            <p className="text-xs text-yellow-600">In Planning</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-700">{stats.approved}</p>
                            <p className="text-xs text-green-600">Approved</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Calendar className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-orange-700">{stats.total}</p>
                            <p className="text-xs text-orange-600">Total Events</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Search & Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search events or clients..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" /> Filters
                </Button>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-orange-50">
                    <TabsTrigger value="all" className="data-[state=active]:bg-white">
                        All Events
                    </TabsTrigger>
                    <TabsTrigger value="submissions" className="data-[state=active]:bg-white">
                        Intakes ({stats.intakes})
                    </TabsTrigger>
                    <TabsTrigger value="planning" className="data-[state=active]:bg-white">
                        Planning
                    </TabsTrigger>
                    <TabsTrigger value="approved" className="data-[state=active]:bg-white">
                        Approved
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-4">
                    {loading ? (
                        <div className="text-center py-12 text-gray-500">Loading...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Show intakes first */}
                            {filteredIntakes.map((intake: Intake) => (
                                <IntakeCard
                                    key={intake.id}
                                    intake={intake}
                                    onConvert={handleConvertIntake}
                                />
                            ))}
                            {/* Then events */}
                            {filteredEvents.map(event => (
                                <EventCard key={event.id} event={event} />
                            ))}
                            {filteredEvents.length === 0 && filteredIntakes.length === 0 && (
                                <div className="col-span-2 text-center py-12 text-gray-500">
                                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                    <p>No events yet. Create your first event or share the portal link!</p>
                                </div>
                            )}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="submissions" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredIntakes.map((intake: Intake) => (
                            <IntakeCard
                                key={intake.id}
                                intake={intake}
                                onConvert={handleConvertIntake}
                            />
                        ))}
                        {filteredIntakes.length === 0 && (
                            <div className="col-span-2 text-center py-12 text-gray-500">
                                <Inbox className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                <p>No pending intakes. Share your portal link with clients!</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="planning" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredEvents.map(event => (
                            <EventCard key={event.id} event={event} />
                        ))}
                        {filteredEvents.length === 0 && (
                            <div className="col-span-2 text-center py-12 text-gray-500">
                                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                <p>No events in planning stage.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="approved" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredEvents.map(event => (
                            <EventCard key={event.id} event={event} />
                        ))}
                        {filteredEvents.length === 0 && (
                            <div className="col-span-2 text-center py-12 text-gray-500">
                                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                <p>No approved events yet.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
