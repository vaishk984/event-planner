'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Calendar, Clock, IndianRupee, TrendingUp, CheckCircle2, AlertCircle,
    Eye, Check, X, MapPin, Users, Star, ArrowRight, Bell, Settings
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
    getVendorProfile,
    getVendorDashboardStats,
    getVendorBookingRequests,
    acceptBookingRequest,
    declineBookingRequest
} from '@/lib/actions/vendor-actions'
import type { Vendor } from '@/types/domain'

interface BookingRequest {
    id: string
    eventName: string
    eventDate: string
    city: string
    venue: string
    guestCount: number
    service: string
    budget: number
    status: 'pending' | 'accepted' | 'declined' | 'completed' | 'draft' | 'quote_requested'
    createdAt: string
}

interface DashboardStats {
    pending: number
    accepted: number
    completed: number
    totalEarnings: number
    vendor: Vendor
}

export default function VendorDashboard() {
    const [vendor, setVendor] = useState<Vendor | null>(null)
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [requests, setRequests] = useState<BookingRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        setError(null)
        try {
            console.log('🔍 [VendorDashboard] Loading vendor data...')
            const [profileData, statsData, requestsData] = await Promise.all([
                getVendorProfile(),
                getVendorDashboardStats(),
                getVendorBookingRequests()
            ])
            console.log('✅ [VendorDashboard] Profile loaded:', profileData)
            console.log('📊 [VendorDashboard] Stats loaded:', statsData)
            console.log('📋 [VendorDashboard] Raw requests data:', requestsData)
            console.log('📋 [VendorDashboard] Requests count:', requestsData?.length)
            console.log('📋 [VendorDashboard] Requests statuses:', requestsData?.map((r: any) => r.status))

            setVendor(profileData)
            setStats(statsData)
            setRequests(requestsData as any || [])

            console.log('🎯 [VendorDashboard] State updated')
        } catch (error) {
            console.error('❌ [VendorDashboard] Failed to load vendor data:', error)
            setError(error instanceof Error ? error.message : 'Failed to load data')
        } finally {
            setLoading(false)
        }
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h2 className="text-red-800 font-semibold">Error Loading Dashboard</h2>
                    <p className="text-red-600 mt-2">{error}</p>
                    <Button onClick={loadData} className="mt-4">Retry</Button>
                </div>
            </div>
        )
    }

    const pendingRequests = requests.filter(r => {
        const isPending = r.status === 'pending' || r.status === 'draft' || r.status === 'quote_requested'
        console.log(`🔍 [VendorDashboard] Filtering request ${r.id}: status="${r.status}", isPending=${isPending}`)
        return isPending
    })
    console.log(`📊 [VendorDashboard] Total requests: ${requests.length}, Pending: ${pendingRequests.length}`)

    const confirmedRequests = requests.filter(r => r.status === 'accepted')

    const handleAccept = async (id: string) => {
        const result = await acceptBookingRequest(id)
        if (result.success) {
            setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'accepted' as const } : r))
            toast.success('Booking accepted! The planner has been notified.')
        } else {
            toast.error(result.error)
        }
    }

    const handleDecline = async (id: string) => {
        const result = await declineBookingRequest(id)
        if (result.success) {
            setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'declined' as const } : r))
            toast.info('Booking declined.')
        } else {
            toast.error(result.error)
        }
    }

    const formatCurrency = (amount: number) => {
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
        if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`
        return `₹${amount.toLocaleString()}`
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    // Fallback for missing data
    const displayName = vendor?.name || 'Vendor'
    const displayCategory = vendor?.category || 'Category'
    const displayRating = vendor?.rating || 0
    const totalEarnings = stats?.totalEarnings || 0

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Welcome back, {displayName}!</h2>
                    <p className="text-gray-500 flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        {displayRating} rating • {displayCategory}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2">
                        <Bell className="w-4 h-4" />
                        {pendingRequests.length > 0 && (
                            <Badge className="bg-red-500 text-white">{pendingRequests.length}</Badge>
                        )}
                    </Button>
                    <Link href="/vendor/profile">
                        <Button variant="outline" className="gap-2">
                            <Settings className="w-4 h-4" /> Settings
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-gradient-to-br from-orange-500 to-rose-500 text-white border-0">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/80">Total Earnings</CardTitle>
                        <IndianRupee className="w-5 h-5 text-white/70" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{formatCurrency(totalEarnings)}</div>
                        <div className="flex items-center gap-1 mt-2 text-sm text-white/80">
                            <TrendingUp className="w-4 h-4" />
                            <span>Lifetime earnings</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Pending Requests</CardTitle>
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-amber-600">{stats?.pending || pendingRequests.length}</div>
                        <p className="text-xs text-gray-500 mt-2">Waiting for response</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Confirmed</CardTitle>
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">
                            {stats?.accepted || confirmedRequests.length}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Upcoming events</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Completed</CardTitle>
                        <CheckCircle2 className="w-5 h-5 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats?.completed || 0}</div>
                        <p className="text-xs text-gray-500 mt-2">Successful bookings</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Booking Requests - Needs Attention */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-amber-500" />
                                    New Booking Requests
                                </CardTitle>
                                <CardDescription>Respond to these requests to confirm bookings</CardDescription>
                            </div>
                            <Link href="/vendor/bookings">
                                <Button variant="outline" size="sm">
                                    View All <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {pendingRequests.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">
                                No pending requests. You're all caught up! 🎉
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {pendingRequests.map(request => (
                                    <div
                                        key={request.id}
                                        className="border rounded-lg p-4 hover:shadow-md transition-all bg-gradient-to-r from-amber-50/50 to-white"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h4 className="font-semibold text-gray-900">{request.eventName}</h4>
                                                    <Badge variant="outline" className="text-xs">
                                                        {new Date(request.createdAt).toLocaleDateString()}
                                                    </Badge>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Calendar className="w-4 h-4" />
                                                        {request.eventDate}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <MapPin className="w-4 h-4" />
                                                        {request.city}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Users className="w-4 h-4" />
                                                        {request.guestCount} guests
                                                    </div>
                                                    <div className="flex items-center gap-2 text-green-600 font-medium">
                                                        <IndianRupee className="w-4 h-4" />
                                                        {formatCurrency(request.budget)}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-500 mt-2">
                                                    Service: <span className="font-medium text-gray-700">{request.service}</span>
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 ml-4">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDecline(request.id)}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700"
                                                    onClick={() => handleAccept(request.id)}
                                                >
                                                    <Check className="w-4 h-4 mr-1" /> Accept
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Upcoming Events */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Upcoming Events</CardTitle>
                            <Link href="/vendor/calendar">
                                <Button variant="ghost" size="sm">
                                    <Calendar className="w-4 h-4 mr-2" /> Calendar
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {confirmedRequests.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No confirmed events yet</p>
                            ) : confirmedRequests.map(event => (
                                <div
                                    key={event.id}
                                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50"
                                >
                                    <div>
                                        <p className="font-medium text-gray-900">{event.eventName}</p>
                                        <div className="flex items-center gap-3 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> {event.eventDate}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" /> {event.venue}
                                            </span>
                                        </div>
                                    </div>
                                    <Badge className="bg-green-100 text-green-700">confirmed</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Link href="/vendor/profile" className="block">
                            <Button variant="outline" className="w-full justify-start gap-3">
                                <Settings className="w-5 h-5 text-gray-500" />
                                <div className="text-left">
                                    <p className="font-medium">Update Profile</p>
                                    <p className="text-xs text-gray-500">Services, pricing, portfolio</p>
                                </div>
                            </Button>
                        </Link>
                        <Link href="/vendor/calendar" className="block">
                            <Button variant="outline" className="w-full justify-start gap-3">
                                <Calendar className="w-5 h-5 text-gray-500" />
                                <div className="text-left">
                                    <p className="font-medium">Manage Availability</p>
                                    <p className="text-xs text-gray-500">Block dates, set hours</p>
                                </div>
                            </Button>
                        </Link>
                        <Link href="/vendor/earnings" className="block">
                            <Button variant="outline" className="w-full justify-start gap-3">
                                <IndianRupee className="w-5 h-5 text-gray-500" />
                                <div className="text-left">
                                    <p className="font-medium">View Earnings</p>
                                    <p className="text-xs text-gray-500">Payments & invoices</p>
                                </div>
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
