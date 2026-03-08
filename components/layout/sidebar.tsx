'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, Users, LayoutGrid, CheckSquare, Settings, LogOut, ChevronLeft, ChevronRight, Store, FileText, Receipt } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SidebarProps {
    userEmail?: string
}

export function Sidebar({ userEmail = 'planner@example.com' }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const pathname = usePathname()

    const navItems = [
        { icon: Calendar, label: 'Events', href: '/planner/events' },
        { icon: Users, label: 'Leads', href: '/planner/leads' },
        { icon: FileText, label: 'Proposals', href: '/planner/proposals' },
        { icon: Receipt, label: 'Invoices', href: '/planner/invoices' },
        { icon: Store, label: 'Showroom', href: '/showroom' },
        { icon: CheckSquare, label: 'Tasks', href: '/planner/tasks' },
    ]


    return (
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
                    <span className="text-white font-bold text-xl">P</span>
                </div>
                <span className={cn("font-bold text-xl text-gray-800 transition-opacity duration-200", isCollapsed ? "opacity-0 w-0" : "opacity-100")}>
                    PlannerOS
                </span>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 p-3 space-y-2 mt-4">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href)
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center px-4 py-3 rounded-xl transition-all duration-200 group overflow-hidden whitespace-nowrap",
                                isActive
                                    ? "bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 font-medium"
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

            {/* Footer / User Profile */}
            <div className="p-4 border-t border-orange-100">
                <div className={cn("flex items-center gap-3 px-2 py-3 mb-2 bg-orange-50 rounded-lg overflow-hidden whitespace-nowrap", isCollapsed && "justify-center bg-transparent")}>
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center text-white font-bold">
                        {userEmail?.charAt(0).toUpperCase()}
                    </div>
                    <div className={cn("overflow-hidden transition-opacity duration-200", isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100")}>
                        <p className="text-xs font-bold text-gray-800 truncate w-32">{userEmail}</p>
                        <p className="text-xs text-orange-600 font-medium">Planner</p>
                    </div>
                </div>

                <Link
                    href="/logout"
                    className={cn(
                        "flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors overflow-hidden whitespace-nowrap",
                        isCollapsed && "justify-center px-2"
                    )}
                    title={isCollapsed ? "Logout" : undefined}
                >
                    <LogOut className="flex-shrink-0 w-5 h-5" />
                    <span className={cn("transition-opacity duration-200", isCollapsed ? "opacity-0 w-0" : "opacity-100")}>
                        Logout
                    </span>
                </Link>
            </div>
        </aside>
    )
}
