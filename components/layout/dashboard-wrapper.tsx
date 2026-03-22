'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, Users, LayoutGrid, CheckSquare, LogOut, ChevronLeft, ChevronRight, FileText, IndianRupee, Home, ClipboardList, Building2, Package, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NotificationBell } from './notification-bell'

interface DashboardWrapperProps {
    children: React.ReactNode
    userEmail?: string
    userRole?: string
    userId?: string
}

const PLANNER_NAV = [
    { icon: Home, label: 'Dashboard', href: '/planner' },
    { icon: Calendar, label: 'Events', href: '/planner/events' },
    { icon: Users, label: 'Leads', href: '/planner/leads' },
    { icon: FileText, label: 'Proposals', href: '/planner/proposals' },
    { icon: IndianRupee, label: 'Invoices', href: '/planner/invoices' },
    { icon: CheckSquare, label: 'Tasks', href: '/planner/tasks' },
    { icon: LayoutGrid, label: 'Showroom', href: '/showroom' },
    { icon: ClipboardList, label: 'Capture', href: '/capture' },
]

const VENDOR_NAV = [
    { icon: Home, label: 'Dashboard', href: '/vendor' },
    { icon: Calendar, label: 'My Bookings', href: '/vendor/bookings' },
    { icon: Package, label: 'My Services', href: '/vendor/services' },
]

export function DashboardWrapper({ children, userEmail = 'planner@example.com', userRole = 'planner', userId }: DashboardWrapperProps) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const pathname = usePathname()

    const isVendor = userRole === 'vendor'
    const navItems = isVendor ? VENDOR_NAV : PLANNER_NAV
    const roleLabel = isVendor ? 'Vendor' : 'Planner'
    const accentFrom = isVendor ? 'from-emerald-500' : 'from-orange-500'
    const accentTo = isVendor ? 'to-teal-500' : 'to-amber-500'

    return (
        <div className={cn(
            "flex min-h-screen",
            isVendor
                ? "bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/30"
                : "bg-gradient-to-br from-orange-50/50 via-white to-amber-50/30"
        )}>
            {/* Mobile Header overlay for hamburger */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-40 flex items-center justify-between px-4 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className={cn(
                        "w-8 h-8 bg-gradient-to-br rounded-lg flex items-center justify-center text-white font-bold shadow-md",
                        accentFrom, accentTo
                    )}>
                        {isVendor ? 'V' : 'P'}
                    </div>
                    <span className="font-bold text-lg text-gray-800 tracking-tight">
                        {isVendor ? 'VendorOS' : 'PlannerOS'}
                    </span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-gray-50 rounded-lg text-gray-600">
                    {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Mobile Sidebar backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-0 h-screen bg-white border-r z-50 flex flex-col transition-all duration-300 ease-in-out shadow-sm transform",
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
                    isVendor ? "border-emerald-100" : "border-orange-100",
                    isCollapsed ? "w-20" : "w-64"
                )}
            >
                {/* Toggle Button (Desktop Only) */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={cn(
                        "hidden md:flex absolute -right-3 top-8 bg-white border rounded-full p-1 shadow-md z-50",
                        isVendor ? "border-emerald-200 hover:bg-emerald-50" : "border-orange-200 hover:bg-orange-50"
                    )}
                >
                    {isCollapsed
                        ? <ChevronRight className={cn("w-4 h-4", isVendor ? "text-emerald-600" : "text-orange-600")} />
                        : <ChevronLeft className={cn("w-4 h-4", isVendor ? "text-emerald-600" : "text-orange-600")} />
                    }
                </button>

                {/* Logo Area */}
                <div className={cn(
                    "p-6 border-b flex items-center gap-3 overflow-hidden whitespace-nowrap",
                    isVendor ? "border-emerald-100" : "border-orange-100",
                    isCollapsed && "px-4 justify-center"
                )}>
                    <div className={cn(
                        "flex-shrink-0 w-10 h-10 bg-gradient-to-br rounded-xl flex items-center justify-center shadow-lg",
                        accentFrom, accentTo,
                        isVendor ? "shadow-emerald-200" : "shadow-orange-200"
                    )}>
                        <span className="text-white font-bold text-xl">{isVendor ? 'V' : 'P'}</span>
                    </div>
                    <span className={cn("font-bold text-xl text-gray-800 transition-opacity duration-200 flex-1", isCollapsed ? "opacity-0 w-0" : "opacity-100")}>
                        {isVendor ? 'VendorOS' : 'PlannerOS'}
                    </span>
                    <NotificationBell collapsed={isCollapsed} />
                </div>

                {/* Nav Items */}
                <nav className="flex-1 p-3 space-y-1 mt-4">
                    {navItems.map((item) => {
                        const baseHref = item.href
                        const isActive = pathname === baseHref || (baseHref !== '/planner' && baseHref !== '/vendor' && pathname.startsWith(baseHref))
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                prefetch={false}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={cn(
                                    "flex items-center px-4 py-3 rounded-xl transition-all duration-200 group overflow-hidden whitespace-nowrap",
                                    isActive
                                        ? isVendor
                                            ? "bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 font-medium shadow-sm"
                                            : "bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 font-medium shadow-sm"
                                        : isVendor
                                            ? "text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
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
                <div className={cn("p-4 border-t", isVendor ? "border-emerald-100" : "border-orange-100")}>
                    <div className={cn(
                        "flex items-center gap-3 px-2 py-3 mb-2 rounded-lg overflow-hidden whitespace-nowrap",
                        isCollapsed ? "justify-center bg-transparent" : isVendor ? "bg-emerald-50" : "bg-orange-50"
                    )}>
                        <div className={cn(
                            "flex-shrink-0 w-8 h-8 bg-gradient-to-br rounded-full flex items-center justify-center text-white font-bold",
                            isVendor ? "from-emerald-400 to-teal-400" : "from-orange-400 to-amber-400"
                        )}>
                            {userEmail?.charAt(0).toUpperCase()}
                        </div>
                        <div className={cn("overflow-hidden transition-opacity duration-200", isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100")}>
                            <p className="text-xs font-bold text-gray-800 truncate w-32">{userEmail}</p>
                            <p className={cn("text-xs font-medium", isVendor ? "text-emerald-600" : "text-orange-600")}>{roleLabel}</p>
                        </div>
                    </div>

                    <Link
                        href="/logout"
                        onClick={() => setIsMobileMenuOpen(false)}
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

            {/* Main Content Area */}
            <div
                className={cn(
                    "flex-1 transition-all duration-300 ease-in-out p-4 md:p-8 w-full mt-16 md:mt-0",
                    isCollapsed ? "md:ml-20" : "md:ml-64"
                )}
            >
                {children}
            </div>
        </div>
    )
}
