'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, Check, CheckCheck, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '@/actions/notifications'
import Link from 'next/link'

interface Notification {
    id: string
    type: string
    title: string
    message: string
    is_read: boolean
    link: string | null
    created_at: string
}

export function NotificationBell({ collapsed }: { collapsed?: boolean }) {
    const [open, setOpen] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const panelRef = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const [panelPos, setPanelPos] = useState({ top: 0, left: 0 })

    const fetchNotifications = async () => {
        const result = await getNotifications()
        setNotifications(result.notifications)
        setUnreadCount(result.unreadCount)
    }

    // Fetch on mount and poll every 30s
    useEffect(() => {
        fetchNotifications()
        const interval = setInterval(fetchNotifications, 30000)
        return () => clearInterval(interval)
    }, [])

    // Close panel when clicking outside
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node) &&
                buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        if (open) document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [open])

    // Calculate position when opening
    const toggleOpen = () => {
        if (!open && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect()
            setPanelPos({
                top: rect.bottom + 8,
                left: rect.left
            })
        }
        setOpen(!open)
    }

    const handleMarkRead = async (id: string) => {
        await markNotificationRead(id)
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
        setUnreadCount(prev => Math.max(0, prev - 1))
    }

    const handleMarkAllRead = async () => {
        await markAllNotificationsRead()
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        setUnreadCount(0)
    }

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime()
        const mins = Math.floor(diff / 60000)
        if (mins < 1) return 'Just now'
        if (mins < 60) return `${mins}m ago`
        const hours = Math.floor(mins / 60)
        if (hours < 24) return `${hours}h ago`
        const days = Math.floor(hours / 24)
        return `${days}d ago`
    }

    return (
        <>
            {/* Bell Button */}
            <button
                ref={buttonRef}
                onClick={toggleOpen}
                className={cn(
                    "relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200",
                    "hover:bg-orange-100 text-gray-600 hover:text-orange-700",
                    open && "bg-orange-100 text-orange-700"
                )}
                title="Notifications"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel - Fixed position to escape sidebar overflow */}
            {open && (
                <div
                    ref={panelRef}
                    className="fixed z-[100] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden w-[400px] max-h-[500px] flex flex-col"
                    style={{ top: panelPos.top, left: panelPos.left }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                        <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs text-orange-600 hover:text-orange-800 flex items-center gap-1 font-medium"
                            >
                                <CheckCheck className="w-3 h-3" /> Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notification List */}
                    <div className="overflow-y-auto flex-1">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-10 text-center text-gray-400 text-sm">
                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                No notifications yet
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n.id}
                                    className={cn(
                                        "px-4 py-3 border-b last:border-b-0 transition-colors cursor-pointer hover:bg-orange-50/50",
                                        !n.is_read && "bg-orange-50/80"
                                    )}
                                    onClick={() => {
                                        if (!n.is_read) handleMarkRead(n.id)
                                    }}
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Unread dot */}
                                        <div className="mt-1.5 flex-shrink-0">
                                            {!n.is_read ? (
                                                <div className="w-2 h-2 rounded-full bg-orange-500" />
                                            ) : (
                                                <div className="w-2 h-2 rounded-full bg-transparent" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={cn("text-sm font-medium", !n.is_read ? "text-gray-900" : "text-gray-600")}>
                                                {n.title}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5 whitespace-pre-wrap">{n.message}</p>
                                            <div className="flex items-center justify-between mt-1.5">
                                                <span className="text-[10px] text-gray-400">{timeAgo(n.created_at)}</span>
                                                {n.link && (
                                                    <Link
                                                        href={n.link}
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            if (!n.is_read) handleMarkRead(n.id)
                                                            setOpen(false)
                                                        }}
                                                        className="text-[10px] text-orange-600 hover:underline flex items-center gap-0.5"
                                                    >
                                                        View <ExternalLink className="w-2.5 h-2.5" />
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
