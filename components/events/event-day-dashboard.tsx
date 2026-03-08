'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
    Clock, CheckCircle2, AlertTriangle, User, MapPin,
    RefreshCw, Zap, Users, Camera, MessageSquare, Send,
    Loader2, Image as ImageIcon
} from 'lucide-react'
import { toast } from 'sonner'
import type { Event } from '@/types/domain'
import { getEventDayVendors, getUpdatesForEvent } from '@/actions/vendor-updates'
import { createClient } from '@/lib/supabase/client'

interface EventDayDashboardProps {
    event: Event
}

interface VendorInfo {
    id: string
    vendorId: string
    vendorName: string
    vendorCategory: string
    vendorImage: string | null
    arrivalStatus: string
    arrivedAt: string | null
    departedAt: string | null
    agreedAmount: number
    status: string
    source: string
}

interface VendorUpdate {
    id: string
    event_id: string
    vendor_id: string
    update_type: string
    message: string | null
    photo_url: string | null
    status_tag: string | null
    created_at: string
    vendor?: {
        id: string
        company_name: string
        category: string
        image_url: string | null
    }
}

export function EventDayDashboard({ event }: EventDayDashboardProps) {
    const [vendors, setVendors] = useState<VendorInfo[]>([])
    const [updates, setUpdates] = useState<VendorUpdate[]>([])
    const [loading, setLoading] = useState(true)
    const [currentTime, setCurrentTime] = useState(new Date())

    // Load data
    useEffect(() => {
        loadDashboardData()
    }, [event.id])

    // Update current time every minute
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date())
        }, 60000)
        return () => clearInterval(interval)
    }, [])

    // Subscribe to real-time updates
    useEffect(() => {
        const supabase = createClient()
        const channel = supabase
            .channel(`event-day-${event.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'vendor_updates',
                    filter: `event_id=eq.${event.id}`
                },
                (payload) => {
                    // Refresh data when a new update comes in
                    loadDashboardData()
                    toast.info('New vendor update received!')
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [event.id])

    const loadDashboardData = async () => {
        try {
            const [vendorData, updateData] = await Promise.all([
                getEventDayVendors(event.id),
                getUpdatesForEvent(event.id)
            ])
            setVendors(vendorData)
            setUpdates(updateData)
        } catch (error) {
            console.error('Failed to load dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    // Calculate stats
    const totalVendors = vendors.length
    const arrivedVendors = vendors.filter(v => v.arrivalStatus === 'arrived').length
    const departedVendors = vendors.filter(v => v.arrivalStatus === 'departed').length
    const pendingVendors = vendors.filter(v => v.arrivalStatus === 'pending').length

    const photoUpdates = updates.filter(u => u.update_type === 'photo')
    const statusUpdates = updates.filter(u => u.update_type === 'status' || u.update_type === 'arrival')
    const noteUpdates = updates.filter(u => u.update_type === 'note')

    const progressPercent = totalVendors > 0 ? ((arrivedVendors + departedVendors) / totalVendors) * 100 : 0

    const getStatusIcon = (tag: string | null) => {
        switch (tag) {
            case 'arrived': return '📍'
            case 'setup_started': return '🔧'
            case 'setup_complete': return '✅'
            case 'in_progress': return '🎯'
            case 'completed': return '🏁'
            case 'issue': return '⚠️'
            case 'departed': return '👋'
            default: return '📝'
        }
    }

    const getUpdateIcon = (type: string) => {
        switch (type) {
            case 'photo': return <Camera className="w-4 h-4 text-blue-500" />
            case 'arrival': return <MapPin className="w-4 h-4 text-emerald-500" />
            case 'status': return <Zap className="w-4 h-4 text-purple-500" />
            case 'note': return <MessageSquare className="w-4 h-4 text-orange-500" />
            default: return <Send className="w-4 h-4 text-gray-500" />
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Live Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm font-medium text-green-600">LIVE</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Event Day Dashboard</h2>
                    <p className="text-gray-500">
                        {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} •{' '}
                        {event.name}
                    </p>
                </div>
                <Button variant="outline" onClick={() => {
                    setLoading(true)
                    loadDashboardData()
                    toast.success('Dashboard refreshed')
                }}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-700">{arrivedVendors}/{totalVendors}</p>
                                <p className="text-xs text-green-600">Vendors Arrived</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className={`${pendingVendors > 0 ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200' : 'bg-gray-50'}`}>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl ${pendingVendors > 0 ? 'bg-amber-100' : 'bg-gray-100'} flex items-center justify-center`}>
                                <Clock className={`w-5 h-5 ${pendingVendors > 0 ? 'text-amber-600' : 'text-gray-400'}`} />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${pendingVendors > 0 ? 'text-amber-700' : 'text-gray-700'}`}>{pendingVendors}</p>
                                <p className={`text-xs ${pendingVendors > 0 ? 'text-amber-600' : 'text-gray-500'}`}>Awaiting</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                <Camera className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-blue-700">{photoUpdates.length}</p>
                                <p className="text-xs text-blue-600">Photos</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                <Zap className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-purple-700">{progressPercent.toFixed(0)}%</p>
                                <p className="text-xs text-purple-600">Progress</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Progress Bar */}
            <Card>
                <CardContent className="py-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Vendor Arrival Progress</span>
                        <span className="text-sm text-gray-500">{arrivedVendors + departedVendors} of {totalVendors} checked in</span>
                    </div>
                    <Progress value={progressPercent} className="h-3 [&>div]:bg-gradient-to-r [&>div]:from-orange-400 [&>div]:to-amber-400" />
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Vendor Status Cards */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-500" />
                            Vendor Status ({totalVendors})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {vendors.length === 0 ? (
                            <div className="text-center py-6 text-gray-400">
                                <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>No vendors assigned to this event</p>
                            </div>
                        ) : (
                            vendors.map(vendor => (
                                <div
                                    key={vendor.vendorId}
                                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${vendor.arrivalStatus === 'arrived'
                                        ? 'bg-green-50 border-green-200'
                                        : vendor.arrivalStatus === 'departed'
                                            ? 'bg-gray-50 border-gray-200'
                                            : 'bg-amber-50 border-amber-200'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${vendor.arrivalStatus === 'arrived'
                                        ? 'bg-green-100'
                                        : vendor.arrivalStatus === 'departed'
                                            ? 'bg-gray-100'
                                            : 'bg-amber-100'
                                        }`}>
                                        {vendor.arrivalStatus === 'arrived' ? (
                                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                                        ) : vendor.arrivalStatus === 'departed' ? (
                                            <CheckCircle2 className="w-5 h-5 text-gray-500" />
                                        ) : (
                                            <Clock className="w-5 h-5 text-amber-600" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium">{vendor.vendorName}</p>
                                        <p className="text-sm text-gray-500 capitalize">{vendor.vendorCategory}</p>
                                    </div>
                                    <Badge className={
                                        vendor.arrivalStatus === 'arrived'
                                            ? 'bg-green-100 text-green-700'
                                            : vendor.arrivalStatus === 'departed'
                                                ? 'bg-gray-100 text-gray-700'
                                                : 'bg-amber-100 text-amber-700'
                                    }>
                                        {vendor.arrivalStatus === 'arrived' ? 'Arrived' :
                                            vendor.arrivalStatus === 'departed' ? 'Departed' : 'Awaiting'}
                                    </Badge>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Live Update Feed */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Zap className="w-5 h-5 text-orange-500" />
                            Live Updates
                            {updates.length > 0 && (
                                <Badge variant="outline" className="ml-auto">{updates.length}</Badge>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {updates.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>No updates yet</p>
                                <p className="text-sm">Vendor updates will appear here in real-time</p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[500px] overflow-y-auto">
                                {updates.map(update => (
                                    <div key={update.id} className="flex gap-3">
                                        {/* Timeline dot */}
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                {getUpdateIcon(update.update_type)}
                                            </div>
                                            <div className="w-0.5 flex-1 bg-gray-200 mt-1" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 pb-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-sm text-gray-900">
                                                    {update.vendor?.company_name || 'Vendor'}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(update.created_at).toLocaleTimeString('en-IN', {
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>

                                            {update.status_tag && (
                                                <Badge variant="outline" className="mb-1 text-xs">
                                                    {getStatusIcon(update.status_tag)} {update.status_tag.replace('_', ' ')}
                                                </Badge>
                                            )}

                                            {update.message && (
                                                <p className="text-sm text-gray-600">{update.message}</p>
                                            )}

                                            {update.photo_url && (
                                                <div className="mt-2 rounded-lg overflow-hidden border max-w-[300px]">
                                                    <img
                                                        src={update.photo_url}
                                                        alt={update.message || 'Vendor photo'}
                                                        className="w-full h-auto object-cover"
                                                        onError={(e) => {
                                                            // If image fails to load, show placeholder
                                                            const target = e.target as HTMLImageElement
                                                            target.style.display = 'none'
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Issues Alert */}
            {updates.filter(u => u.status_tag === 'issue').length > 0 && (
                <Card className="border-red-300 bg-red-50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-red-700 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Issues Reported
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {updates.filter(u => u.status_tag === 'issue').map(issue => (
                            <div key={issue.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-red-200">
                                <div className="flex-1">
                                    <p className="font-medium">{issue.vendor?.company_name || 'Vendor'}</p>
                                    <p className="text-sm text-red-600">{issue.message}</p>
                                </div>
                                <span className="text-xs text-gray-400">
                                    {new Date(issue.created_at).toLocaleTimeString('en-IN', {
                                        hour: '2-digit', minute: '2-digit'
                                    })}
                                </span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
