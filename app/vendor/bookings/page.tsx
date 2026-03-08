'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
    ArrowLeft, Calendar, MapPin, Users, IndianRupee, Check, X,
    Eye, MessageCircle, Search, Clock, RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
    getVendorBookingRequests,
    acceptBookingRequest,
    declineBookingRequest
} from '@/lib/actions/vendor-actions'

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
    clientName?: string
    plannerName?: string
    notes?: string
}

const STATUS_OPTIONS = ['all', 'pending', 'accepted', 'declined']

export default function VendorBookingsPage() {
    const [bookings, setBookings] = useState<BookingRequest[]>([])
    const [filter, setFilter] = useState('all')
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)

    // Load bookings from database
    useEffect(() => {
        loadBookings()
    }, [])

    const loadBookings = async () => {
        setLoading(true)
        try {
            const requests = await getVendorBookingRequests()
            setBookings(requests as any || [])
        } catch (error) {
            console.error('Failed to load bookings:', error)
            toast.error('Failed to load bookings')
        } finally {
            setLoading(false)
        }
    }

    const handleAccept = async (id: string) => {
        const result = await acceptBookingRequest(id)
        if (result.success) {
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'accepted' as const } : b))
            toast.success('Booking accepted! Planner has been notified.')
        } else {
            toast.error(result.error || 'Failed to accept booking')
        }
    }

    const handleDecline = async (id: string) => {
        const result = await declineBookingRequest(id)
        if (result.success) {
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'declined' as const } : b))
            toast.info('Booking declined')
        } else {
            toast.error(result.error || 'Failed to decline booking')
        }
    }

    const handleRefresh = async () => {
        await loadBookings()
        toast.success('Bookings refreshed')
    }

    const filteredBookings = bookings.filter(b => {
        if (filter !== 'all' && b.status !== filter) return false
        if (search && !b.eventName.toLowerCase().includes(search.toLowerCase())) return false
        return true
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-amber-100 text-amber-700'
            case 'accepted': return 'bg-green-100 text-green-700'
            case 'declined': return 'bg-red-100 text-red-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    const counts = {
        all: bookings.length,
        pending: bookings.filter(b => b.status === 'pending' || b.status === 'draft' || b.status === 'quote_requested').length,
        accepted: bookings.filter(b => b.status === 'accepted').length,
        declined: bookings.filter(b => b.status === 'declined').length,
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/vendor">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Booking Requests</h2>
                        <p className="text-gray-500">Manage your event bookings</p>
                    </div>
                </div>
                <Button variant="outline" onClick={handleRefresh}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <Card className="cursor-pointer hover:shadow-md" onClick={() => setFilter('all')}>
                    <CardContent className="pt-4 text-center">
                        <p className="text-3xl font-bold">{counts.all}</p>
                        <p className="text-sm text-gray-500">Total</p>
                    </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md border-amber-200" onClick={() => setFilter('pending')}>
                    <CardContent className="pt-4 text-center">
                        <p className="text-3xl font-bold text-amber-600">{counts.pending}</p>
                        <p className="text-sm text-amber-600">Pending</p>
                    </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md border-green-200" onClick={() => setFilter('accepted')}>
                    <CardContent className="pt-4 text-center">
                        <p className="text-3xl font-bold text-green-600">{counts.accepted}</p>
                        <p className="text-sm text-green-600">Accepted</p>
                    </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md border-red-200" onClick={() => setFilter('declined')}>
                    <CardContent className="pt-4 text-center">
                        <p className="text-3xl font-bold text-red-600">{counts.declined}</p>
                        <p className="text-sm text-red-600">Declined</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filter */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search events..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2">
                    {STATUS_OPTIONS.map(status => (
                        <Button
                            key={status}
                            variant={filter === status ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilter(status)}
                            className="capitalize"
                        >
                            {status}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Bookings List */}
            <div className="space-y-4">
                {filteredBookings.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-gray-500">No bookings found</p>
                            <p className="text-sm text-gray-400 mt-1">
                                Requests sent by planners will appear here
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredBookings.map(booking => (
                        <Card key={booking.id} className="hover:shadow-md transition-all">
                            <CardContent className="py-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold text-lg text-gray-900">{booking.eventName}</h3>
                                            <Badge className={getStatusColor(booking.status)}>
                                                {booking.status}
                                            </Badge>
                                        </div>

                                        <div className="grid md:grid-cols-4 gap-3 text-sm mb-3">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Calendar className="w-4 h-4" />
                                                {booking.eventDate}
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <MapPin className="w-4 h-4" />
                                                {booking.venue}, {booking.city}
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Users className="w-4 h-4" />
                                                {booking.guestCount} guests
                                            </div>
                                            <div className="flex items-center gap-2 text-green-600 font-semibold">
                                                <IndianRupee className="w-4 h-4" />
                                                ₹{(booking.budget / 1000).toFixed(0)}K
                                            </div>
                                        </div>

                                        <div className="text-sm text-gray-600 mb-2">
                                            <span className="text-gray-400">Client:</span> {booking.clientName} •
                                            <span className="text-gray-400 ml-2">Planner:</span> {booking.plannerName}
                                        </div>

                                        <div className="text-sm text-gray-600 mb-2">
                                            <span className="text-gray-400">Service:</span> {booking.service}
                                        </div>

                                        {booking.notes && (
                                            <p className="text-sm text-gray-500 bg-gray-50 p-2 rounded mt-2">
                                                {booking.notes}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                                            <Clock className="w-3 h-3" />
                                            Requested on {booking.createdAt}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2 ml-4">
                                        {(booking.status === 'pending' || booking.status === 'draft' || booking.status === 'quote_requested') && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700"
                                                    onClick={() => handleAccept(booking.id)}
                                                >
                                                    <Check className="w-4 h-4 mr-1" /> Accept
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600 hover:bg-red-50"
                                                    onClick={() => handleDecline(booking.id)}
                                                >
                                                    <X className="w-4 h-4 mr-1" /> Decline
                                                </Button>

                                            </>
                                        )}

                                        <Link href={`/vendor/bookings/${booking.id}`}>
                                            <Button variant="outline" size="sm" className="w-full">
                                                <Eye className="w-4 h-4 mr-1" /> Details
                                            </Button>
                                        </Link>
                                        <Link href="/vendor/messages">
                                            <Button variant="outline" size="sm" className="w-full">
                                                <MessageCircle className="w-4 h-4 mr-1" /> Message
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
