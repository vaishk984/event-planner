'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Home, FileText, Sparkles, CheckCircle2, Camera,
    MessageSquare, ChevronLeft, ChevronRight, PartyPopper
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PortalLayoutWrapperProps {
    children: React.ReactNode
    token: string
    eventName: string
    clientName?: string
}

export function PortalLayoutWrapper({
    children,
    token,
    eventName,
    clientName = 'Client'
}: PortalLayoutWrapperProps) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const pathname = usePathname()

    const basePath = `/portal/${token}`

    const navItems = [
        { icon: Home, label: 'Dashboard', href: basePath },
        { icon: Sparkles, label: 'My Requirements', href: `${basePath}/requirements` },
        { icon: FileText, label: 'Proposal', href: `${basePath}/proposal` },
        { icon: CheckCircle2, label: 'Progress', href: `${basePath}/progress` },
        { icon: Camera, label: 'Live Updates', href: `${basePath}/updates` },
        { icon: MessageSquare, label: 'Messages', href: `${basePath}/contact` },
    ]

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50/30">
            {/* Sidebar — Warm Orange Theme for Clients */}
            <aside
                className={cn(
                    "fixed left-0 top-0 h-screen bg-white border-r border-orange-100 z-50 flex flex-col transition-all duration-300 ease-in-out shadow-sm",
                    isCollapsed ? "w-20" : "w-64"
                )}
            >
                {/* Toggle Button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-8 bg-white border border-orange-200 rounded-full p-1 shadow-md hover:bg-orange-50 z-50"
                >
                    {isCollapsed ? <ChevronRight className="w-4 h-4 text-orange-600" /> : <ChevronLeft className="w-4 h-4 text-orange-600" />}
                </button>

                {/* Logo Area */}
                <div className={cn("p-6 border-b border-orange-100 flex items-center gap-3 overflow-hidden whitespace-nowrap", isCollapsed && "px-4 justify-center")}>
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
                        <PartyPopper className="w-5 h-5 text-white" />
                    </div>
                    <div className={cn("transition-opacity duration-200 min-w-0", isCollapsed ? "opacity-0 w-0" : "opacity-100")}>
                        <span className="font-bold text-lg text-gray-800 truncate block">{eventName}</span>
                        <p className="text-xs text-orange-500">Client Portal</p>
                    </div>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 p-3 space-y-1 mt-4">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== basePath && pathname.startsWith(item.href))
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center px-4 py-3 rounded-xl transition-all duration-200 group overflow-hidden whitespace-nowrap",
                                    isActive
                                        ? "bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 font-medium shadow-sm"
                                        : "text-gray-600 hover:bg-orange-50 hover:text-orange-700",
                                    isCollapsed && "justify-center px-2"
                                )}
                                title={isCollapsed ? item.label : undefined}
                            >
                                <item.icon className={cn(
                                    "flex-shrink-0 transition-transform duration-200",
                                    isCollapsed ? "w-6 h-6" : "w-5 h-5",
                                    isActive && "scale-110"
                                )} />
                                <span className={cn(
                                    "ml-3 transition-opacity duration-200",
                                    isCollapsed ? "opacity-0 w-0" : "opacity-100"
                                )}>
                                    {item.label}
                                </span>
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-orange-100">
                    <div className={cn("flex items-center gap-3 px-2 py-3 bg-orange-50 rounded-lg overflow-hidden whitespace-nowrap", isCollapsed && "justify-center bg-transparent")}>
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {clientName?.charAt(0).toUpperCase()}
                        </div>
                        <div className={cn("overflow-hidden transition-opacity duration-200", isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100")}>
                            <p className="text-sm font-medium text-gray-800 truncate w-32">{clientName}</p>
                            <p className="text-xs text-orange-600">Client</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div
                className={cn(
                    "flex-1 transition-all duration-300 ease-in-out p-8 w-full",
                    isCollapsed ? "ml-20" : "ml-64"
                )}
            >
                {children}
            </div>
        </div>
    )
}
