'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard, Users, Building2, UserCog, Settings,
    ChevronRight, LogOut, Shield, Bell, Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: Users, label: 'Planners', href: '/admin/planners' },
    { icon: Building2, label: 'Vendors', href: '/admin/vendors' },
    { icon: UserCog, label: 'Users', href: '/admin/users' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
]

export function AdminLayoutWrapper({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const [collapsed, setCollapsed] = useState(false)

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className={`${collapsed ? 'w-16' : 'w-64'} bg-slate-900 text-white transition-all duration-300 flex flex-col`}>
                {/* Logo */}
                <div className="p-4 border-b border-slate-700">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        {!collapsed && (
                            <div>
                                <h1 className="font-bold text-lg">PlannerOS</h1>
                                <p className="text-xs text-slate-400">Admin Panel</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/admin' && pathname.startsWith(item.href))

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
                                        ? 'bg-red-500/20 text-red-400'
                                        : 'text-slate-300 hover:bg-slate-800'
                                    }`}
                            >
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                {!collapsed && <span>{item.label}</span>}
                            </Link>
                        )
                    })}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-slate-700">
                    <Link
                        href="/logout"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        {!collapsed && <span>Logout</span>}
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Top Header */}
                <header className="h-16 bg-white border-b flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCollapsed(!collapsed)}
                        >
                            <ChevronRight className={`w-5 h-5 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
                        </Button>
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <Input
                                placeholder="Search..."
                                className="pl-10 w-64 bg-gray-50"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                                3
                            </span>
                        </Button>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white text-sm font-bold">
                                A
                            </div>
                            <div className="text-sm">
                                <p className="font-medium">Super Admin</p>
                                <p className="text-gray-500 text-xs">admin@test.com</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
