'use client'

import {
    CheckCircle2, Clock, Calendar, MapPin, Users,
    FileText, Sparkles, IndianRupee
} from 'lucide-react'

interface ProposalClientProps {
    event: any
    services: any[]
}

export function ProposalClient({ event, services }: ProposalClientProps) {
    const confirmedServices = services.filter(s => s.status === 'confirmed')
    const pendingServices = services.filter(s => s.status !== 'confirmed')

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Event Proposal</h1>
                <p className="text-gray-500">Your curated event plan</p>
            </div>

            {/* Event Summary Card */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{event.name}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-orange-500" />
                        <span>{event.date ? new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-orange-500" />
                        <span>{event.venue || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4 text-orange-500" />
                        <span>{event.guest_count || '—'} guests</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText className="w-4 h-4 text-orange-500" />
                        <span className="capitalize">{event.event_type || '—'}</span>
                    </div>
                </div>
            </div>

            {/* Confirmed Services */}
            {confirmedServices.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 bg-green-50/50">
                        <h3 className="font-semibold text-green-800 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5" />
                            Confirmed Services ({confirmedServices.length})
                        </h3>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {confirmedServices.map((service, idx) => (
                            <div key={service.id} className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">{service.category}</p>
                                        <p className="text-xs text-gray-400">Service arranged by your planner</p>
                                    </div>
                                </div>
                                <span className="text-sm font-medium px-3 py-1 rounded-full bg-green-50 text-green-700">
                                    ✅ Confirmed
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Pending Services */}
            {pendingServices.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 bg-blue-50/50">
                        <h3 className="font-semibold text-blue-800 flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Being Arranged ({pendingServices.length})
                        </h3>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {pendingServices.map((service) => (
                            <div key={service.id} className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">{service.category}</p>
                                        <p className="text-xs text-gray-400">Your planner is working on this</p>
                                    </div>
                                </div>
                                <span className="text-sm font-medium px-3 py-1 rounded-full bg-blue-50 text-blue-700">
                                    {service.statusLabel}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {services.length === 0 && (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                    <Sparkles className="w-10 h-10 mx-auto mb-3 text-orange-300" />
                    <h3 className="font-semibold text-gray-600">Your proposal is being prepared</h3>
                    <p className="text-sm text-gray-400 mt-1">Your planner is selecting the best services for your event</p>
                </div>
            )}

            {/* Budget Note */}
            {event.budget_max && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-3">
                    <IndianRupee className="w-5 h-5 text-orange-600" />
                    <div>
                        <p className="text-sm font-medium text-orange-800">Budget: ₹{Number(event.budget_max).toLocaleString('en-IN')}</p>
                        <p className="text-xs text-orange-600">Your planner is working within your specified budget</p>
                    </div>
                </div>
            )}
        </div>
    )
}
