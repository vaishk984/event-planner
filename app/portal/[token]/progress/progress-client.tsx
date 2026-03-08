'use client'

import {
    CheckCircle2, Circle, Clock, Calendar, Zap,
    Sparkles, PartyPopper, ArrowRight
} from 'lucide-react'

interface ProgressClientProps {
    event: any
    services: any[]
    progress: { totalServices: number; arrivedCount: number; progressPercent: number } | null
}

export function ProgressClient({ event, services, progress }: ProgressClientProps) {
    const eventDate = event.date ? new Date(event.date) : null
    const now = new Date()
    const daysUntil = eventDate ? Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null
    const isToday = daysUntil !== null && daysUntil <= 0 && daysUntil >= -1
    const isPast = daysUntil !== null && daysUntil < -1

    const confirmedServices = services.filter(s => s.status === 'confirmed').length
    const totalServices = services.length
    const allConfirmed = confirmedServices === totalServices && totalServices > 0

    // Define event phases
    const phases = [
        {
            label: 'Requirements Captured',
            description: 'Your preferences have been recorded',
            done: true,
            icon: Sparkles,
        },
        {
            label: 'Services Being Arranged',
            description: `${confirmedServices}/${totalServices} services confirmed`,
            done: allConfirmed,
            active: !allConfirmed && totalServices > 0,
            icon: Clock,
        },
        {
            label: 'All Services Confirmed',
            description: 'Every service for your event is locked in',
            done: allConfirmed,
            icon: CheckCircle2,
        },
        {
            label: 'Event Day',
            description: isToday ? 'Today is the day! 🎉' : eventDate ? eventDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' }) : '—',
            done: isPast,
            active: isToday,
            icon: PartyPopper,
        },
        {
            label: 'Completed',
            description: 'Your event has concluded',
            done: isPast,
            icon: CheckCircle2,
        },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Event Progress</h1>
                <p className="text-gray-500">Track your event journey from planning to D-day</p>
            </div>

            {/* Overall Progress */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Overall Progress</h3>
                    <span className="text-sm text-gray-500">
                        {totalServices > 0 ? `${Math.round((confirmedServices / totalServices) * 100)}%` : '0%'}
                    </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-700"
                        style={{ width: totalServices > 0 ? `${(confirmedServices / totalServices) * 100}%` : '0%' }}
                    />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                    {confirmedServices} of {totalServices} services confirmed
                </p>
            </div>

            {/* Phase Timeline */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-6">Event Journey</h3>
                <div className="space-y-0">
                    {phases.map((phase, idx) => (
                        <div key={phase.label} className="flex gap-4">
                            {/* Timeline Line */}
                            <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${phase.done
                                        ? 'bg-green-500 text-white'
                                        : phase.active
                                            ? 'bg-orange-500 text-white animate-pulse'
                                            : 'bg-gray-200 text-gray-400'
                                    }`}>
                                    <phase.icon className="w-5 h-5" />
                                </div>
                                {idx < phases.length - 1 && (
                                    <div className={`w-0.5 h-16 ${phase.done ? 'bg-green-300' : 'bg-gray-200'
                                        }`} />
                                )}
                            </div>

                            {/* Content */}
                            <div className="pb-8">
                                <p className={`font-medium ${phase.done ? 'text-green-700' :
                                        phase.active ? 'text-orange-700' : 'text-gray-400'
                                    }`}>
                                    {phase.label}
                                    {phase.active && <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Current</span>}
                                </p>
                                <p className="text-sm text-gray-500 mt-0.5">{phase.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Service Checklist */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Service Checklist</h3>
                </div>
                {services.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>Services will appear here as your planner arranges them</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {services.map((service) => (
                            <div key={service.id} className="flex items-center gap-4 p-4">
                                {service.status === 'confirmed' ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                ) : (
                                    <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                                )}
                                <span className={`flex-1 ${service.status === 'confirmed' ? 'text-gray-800' : 'text-gray-500'
                                    }`}>
                                    {service.category}
                                </span>
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${service.status === 'confirmed'
                                        ? 'bg-green-50 text-green-700'
                                        : 'bg-gray-100 text-gray-500'
                                    }`}>
                                    {service.statusLabel}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* D-Day Progress (if applicable) */}
            {progress && progress.totalServices > 0 && (isToday || progress.arrivedCount > 0) && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
                    <h3 className="font-semibold text-green-800 flex items-center gap-2 mb-3">
                        <Zap className="w-5 h-5" />
                        D-Day Live Progress
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
