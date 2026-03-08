
import { notFound, redirect } from 'next/navigation'
import { getBookingRequest, acceptBookingRequest, declineBookingRequest } from '@/lib/actions/vendor-actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    ArrowLeft, Calendar, MapPin, Users, IndianRupee,
    Check, X, MessageCircle, Clock, FileText, User
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export const dynamic = 'force-dynamic'

interface PageProps {
    params: Promise<{
        id: string
    }>
}

export default async function BookingDetailsPage({ params }: PageProps) {
    const { id } = await params
    const booking = await getBookingRequest(id)

    if (!booking) {
        notFound()
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-amber-100 text-amber-700'
            case 'accepted': return 'bg-green-100 text-green-700'
            case 'declined': return 'bg-red-100 text-red-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    // Server Action wrappers for buttons
    async function accept() {
        'use server'
        await acceptBookingRequest(id)
    }

    async function decline() {
        'use server'
        await declineBookingRequest(id)
    }

    return (
        <div className="space-y-6 container max-w-4xl mx-auto py-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/vendor/bookings">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{booking.eventName}</h2>
                    <div className="flex items-center gap-2 text-gray-500">
                        <span>Booking ID: #{booking.id.slice(0, 8)}</span>
                        <span>•</span>
                        <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Main Details */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Event Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-500">Date</label>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span className="font-medium">
                                            {booking.eventDate ? new Date(booking.eventDate).toLocaleDateString(undefined, {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            }) : 'Date TBD'}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-500">Time</label>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span className="font-medium">TBD</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-500">Venue</label>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <span className="font-medium">{booking.venue || 'TBD'}</span>
                                        <span className="text-gray-500 text-sm">({booking.city})</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-500">Guest Count</label>
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-gray-400" />
                                        <span className="font-medium">{booking.guestCount} guests</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Service & Pricing</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-lg">{booking.service}</p>
                                    <p className="text-sm text-gray-500">Requested Service</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-xl text-green-600 flex items-center justify-end">
                                        <IndianRupee className="w-5 h-5" />
                                        {booking.budget.toLocaleString()}
                                    </p>
                                    <p className="text-sm text-gray-500">Budget</p>
                                </div>
                            </div>

                            {booking.requirements && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                        <FileText className="w-4 h-4" /> Special Requirements
                                    </label>
                                    <p className="text-gray-700 bg-white border p-3 rounded-md">
                                        {booking.requirements}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Actions */}
                <div className="space-y-6">
                    {booking.status === 'pending' && (
                        <Card className="border-amber-200 bg-amber-50">
                            <CardHeader>
                                <CardTitle className="text-amber-800">Action Required</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <form action={accept}>
                                    <Button className="w-full bg-green-600 hover:bg-green-700">
                                        <Check className="w-4 h-4 mr-2" /> Accept Booking
                                    </Button>
                                </form>
                                <form action={decline}>
                                    <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                                        <X className="w-4 h-4 mr-2" /> Decline Request
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Planner</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                    <User className="w-5 h-5 text-gray-500" />
                                </div>
                                <div>
                                    <p className="font-medium">Planner</p>
                                    <p className="text-xs text-gray-500">Event Planner</p>
                                </div>
                            </div>

                            <Link href="/vendor/messages">
                                <Button variant="outline" className="w-full">
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    Send Message
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between text-sm text-gray-500">
                                <span>Created</span>
                                <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
