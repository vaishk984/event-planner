'use client'

import { useState } from 'react'
import { MoreHorizontal, Phone, Mail, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateBookingStatus } from '@/actions/bookings'
import { useRouter } from 'next/navigation'

// We need a type for the composite object returned by getEventBookings
interface BookingWithVendor {
    id: string
    event_id: string
    status: string
    service: string // Renamed from service_category
    quoted_amount: number | null
    agreed_amount: number | null
    vendors: {
        company_name: string
        category: string
        contact_name: string | null
        email: string | null
        phone: string | null
        location: string | null
    }
}

interface BookingsListProps {
    bookings: BookingWithVendor[]
    eventId: string
}

export function BookingsList({ bookings, eventId }: BookingsListProps) {
    const router = useRouter()
    const [updating, setUpdating] = useState<string | null>(null)

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-700'
            case 'deposit_paid': return 'bg-emerald-100 text-emerald-700'
            case 'quote_requested': return 'bg-blue-50 text-blue-700'
            case 'quote_received': return 'bg-indigo-50 text-indigo-700'
            case 'negotiating': return 'bg-amber-50 text-amber-700'
            case 'cancelled': case 'declined': return 'bg-red-50 text-red-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    async function handleStatusChange(bookingId: string, newStatus: string) {
        setUpdating(bookingId)
        const formData = new FormData()
        formData.append('id', bookingId)
        formData.append('status', newStatus)
        formData.append('eventId', eventId)

        try {
            const result = await updateBookingStatus(formData)
            if (!result.success) {
                alert('Failed to update status')
            }
        } catch (error) {
            console.error(error)
        } finally {
            setUpdating(null)
            router.refresh()
        }
    }

    if (bookings.length === 0) {
        return (
            <div className="text-center py-12 border rounded-lg bg-gray-50 border-dashed">
                <p className="text-gray-500">No vendors assigned to this event yet.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {bookings.map((booking) => (
                <div key={booking.id} className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        {/* Vendor Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg">{booking.vendors.company_name}</h3>
                                <Badge variant="outline" className="capitalize">
                                    {booking.service}
                                </Badge>
                            </div>

                            <div className="text-sm text-gray-500 space-y-1">
                                {booking.vendors.contact_name && (
                                    <p>Contact: {booking.vendors.contact_name}</p>
                                )}
                                <div className="flex gap-4 text-xs">
                                    {booking.vendors.phone && (
                                        <div className="flex items-center gap-1">
                                            <Phone className="w-3 h-3" /> {booking.vendors.phone}
                                        </div>
                                    )}
                                    {booking.vendors.email && (
                                        <div className="flex items-center gap-1">
                                            <Mail className="w-3 h-3" /> {booking.vendors.email}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Status & Actions */}
                        <div className="flex flex-col items-end gap-2 min-w-[200px]">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 font-medium">Status:</span>
                                <div className="w-[180px]">
                                    <Select
                                        value={booking.status}
                                        onValueChange={(val) => handleStatusChange(booking.id, val)}
                                        disabled={updating === booking.id}
                                    >
                                        <SelectTrigger className={`h-8 border-0 ${getStatusColor(booking.status)} focus:ring-0`}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="quote_requested">Quote Requested</SelectItem>
                                            <SelectItem value="quote_received">Quote Received</SelectItem>
                                            <SelectItem value="negotiating">Negotiating</SelectItem>
                                            <SelectItem value="confirmed">Confirmed</SelectItem>
                                            <SelectItem value="deposit_paid">Deposit Paid</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="text-right">
                                {booking.agreed_amount ? (
                                    <p className="font-bold text-lg text-green-700">₹{booking.agreed_amount.toLocaleString()}</p>
                                ) : booking.quoted_amount ? (
                                    <p className="font-semibold text-gray-700">Quote: ₹{booking.quoted_amount.toLocaleString()}</p>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">No quote yet</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
