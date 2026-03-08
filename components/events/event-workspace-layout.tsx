'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard, Users, MapPin, Palette, UtensilsCrossed,
    Sparkles, FileText, PlayCircle, ArrowLeft, ClipboardList, CalendarDays, IndianRupee, UserCheck, Store
} from 'lucide-react'

import { cn } from '@/lib/utils'

interface EventWorkspaceLayoutProps {
    children: React.ReactNode
    eventId: string
    eventName: string
    eventDate: string
    eventType: string
}

const TABS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, href: '' },
    { id: 'timeline', label: 'Timeline', icon: CalendarDays, href: '/timeline' },
    { id: 'budget', label: 'Budget', icon: IndianRupee, href: '/budget' },

    { id: 'guests', label: 'Guests', icon: Users, href: '/guests' },
    { id: 'vendors', label: 'Vendors', icon: Store, href: '/vendors' },
    { id: 'client', label: 'Client', icon: UserCheck, href: '/client' },

    { id: 'venue', label: 'Venue', icon: MapPin, href: '/venue' },
    { id: 'design', label: 'Design', icon: Palette, href: '/design' },
    { id: 'specs', label: 'Specs', icon: ClipboardList, href: '/specs' },
    { id: 'food', label: 'Food', icon: UtensilsCrossed, href: '/food' },
    { id: 'services', label: 'Services', icon: Sparkles, href: '/services' },
    { id: 'proposal', label: 'Proposal', icon: FileText, href: '/proposal' },
    { id: 'execute', label: 'Execute', icon: PlayCircle, href: '/execute' },
]

export function EventWorkspaceLayout({
    children,
    eventId,
    eventName,
    eventDate,
    eventType
}: EventWorkspaceLayoutProps) {
    const pathname = usePathname()
    const basePath = `/planner/events/${eventId}`

    // Determine active tab
    const getActiveTab = () => {
        const path = pathname.replace(basePath, '')
        if (!path || path === '/') return 'overview'
        return path.replace('/', '')
    }
    const activeTab = getActiveTab()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Link
                        href="/planner/events"
                        className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1 mb-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Events
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">{eventName}</h1>
                    <p className="text-gray-500 capitalize">{eventType} • {eventDate}</p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-xl border border-orange-100 shadow-sm p-1 overflow-x-auto">
                <div className="flex gap-1 min-w-max">
                    {TABS.map((tab) => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id
                        const href = tab.href ? `${basePath}${tab.href}` : basePath

                        return (
                            <Link
                                key={tab.id}
                                href={href}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap",
                                    isActive
                                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm"
                                        : "text-gray-600 hover:bg-orange-50 hover:text-orange-700"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </Link>
                        )
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div className="animate-in fade-in duration-200">
                {children}
            </div>
        </div>
    )
}
