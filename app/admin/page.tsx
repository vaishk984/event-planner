'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
    Users, Building2, Calendar, TrendingUp,
    DollarSign, ArrowUpRight, Clock,
    CheckCircle2, AlertTriangle, Eye, Shield
} from 'lucide-react'
import {
    getPlatformStats,
    getPendingVendors,
    getRecentActivity,
    verifyVendor
} from '@/lib/actions/admin-actions'
import { toast } from 'sonner'

interface PlatformStats {
    totalPlanners: number
    totalVendors: number
    totalEvents: number
    totalBookings: number
    pendingVerifications: number
    revenueThisMonth: number
}

interface VendorOverview {
    id: string
    name: string
    email: string
    category: string
    city: string
    isVerified: boolean
    createdAt: string
}

interface Activity {
    type: string
    description: string
    timestamp: string
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<PlatformStats | null>(null)
    const [pendingVendors, setPendingVendors] = useState<VendorOverview[]>([])
    const [recentActivity, setRecentActivity] = useState<Activity[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            const [statsData, vendorsData, activityData] = await Promise.all([
                getPlatformStats(),
                getPendingVendors(),
                getRecentActivity()
            ])
            setStats(statsData)
            setPendingVendors(vendorsData || [])
            setRecentActivity(activityData || [])
        } catch (error) {
            console.error('Failed to load admin data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyVendor = async (vendorId: string) => {
        const result = await verifyVendor(vendorId)
        if (result.success) {
            toast.success('Vendor verified successfully')
            loadData() // Refresh data
        } else {
            toast.error(result.error)
        }
    }

    const formatCurrency = (amount: number) => {
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
        return `₹${amount.toLocaleString()}`
    }

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const hours = Math.floor(diff / (1000 * 60 * 60))
        if (hours < 1) return 'Just now'
        if (hours < 24) return `${hours}h ago`
        return `${Math.floor(hours / 24)}d ago`
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Loading admin dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-500">Platform overview and management</p>
                </div>
                <Badge className="bg-green-100 text-green-700">
                    <Shield className="w-3 h-3 mr-1" /> Admin Access
                </Badge>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-600 font-medium">Total Planners</p>
                                <p className="text-3xl font-bold text-blue-700 mt-1">{stats?.totalPlanners || 0}</p>
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
                                <Users className="w-7 h-7 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-600 font-medium">Total Vendors</p>
                                <p className="text-3xl font-bold text-purple-700 mt-1">{stats?.totalVendors || 0}</p>
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center">
                                <Building2 className="w-7 h-7 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-orange-600 font-medium">Active Events</p>
                                <p className="text-3xl font-bold text-orange-700 mt-1">{stats?.totalEvents || 0}</p>
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center">
                                <Calendar className="w-7 h-7 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-600 font-medium">Total Bookings</p>
                                <p className="text-3xl font-bold text-green-700 mt-1">{stats?.totalBookings || 0}</p>
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center">
                                <TrendingUp className="w-7 h-7 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Pending Verifications */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                                Pending Verifications
                            </CardTitle>
                            <Link href="/admin/vendors">
                                <Button variant="ghost" size="sm">View All</Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {pendingVendors.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No pending verifications</p>
                        ) : (
                            pendingVendors.slice(0, 5).map(vendor => (
                                <div
                                    key={vendor.id}
                                    className="flex items-center gap-4 p-3 rounded-lg bg-amber-50 border border-amber-200"
                                >
                                    <div className="flex-1">
                                        <p className="font-medium">{vendor.name}</p>
                                        <p className="text-sm text-gray-500">{vendor.category} • {vendor.city}</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700"
                                        onClick={() => handleVerifyVendor(vendor.id)}
                                    >
                                        <CheckCircle2 className="w-4 h-4 mr-1" />
                                        Verify
                                    </Button>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Recent Activity</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {recentActivity.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No recent activity</p>
                        ) : (
                            recentActivity.map((activity, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.type === 'event' ? 'bg-orange-100' : 'bg-purple-100'
                                        }`}>
                                        {activity.type === 'event' ? (
                                            <Calendar className="w-5 h-5 text-orange-600" />
                                        ) : (
                                            <Building2 className="w-5 h-5 text-purple-600" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{activity.description}</p>
                                        <p className="text-xs text-gray-400">{formatTime(activity.timestamp)}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-4 gap-4">
                        <Link href="/admin/vendors">
                            <Button variant="outline" className="h-20 flex-col gap-2 w-full">
                                <CheckCircle2 className="w-6 h-6 text-green-500" />
                                <span>Verify Vendors</span>
                                {stats?.pendingVerifications ? (
                                    <Badge className="bg-amber-100 text-amber-700">{stats.pendingVerifications} pending</Badge>
                                ) : null}
                            </Button>
                        </Link>
                        <Link href="/admin/planners">
                            <Button variant="outline" className="h-20 flex-col gap-2 w-full">
                                <Users className="w-6 h-6 text-blue-500" />
                                <span>Manage Planners</span>
                            </Button>
                        </Link>
                        <Button variant="outline" className="h-20 flex-col gap-2">
                            <DollarSign className="w-6 h-6 text-green-500" />
                            <span>View Revenue</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex-col gap-2">
                            <Eye className="w-6 h-6 text-purple-500" />
                            <span>Analytics</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
