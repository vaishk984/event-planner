'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Check, Star, IndianRupee, Calendar, Users, MapPin,
    ArrowLeft, Download, Send, Building2, UtensilsCrossed,
    Camera, Sparkles, Music, Brush, Car, Phone, Mail, Loader2, Clock
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { approveEvent, getEvent, updateEventStatus } from '@/lib/actions/event-actions'
import { getRequestsForEvent } from '@/actions/booking'
import type { Event, EventVendor } from '@/types/domain'

// Category icon mapping
const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
        venue: Building2,
        catering: UtensilsCrossed,
        photography: Camera,
        decor: Sparkles,
        entertainment: Music,
        makeup: Brush,
        transport: Car
    }
    return icons[category] || Sparkles
}

// Category name formatting
const formatCategoryName = (category: string) => {
    const names: Record<string, string> = {
        venue: 'Venue',
        catering: 'Catering',
        photography: 'Photography & Video',
        decor: 'Decor & Flowers',
        entertainment: 'Music & Entertainment',
        makeup: 'Makeup & Styling',
        mehendi: 'Mehendi Artist',
        anchor: 'Anchor / Host',
        transport: 'Guest Transport'
    }
    return names[category] || category.charAt(0).toUpperCase() + category.slice(1)
}

interface VendorCategory {
    id: string
    name: string
    icon: any
    vendor: {
        name: string
        description: string
        price: number
        rating: number
    }
    included: string[]
}

export default function ProposalPreviewPage() {
    const params = useParams()
    const eventId = params.id as string

    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [approving, setApproving] = useState(false)
    const [event, setEvent] = useState<Event | null>(null)
    const [categories, setCategories] = useState<VendorCategory[]>([])
    const [timeline, setTimeline] = useState<any[]>([])

    useEffect(() => {
        fetchData()
    }, [eventId])

    const fetchData = async () => {
        try {
            setLoading(true)
            const supabase = createClient()

            const eventData = await getEvent(eventId)
            if (!eventData) {
                setEvent(null)
                setTimeline([])
                setCategories([])
                setLoading(false)
                return
            }

            setEvent(eventData)

            // Fetch timeline items
            const { data: timelineData } = await supabase
                .from('timeline_items')
                .select('*')
                .eq('event_id', eventId)
                .order('start_time', { ascending: true })

            setTimeline(timelineData || [])

            // Fetch assigned vendors (from booking requests)
            const bookingRequests = await getRequestsForEvent(eventId)
            console.log('[ProposalPreview] eventId:', eventId)
            console.log('[ProposalPreview] bookingRequests:', bookingRequests)

            // Group vendors by category
            const vendorsByCategory: VendorCategory[] = bookingRequests
                .filter(req => req.status !== 'declined')
                .map((req: any) => {
                    const isCatering = req.vendorCategory === 'catering' || req.vendorCategory?.includes('food')
                    const unitPrice = req.quotedAmount || req.vendorPrice || 0
                    const guestCount = eventData.guestCount || 350
                    const totalPrice = isCatering ? unitPrice * guestCount : unitPrice

                    return {
                        id: req.vendorCategory || 'other',
                        name: formatCategoryName(req.vendorCategory || 'other'),
                        icon: getCategoryIcon(req.vendorCategory || 'other'),
                        vendor: {
                            name: req.vendorName || 'Unknown Vendor',
                            description: req.vendorDescription || `Professional ${formatCategoryName(req.vendorCategory || '')} service`,
                            price: totalPrice,
                            rating: req.vendorRating || 0
                        },
                        included: req.requirements ? [req.requirements] : []
                    }
                })

            console.log('[ProposalPreview] vendorsByCategory:', vendorsByCategory)
            setCategories(vendorsByCategory)
        } catch (error) {
            console.error('Failed to load proposal data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async () => {
        try {
            setApproving(true)

            const proposedResult = await updateEventStatus(eventId, 'proposed')
            if (!proposedResult.success) {
                alert(`Failed to prepare proposal approval: ${proposedResult.error}`)
                return
            }

            // Now approve the event
            const result = await approveEvent(eventId)

            if (result.success) {
                // Redirect to event page
                router.push(`/planner/events/${eventId}`)
            } else {
                alert(`Failed to approve proposal: ${result.error}`)
            }
        } catch (error) {
            console.error('Error approving proposal:', error)
            alert('An unexpected error occurred')
        } finally {
            setApproving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        )
    }

    const totalAmount = categories.reduce((sum, cat) => sum + cat.vendor.price, 0)
    const platformFee = Math.round(totalAmount * 0.02)
    const grandTotal = totalAmount + platformFee

    const validUntil = new Date()
    validUntil.setDate(validUntil.getDate() + 14)
    const validUntilStr = validUntil.toISOString().split('T')[0]

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-rose-50">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
                <div className="max-w-5xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href={`/planner/events/${eventId}/proposal`}>
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                                </Button>
                            </Link>
                            <div>
                                <h1 className="font-bold text-gray-900">{event?.name || 'Event'}</h1>
                                <p className="text-sm text-gray-500">Proposal • Valid until {validUntilStr}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge className="bg-blue-100 text-blue-700">Preview Mode</Badge>
                            <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-2" /> PDF
                            </Button>
                            <Button size="sm" className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600">
                                <Send className="w-4 h-4 mr-2" /> Send to Client
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 text-white">
                <div className="max-w-5xl mx-auto px-6 py-16 text-center">
                    <p className="text-white/70 uppercase tracking-wider text-sm mb-2">Event Proposal</p>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">{event?.name || 'Your Special Day'}</h1>
                    <div className="flex items-center justify-center gap-8 text-white/90">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            <span>{event?.date || 'Date TBD'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            <span>{event?.guestCount || 350} Guests</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            <span>{event?.city || 'City'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-6 py-12">

                {/* Planner Note */}
                <Card className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                    <CardContent className="py-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                <Sparkles className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="font-medium text-amber-800 mb-1">A Note from Your Planner</p>
                                <p className="text-amber-700">
                                    We have carefully curated this proposal based on your requirements.
                                    Each vendor has been personally vetted and matches your style preferences.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Category Sections */}
                {categories.length === 0 ? (
                    <Card className="p-12 text-center">
                        <p className="text-gray-500">No vendors assigned to this event yet.</p>
                        <Link href={`/planner/events/${eventId}/design`}>
                            <Button className="mt-4">Add Vendors</Button>
                        </Link>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {categories.map((category, index) => {
                            const Icon = category.icon
                            return (
                                <Card key={category.id + index} className="overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="flex">
                                        {/* Left - Category Icon */}
                                        <div className="w-16 bg-gradient-to-b from-orange-500 to-rose-500 flex items-center justify-center">
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>

                                        {/* Main Content */}
                                        <div className="flex-1 p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900">{category.name}</h3>
                                                    <p className="text-xl font-semibold text-orange-600">{category.vendor.name}</p>
                                                    <p className="text-gray-500 text-sm mt-1">{category.vendor.description}</p>
                                                    {category.vendor.rating > 0 && (
                                                        <div className="flex items-center gap-1 mt-2">
                                                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                                            <span className="text-sm font-medium">{category.vendor.rating}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-gray-900">
                                                        ₹{(category.vendor.price / 100000).toFixed(2)}L
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Included Items */}
                                            {category.included.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {category.included.map((item, i) => (
                                                        <span key={i} className="inline-flex items-center gap-1 text-sm bg-green-50 text-green-700 px-3 py-1 rounded-full">
                                                            <Check className="w-3 h-3" /> {item}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                )}

                {/* Event Timeline / Runsheet */}
                <h2 className="text-xl font-bold text-gray-900 mt-12 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    Event Schedule
                </h2>
                <Card className="mb-8 overflow-hidden">
                    <CardContent className="p-0">
                        <div className="relative">
                            {timeline.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    No schedule created yet. It will be added to the final proposal.
                                </div>
                            ) : (
                                timeline.map((item: any) => (
                                    <div key={item.id} className="flex border-b last:border-b-0">
                                        <div className="w-24 flex-shrink-0 p-4 bg-gray-50 flex flex-col items-center justify-center border-r">
                                            <span className="text-lg font-bold text-gray-900">{item.start_time?.substring(0, 5) || 'TBD'}</span>
                                            {item.duration && (
                                                <span className="text-xs text-gray-500">{item.duration} mins</span>
                                            )}
                                        </div>
                                        <div className="flex-1 p-4">
                                            <h4 className="font-semibold text-gray-900">{item.title}</h4>
                                            {item.description && (
                                                <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Total Section */}
                {categories.length > 0 && (
                    <Card className="mt-8 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                        <CardContent className="py-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Total Investment</p>
                                    <p className="text-4xl font-bold">₹{(grandTotal / 100000).toFixed(2)}L</p>
                                    <p className="text-gray-400 text-sm mt-2">
                                        Subtotal: ₹{(totalAmount / 100000).toFixed(2)}L + Platform Fee: ₹{(platformFee / 1000).toFixed(0)}K
                                    </p>
                                </div>
                                <Button
                                    size="lg"
                                    className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-lg px-8"
                                    onClick={handleApprove}
                                    disabled={approving}
                                >
                                    {approving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Approving...
                                        </>
                                    ) : (
                                        'Approve Proposal'
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Contact Section */}
                <div className="mt-12 text-center">
                    <p className="text-gray-500 mb-4">Questions about this proposal?</p>
                    <div className="flex items-center justify-center gap-4">
                        <Button variant="outline" className="gap-2">
                            <Phone className="w-4 h-4" /> Call Planner
                        </Button>
                        <Button variant="outline" className="gap-2">
                            <Mail className="w-4 h-4" /> Send Message
                        </Button>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center text-sm text-gray-400">
                    <p>This proposal is valid until {validUntilStr}</p>
                    <p className="mt-1">Prices subject to change after validity period</p>
                </div>
            </div>
        </div>
    )
}
