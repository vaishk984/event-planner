'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    ChevronLeft, ChevronRight, Calendar as CalendarIcon,
    MapPin, Clock, Plus, X, Lock, Unlock, AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { setVendorAvailability, clearVendorAvailability } from '@/lib/actions/vendor-actions'
import type { VendorAvailability } from '@/types/domain'
import type { BookingRequest } from '@/lib/repositories/supabase-booking-repository'

export interface CalendarEvent {
    id: string
    date: string
    title: string
    venue: string
    time: string
    status: string
}

interface VendorCalendarClientProps {
    initialEvents: CalendarEvent[]
    initialAvailability: VendorAvailability[]
    bookings: BookingRequest[]
}

export function VendorCalendarClient({ initialEvents, initialAvailability, bookings }: VendorCalendarClientProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [events] = useState<CalendarEvent[]>(initialEvents)
    const [availability, setAvailability] = useState<VendorAvailability[]>(initialAvailability)
    const [loadingDate, setLoadingDate] = useState<string | null>(null)

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const daysInMonth = lastDay.getDate()
        const startingDay = firstDay.getDay()

        return { daysInMonth, startingDay }
    }

    const { daysInMonth, startingDay } = getDaysInMonth(currentMonth)

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
    }

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
    }

    const formatDateKey = (day: number) => {
        const month = String(currentMonth.getMonth() + 1).padStart(2, '0')
        const dayStr = String(day).padStart(2, '0')
        return `${currentMonth.getFullYear()}-${month}-${dayStr}`
    }

    const getEventForDate = (day: number) => {
        const dateKey = formatDateKey(day)
        return events.find(e => e.date === dateKey)
    }

    const getAvailabilityForDate = (day: number) => {
        const dateKey = formatDateKey(day)
        return availability.find(a => a.date === dateKey)
    }

    const handleDateClick = async (day: number) => {
        const dateKey = formatDateKey(day)
        const existingEvent = getEventForDate(day)

        // Prevent modifying days with actual booking events
        if (existingEvent) {
            toast.info('This date has a booking request.')
            return
        }

        const existingAvailability = getAvailabilityForDate(day)
        setLoadingDate(dateKey)

        try {
            if (existingAvailability?.status === 'busy') {
                // Unblock (Busy -> Available)
                const result = await clearVendorAvailability(dateKey)
                if (result.success) {
                    setAvailability(prev => prev.filter(a => a.date !== dateKey))
                    toast.success('Date marked as available')
                } else {
                    toast.error('Failed to update availability')
                }
            } else {
                // Block (Available -> Busy)
                // Note: We could add 'tentative' toggle here if needed
                const result = await setVendorAvailability(dateKey, 'busy')
                if (result.success && result.data) {
                    setAvailability(prev => [...prev.filter(a => a.date !== dateKey), result.data!])
                    toast.success('Date marked as busy')
                } else {
                    toast.error('Failed to block date')
                }
            }
        } catch (error) {
            toast.error('An error occurred')
        } finally {
            setLoadingDate(null)
        }
    }

    const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

    // Get upcoming events from the bookings prop to avoid duplicates
    // Filter for future events and sort by date
    const upcomingBookings = bookings
        .filter(b => {
            // Check if event is in the future (compare end date if available, else start date)
            const endDate = new Date(b.eventEndDate || b.eventDate)
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            return endDate >= today
        })
        .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
        .slice(0, 5)

    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed':
            case 'accepted':
            case 'completed':
                return 'bg-green-100 text-green-700 border-green-200'
            case 'pending':
            case 'quoted':
                return 'bg-amber-100 text-amber-700 border-amber-200'
            case 'cancelled':
            case 'declined':
                return 'bg-red-100 text-red-700 border-red-200'
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Calendar</h2>
                    <p className="text-gray-500">Manage your availability. Click date to toggle blocked status.</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Calendar */}
                <Card className="lg:col-span-2 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <CardTitle className="text-xl">{monthName}</CardTitle>
                        <div className="flex gap-2">
                            <Button variant="outline" size="icon" onClick={prevMonth}>
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={nextMonth}>
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Day Headers */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2 uppercase tracking-wide">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {/* Empty cells for days before month starts */}
                            {Array.from({ length: startingDay }).map((_, i) => (
                                <div key={`empty-${i}`} className="aspect-square" />
                            ))}

                            {/* Days of the month */}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1
                                const event = getEventForDate(day)
                                const availabilityItem = getAvailabilityForDate(day)
                                const isBusy = availabilityItem?.status === 'busy'
                                const isTentative = availabilityItem?.status === 'tentative'
                                const dateKey = formatDateKey(day)
                                const isLoading = loadingDate === dateKey
                                const isPast = new Date(dateKey) < new Date(new Date().setHours(0, 0, 0, 0))

                                return (
                                    <div
                                        key={day}
                                        onClick={() => !isLoading && !isPast && handleDateClick(day)}
                                        className={`
                                            aspect-square border rounded-lg p-1 text-sm relative group
                                            transition-all duration-200
                                            ${isLoading ? 'opacity-50 cursor-wait' : isPast ? 'opacity-60 cursor-not-allowed bg-gray-50' : 'cursor-pointer hover:shadow-md hover:border-gray-300'}
                                            ${event ? 'bg-blue-50 border-blue-200 hover:border-blue-300' : ''}
                                            ${isBusy && !event ? 'bg-red-50 border-red-200 hover:bg-red-100' : ''}
                                            ${isTentative && !event ? 'bg-amber-50 border-amber-200' : ''}
                                            ${!event && !isBusy && !isTentative && !isPast ? 'hover:bg-gray-50' : ''}
                                        `}
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className={`font-medium ${isToday(dateKey) ? 'bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center -ml-1 -mt-1 shadow-sm' : 'text-gray-700'}`}>
                                                {day}
                                            </span>
                                            {isBusy && !event && <Lock className="w-3 h-3 text-red-400" />}
                                        </div>

                                        {event && (
                                            <div className={`
                                                mt-1 text-[10px] leading-tight px-1 py-0.5 rounded border
                                                ${getStatusStyle(event.status)}
                                            `}>
                                                <div className="font-medium truncate">{event.title}</div>
                                                <div className="truncate opacity-75">{event.time}</div>
                                            </div>
                                        )}

                                        {isBusy && !event && (
                                            <div className="mt-4 flex justify-center">
                                                <span className="text-[10px] font-medium text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                                                    Blocked
                                                </span>
                                            </div>
                                        )}

                                        {!event && !isBusy && !isPast && (
                                            <div className="hidden group-hover:flex absolute inset-0 items-center justify-center bg-gray-50/50 rounded-lg">
                                                <Plus className="w-4 h-4 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        {/* Legend */}
                        <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-100 border border-green-300" />
                                <span>Confirmed Event</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-amber-100 border border-amber-300" />
                                <span>Pending Request</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-100 border border-red-300" />
                                <span>Blocked / Unavailable</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                                    31
                                </div>
                                <span>Today</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Upcoming Events */}
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <CalendarIcon className="w-5 h-5 text-primary" />
                            Upcoming Events
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {upcomingBookings.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <p>No upcoming events.</p>
                            </div>
                        )}
                        {upcomingBookings.map(booking => (
                            <div key={booking.id} className="p-3 rounded-lg border hover:shadow-md transition-all bg-white group cursor-pointer">
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-semibold text-gray-900 truncate pr-2 group-hover:text-primary transition-colors">{booking.eventName}</h4>
                                    <Badge variant="outline" className={`${getStatusStyle(booking.status)} capitalize border px-2 py-0 h-6`}>
                                        {booking.status}
                                    </Badge>
                                </div>
                                <div className="space-y-1.5 text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <CalendarIcon className="w-3.5 h-3.5" />
                                        {new Date(booking.eventDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                        {booking.eventEndDate && booking.eventEndDate !== booking.eventDate && (
                                            <> - {new Date(booking.eventEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5" />
                                        All Day
                                    </div>
                                    {booking.venue && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-3.5 h-3.5" />
                                            {booking.venue}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function isToday(dateString: string) {
    const today = new Date()
    return dateString === today.toISOString().split('T')[0]
}
