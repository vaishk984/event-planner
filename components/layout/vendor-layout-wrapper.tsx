'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Home, Calendar, User, Briefcase, IndianRupee, Settings, LogOut, Menu, X,
    ChevronLeft, ChevronRight, Bell, Camera, Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface VendorLayoutWrapperProps {
    children: React.ReactNode
    userEmail?: string
    vendorName?: string
}

export function VendorLayoutWrapper({
    children,
    userEmail = 'vendor@test.com',
    vendorName = 'Capture Studios'
}: VendorLayoutWrapperProps) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const pathname = usePathname()

    const navItems = [
        { icon: Home, label: 'Dashboard', href: '/vendor' },
        { icon: Briefcase, label: 'Bookings', href: '/vendor/bookings' },
        { icon: Calendar, label: 'Calendar', href: '/vendor/calendar' },
        { icon: Zap, label: 'Event Day', href: '/vendor/event-day' },
        { icon: IndianRupee, label: 'Earnings', href: '/vendor/earnings' },
        { icon: User, label: 'Profile', href: '/vendor/profile' },
    ]

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">

            {/* Mobile Header overlay for hamburger */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-40 flex items-center justify-between px-4 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                        <Camera className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-lg text-gray-800 tracking-tight">
                        {vendorName}
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

            {/* Sidebar - Cool Blue Theme for Vendors */}
            <aside
                className={cn(
                    "fixed left-0 top-0 h-screen bg-white border-r border-slate-200 z-50 flex flex-col transition-all duration-300 ease-in-out shadow-sm transform",
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
                    isCollapsed ? "w-20" : "w-64"
                )}
            >
                {/* Toggle Button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden md:flex absolute -right-3 top-8 bg-white border border-slate-300 rounded-full p-1 shadow-md hover:bg-slate-50 z-50"
                >
                    {isCollapsed ? <ChevronRight className="w-4 h-4 text-slate-600" /> : <ChevronLeft className="w-4 h-4 text-slate-600" />}
                </button>

                {/* Logo Area */}
                <div className={cn("hidden md:flex p-6 border-b border-slate-200 items-center gap-3 overflow-hidden whitespace-nowrap", isCollapsed && "px-4 justify-center")}>
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                        <Camera className="w-5 h-5 text-white" />
                    </div>
                    <div className={cn("transition-opacity duration-200", isCollapsed ? "opacity-0 w-0" : "opacity-100")}>
                        <span className="font-bold text-lg text-gray-800">{vendorName}</span>
                        <p className="text-xs text-slate-500">Vendor Portal</p>
                    </div>
                </div>



                {/* Nav Items */}
                <nav className="flex-1 p-3 space-y-1 mt-4">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/vendor' && pathname.startsWith(item.href))
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={cn(
                                    "flex items-center px-4 py-3 rounded-xl transition-all duration-200 group overflow-hidden whitespace-nowrap",
                                    isActive
                                        ? "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 font-medium shadow-sm"
                                        : "text-gray-600 hover:bg-slate-100 hover:text-blue-700",
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
                                {item.label === 'Bookings' && !isCollapsed && (
                                    /* <Badge className="ml-auto bg-red-500 text-white text-xs">3</Badge> */
                                    null
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer / User Profile */}
                <div className="p-4 border-t border-slate-200">
                    <div className={cn("flex items-center gap-3 px-2 py-3 mb-2 bg-slate-100 rounded-lg overflow-hidden whitespace-nowrap", isCollapsed && "justify-center bg-transparent")}>
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                            {userEmail?.charAt(0).toUpperCase()}
                        </div>
                        <div className={cn("overflow-hidden transition-opacity duration-200", isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100")}>
                            <p className="text-xs font-bold text-gray-800 truncate w-32">{userEmail}</p>
                            <p className="text-xs text-blue-600 font-medium">Vendor</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Link
                            href="/vendor/settings"
                            className={cn(
                                "flex items-center gap-2 flex-1 px-3 py-2 text-sm text-gray-500 hover:bg-slate-100 rounded-lg transition-colors",
                                isCollapsed && "justify-center px-2"
                            )}
                            title={isCollapsed ? "Settings" : undefined}
                        >
                            <Settings className="w-4 h-4" />
                            {!isCollapsed && <span>Settings</span>}
                        </Link>
                        <Link
                            href="/logout"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors",
                                isCollapsed && "justify-center px-2"
                            )}
                            title={isCollapsed ? "Logout" : undefined}
                        >
                            <LogOut className="w-4 h-4" />
                            {!isCollapsed && <span>Logout</span>}
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div
                className={cn("flex-1 transition-all duration-300 ease-in-out p-4 md:p-8 w-full mt-16 md:mt-0", isCollapsed ? "md:ml-20" : "md:ml-64")}
            >
                {children}
            </div>
        </div>
    )
}
