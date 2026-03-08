'use client'

import { cn } from '@/lib/utils'
import { Home, Calendar, Camera, Palette, UtensilsCrossed, Music, Sparkles, Store, CheckCircle } from 'lucide-react'

interface TabNavProps {
    currentTab: number
    totalTabs: number
    hasPersonalVenue: boolean
}

// Full tab labels for 10-tab flow
const TABS_FULL = [
    { id: 1, label: 'Start', icon: Home },
    { id: 2, label: 'Event', icon: Calendar },
    { id: 3, label: 'Venue', icon: Camera },
    { id: 4, label: 'Food', icon: UtensilsCrossed },
    { id: 5, label: 'Decor', icon: Palette },
    { id: 6, label: 'Music', icon: Music },
    { id: 7, label: 'Photo', icon: Camera },
    { id: 8, label: 'Services', icon: Sparkles },
    { id: 9, label: 'Browse', icon: Store },
    { id: 10, label: 'Done', icon: CheckCircle },
]

// Short tab labels for 9-tab flow (no venue photos)
const TABS_SHORT = [
    { id: 1, label: 'Start', icon: Home },
    { id: 2, label: 'Event', icon: Calendar },
    { id: 3, label: 'Food', icon: UtensilsCrossed },
    { id: 4, label: 'Decor', icon: Palette },
    { id: 5, label: 'Music', icon: Music },
    { id: 6, label: 'Photo', icon: Camera },
    { id: 7, label: 'Services', icon: Sparkles },
    { id: 8, label: 'Browse', icon: Store },
    { id: 9, label: 'Done', icon: CheckCircle },
]

export function ClientTabNavigation({ currentTab, totalTabs, hasPersonalVenue }: TabNavProps) {
    const tabs = hasPersonalVenue ? TABS_FULL : TABS_SHORT

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Progress Bar */}
            <div className="w-full max-w-md">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${(currentTab / totalTabs) * 100}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Step {currentTab} of {totalTabs}</span>
                    <span>{Math.round((currentTab / totalTabs) * 100)}% complete</span>
                </div>
            </div>

            {/* Tab Pills - Show key tabs only on mobile */}
            <div className="flex gap-1 flex-wrap justify-center overflow-x-auto pb-1">
                {tabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = tab.id === currentTab
                    const isCompleted = tab.id < currentTab
                    const isFuture = tab.id > currentTab

                    return (
                        <div
                            key={tab.id}
                            className={cn(
                                "flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all",
                                isActive && "bg-indigo-600 text-white shadow-lg",
                                isCompleted && "bg-green-100 text-green-700",
                                isFuture && "bg-gray-100 text-gray-400"
                            )}
                        >
                            {isCompleted ? (
                                <CheckCircle className="w-3 h-3" />
                            ) : (
                                <Icon className="w-3 h-3" />
                            )}
                            <span className="hidden md:inline">{tab.label}</span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
