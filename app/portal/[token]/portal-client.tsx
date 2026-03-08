'use client'

import Link from 'next/link'
import {
    Calendar, MapPin, Users, Clock, CheckCircle2,
    Zap, MessageSquare, Camera, ChevronRight,
    Sparkles, ArrowRight
} from 'lucide-react'

interface PortalDashboardClientProps {
    token: string
    event: any
    services: any[]
    progress: { totalServices: number; arrivedCount: number; progressPercent: number } | null
}

export function PortalDashboardClient({ token, event, services, progress }: PortalDashboardClientProps) {
    const eventDate = event.date ? new Date(event.date) : null
    const now = new Date()
    const daysUntil = eventDate ? Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null
    const isToday = daysUntil !== null && daysUntil <= 0 && daysUntil >= -1
    const isPast = daysUntil !== null && daysUntil < -1

    const confirmedServices = services.filter(s => s.status === 'confirmed').length
    const totalServices = services.length

    const getPhase = () => {
        if (isPast) return { label: 'Completed', color: 'text-green-600', bg: 'bg-green-50' }
        if (isToday) return { label: 'Event Day! 🎉', color: 'text-orange-600', bg: 'bg-orange-50' }
        if (confirmedServices === totalServices && totalServices > 0) return { label: 'All Set!', color: 'text-emerald-600', bg: 'bg-emerald-50' }
        return { label: 'Planning', color: 'text-blue-600', bg: 'bg-blue-50' }
    }
    const phase = getPhase()

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Welcome back! 👋</h1>
                    <p className="text-gray-500">Here's an overview of your event</p>
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-medium ${phase.bg} ${phase.color}`}>
                    {phase.label}
                </div>
            </div>

            {/* Event Hero */}
            <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 rounded-2xl p-8 text-white shadow-xl shadow-orange-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold">{event.name}</h2>
                        <div className="flex flex-wrap gap-4 mt-3 text-orange-100">
                            {eventDate && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>{eventDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                </div>
                            )}
                            {event.venue && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    <span>{event.venue}</span>
                                </div>
                            )}
                            {event.guest_count && (
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    <span>{event.guest_count} guests</span>
                                </div>
                            )}
                        </div>
                    </div>
                    {daysUntil !== null && daysUntil >= 0 && (
                        <div className="bg-white/20 backdrop-blur rounded-xl p-4 text-center min-w-[120px]">
                            <div className="text-4xl font-bold">{isToday ? '🎉' : daysUntil}</div>
                            <div className="text-sm text-orange-100">{isToday ? 'Today!' : daysUntil === 1 ? 'day to go' : 'days to go'}</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{totalServices}</p>
                            <p className="text-xs text-gray-500">Total Services</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{confirmedServices}</p>
                            <p className="text-xs text-gray-500">Confirmed</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{totalServices - confirmedServices}</p>
                            <p className="text-xs text-gray-500">In Progress</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                            <Users className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{event.guest_count || '—'}</p>
                            <p className="text-xs text-gray-500">Guests</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Access Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                    href={`/portal/${token}/updates`}
                    className="group bg-white rounded-xl p-6 border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all duration-300"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Camera className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Live Updates</h3>
                                <p className="text-sm text-gray-500">Photos & progress</p>
                            </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-orange-400 transition-colors" />
                    </div>
                </Link>

                <Link
                    href={`/portal/${token}/proposal`}
                    className="group bg-white rounded-xl p-6 border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all duration-300"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <CheckCircle2 className="w-6 h-6 text-green-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Proposal</h3>
                                <p className="text-sm text-gray-500">View your plan</p>
                            </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-orange-400 transition-colors" />
                    </div>
                </Link>

                <Link
                    href={`/portal/${token}/contact`}
                    className="group bg-white rounded-xl p-6 border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all duration-300"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <MessageSquare className="w-6 h-6 text-purple-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Messages</h3>
                                <p className="text-sm text-gray-500">Chat with planner</p>
                            </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-orange-400 transition-colors" />
                    </div>
                </Link>
            </div>

            {/* Services Table */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-orange-500" />
                        Your Event Services
                    </h3>
                    <span className="text-sm text-gray-400">{confirmedServices}/{totalServices} confirmed</span>
                </div>
                {services.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                        <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>Your planner is working on your services</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {services.map((service) => (
                            <div key={service.id} className="flex items-center justify-between p-4 hover:bg-orange-50/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${service.status === 'confirmed' ? 'bg-green-100' :
                                            service.status === 'in_progress' ? 'bg-blue-100' : 'bg-gray-100'
                                        }`}>
                                        {service.status === 'confirmed' ? (
                                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <Clock className="w-5 h-5 text-blue-600" />
                                        )}
                                    </div>
                                    <span className="font-medium text-gray-800">{service.category}</span>
                                </div>
                                <span className={`text-sm font-medium px-3 py-1 rounded-full ${service.status === 'confirmed' ? 'bg-green-50 text-green-700' :
                                        service.status === 'in_progress' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-600'
                                    }`}>
                                    {service.statusLabel}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* D-Day Progress */}
            {progress && progress.totalServices > 0 && (isToday || progress.arrivedCount > 0) && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
                    <h3 className="font-semibold text-green-800 flex items-center gap-2 mb-3">
                        <Zap className="w-5 h-5" />
                        Event Day Progress
                    </h3>
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <div className="h-3 bg-green-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                                    style={{ width: `${progress.progressPercent}%` }}
                                />
                            </div>
                        </div>
                        <span className="text-green-700 font-bold">{progress.progressPercent}%</span>
                    </div>
                    <p className="text-sm text-green-600 mt-2">
                        {progress.arrivedCount} of {progress.totalServices} service teams on site
                    </p>
                </div>
            )}
        </div>
    )
}
