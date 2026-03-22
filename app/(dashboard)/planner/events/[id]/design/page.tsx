'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
    Calendar, MapPin, Palette, UtensilsCrossed, Music, Users,
    IndianRupee, Check, Plus, X, Upload,
    Store, FileText, Send, ArrowLeft, Trash2, CheckCircle2, Loader2
} from 'lucide-react'
import Link from 'next/link'
import { getEventVendors, removeVendorFromEvent } from '@/lib/actions/event-vendor-actions'
import type { Event } from '@/types/domain'
import { getEvent, updateEvent, approveEvent } from '@/lib/actions/event-actions'

interface SelectedVendor {
    id: string
    name: string
    category: string
    service: string
    cost: number
    imageUrl?: string
}

export default function EventDesignPage() {
    const params = useParams()
    const router = useRouter()
    const eventId = params.id as string

    const [event, setEvent] = useState<Event | null>(null)
    const [selectedVendors, setSelectedVendors] = useState<SelectedVendor[]>([])
    const [designNotes, setDesignNotes] = useState('')
    const [loading, setLoading] = useState(true)
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Load event and vendors from database
    useEffect(() => {
        const loadEventData = async () => {
            setLoading(true)
            try {
                const loadedEvent = await getEvent(eventId)
                if (!loadedEvent) {
                    setLoading(false)
                    return
                }

                setEvent(loadedEvent)

                // Fetch vendors assigned to this event
                const eventVendors = await getEventVendors(eventId)

                const vendors: SelectedVendor[] = eventVendors.map(ev => {
                    const isCatering = ev.vendorCategory === 'catering'
                    const rawCost = ev.agreedAmount || 0
                    return {
                        id: ev.vendorId,
                        name: ev.vendorName || 'Unknown Vendor',
                        category: ev.vendorCategory || 'other',
                        service: ev.vendorName || '',
                        cost: isCatering && loadedEvent.guestCount > 0
                            ? rawCost * loadedEvent.guestCount
                            : rawCost,
                        imageUrl: undefined
                    }
                })

                setSelectedVendors(vendors)
            } catch (error) {
                console.error('Failed to load event data:', error)
            } finally {
                setLoading(false)
            }
        }

        loadEventData()
    }, [eventId])

    // Update notes
    const handleNotesChange = (notes: string) => {
        setDesignNotes(notes)
        // Debounce save to prevent excessive API calls
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
        saveTimeoutRef.current = setTimeout(async () => {
            try {
                await updateEvent(eventId, { notes })
            } catch (err) {
                console.error('Failed to save design notes:', err)
            }
        }, 1000)
    }

    // Handle remove vendor
    const handleRemoveVendor = async (vendorId: string) => {
        try {
            const result = await removeVendorFromEvent(eventId, vendorId)

            if (result.success) {
                // Update local state on success
                setSelectedVendors(prev => prev.filter(v => v.id !== vendorId))
            } else {
                alert(`Failed to remove vendor: ${result.error}`)
            }
        } catch (error) {
            console.error('Error removing vendor:', error)
            alert('An unexpected error occurred')
        }
    }

    // Handle send proposal
    const handleSendProposal = () => {
        router.push(`/planner/events/${eventId}/proposal`)
    }

    // Handle generate proposal
    const handleGenerateProposal = () => {
        router.push(`/planner/events/${eventId}/proposal`)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        )
    }

    if (!event) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Store className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-gray-500">Event not found</p>
                <Link href="/planner/events">
                    <Button variant="outline" className="mt-4 gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back to Events
                    </Button>
                </Link>
            </div>
        )
    }

    const totalCost = selectedVendors.reduce((sum, v) => sum + v.cost, 0)
    const budget = event.budgetMax || 3000000
    const budgetUtilization = Math.round((totalCost / budget) * 100)
    const proposalLocked = event.status === 'approved'

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <Link href="/planner/events" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-1">
                        <ArrowLeft className="w-3 h-3" /> Back to Events
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>
                    <p className="text-gray-500">Event Design Dashboard</p>
                </div>
                <div className="flex gap-2">
                    <Badge
                        variant={proposalLocked ? 'default' : 'secondary'}
                        className="px-3 py-1"
                    >
                        {proposalLocked ? '🔒 Approved' :
                            event.proposalStatus === 'sent' ? '📤 Proposal Sent' :
                                '🎨 Designing'}
                    </Badge>
                    <Button
                        className="gap-2 bg-green-600 hover:bg-green-700"
                        disabled={selectedVendors.length === 0 || proposalLocked}
                        onClick={handleGenerateProposal}
                    >
                        <FileText className="w-4 h-4" /> Generate Proposal
                    </Button>
                    {!proposalLocked && (
                        <Button
                            className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                            disabled={selectedVendors.length === 0}
                            onClick={async () => {
                                if (confirm('Are you sure you want to approve this event? This will lock the proposal.')) {
                                    try {
                                        const result = await approveEvent(eventId)
                                        if (result.success) {
                                            setEvent(prev => prev ? { ...prev, status: 'approved' } : prev)
                                        } else {
                                            alert(`Failed to approve event: ${result.error}`)
                                        }
                                    } catch (err) {
                                        console.error('Error approving event:', err)
                                        alert('An unexpected error occurred while approving the event.')
                                    }
                                }
                            }}
                        >
                            <Check className="w-4 h-4" /> Mark as Approved
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Left Column - Client Requirements */}
                <div className="space-y-4">
                    <Card className="p-4 bg-gray-50">
                        <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <Users className="w-4 h-4" /> Client Requirements
                        </h2>

                        {/* Event Basics */}
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span>{new Date(event.date).toLocaleDateString('en-IN')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span>{event.guestCount} guests</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <IndianRupee className="w-4 h-4 text-gray-400" />
                                <span>Budget: ₹{(budget / 100000).toFixed(1)}L</span>
                            </div>
                        </div>

                        <hr className="my-3" />

                        {/* Venue */}
                        <div className="mb-3">
                            <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Venue</h4>
                            <p className="text-sm capitalize">
                                {event.venueType} in {event.city}
                            </p>
                            {event.venueName && (
                                <p className="text-xs text-gray-500">{event.venueName}</p>
                            )}
                        </div>

                        {/* Event Type */}
                        <div className="mb-3">
                            <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Event Type</h4>
                            <p className="text-sm capitalize">
                                {event.type.replace('_', ' ')}
                            </p>
                        </div>

                        {/* Special Notes */}
                        {event.notes && (
                            <div className="p-2 bg-amber-50 rounded text-xs text-amber-800 italic">
                                "{event.notes}"
                            </div>
                        )}
                    </Card>
                </div>

                {/* Middle Column - Selected Vendors */}
                <div className="space-y-4">
                    <Card className="p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-semibold text-gray-700 flex items-center gap-2">
                                <Check className="w-4 h-4" /> Selected Vendors ({selectedVendors.length})
                            </h2>
                            <Link href={`/showroom?eventId=${eventId}`}>
                                <Button size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                                    <Store className="w-4 h-4" /> Add from Showroom
                                </Button>
                            </Link>
                        </div>

                        {selectedVendors.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                <Store className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>No vendors selected yet</p>
                                <p className="text-sm">Browse the Showroom to add vendors</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {selectedVendors.map((vendor) => (
                                    <div key={vendor.id} className="p-3 border rounded-lg flex justify-between items-center group">
                                        <div>
                                            <div className="font-medium text-sm">{vendor.name}</div>
                                            <div className="text-xs text-gray-500">{vendor.category} • {vendor.service}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-right">
                                                <div className="font-medium text-sm text-green-600">
                                                    ₹{(vendor.cost / 1000).toFixed(0)}K
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 h-8 w-8"
                                                onClick={() => handleRemoveVendor(vendor.id)}
                                                disabled={proposalLocked}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Quick Add Categories */}
                        <div className="grid grid-cols-3 gap-2 mt-4">
                            {['venue', 'catering', 'decor', 'photography', 'entertainment'].map((cat) => {
                                const hasVendor = selectedVendors.some(v =>
                                    v.category.toLowerCase() === cat
                                )
                                return (
                                    <Link key={cat} href={`/showroom?category=${cat}&eventId=${eventId}`}>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={`w-full text-xs gap-1 capitalize ${hasVendor ? 'border-green-500 text-green-600' : ''}`}
                                        >
                                            {hasVendor ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                            {cat}
                                        </Button>
                                    </Link>
                                )
                            })}
                        </div>
                    </Card>

                    {/* Design Notes */}
                    <Card className="p-4">
                        <h3 className="font-semibold text-gray-700 mb-2">Design Notes</h3>
                        <Textarea
                            placeholder="Add your design notes, ideas, and decisions here..."
                            value={designNotes}
                            onChange={(e) => handleNotesChange(e.target.value)}
                            rows={4}
                            className="resize-none"
                            disabled={proposalLocked}
                        />
                    </Card>
                </div>

                {/* Right Column - Budget & Actions */}
                <div className="space-y-4">
                    {/* Budget Tracker */}
                    <Card className="p-4">
                        <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <IndianRupee className="w-4 h-4" /> Budget Tracker
                        </h2>

                        {/* Progress Bar */}
                        <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden mb-2">
                            <div
                                className={`h-full transition-all ${budgetUtilization > 100 ? 'bg-red-500' :
                                    budgetUtilization > 80 ? 'bg-amber-500' : 'bg-green-500'
                                    }`}
                                style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
                            />
                        </div>

                        <div className="flex justify-between text-sm mb-4">
                            <span>₹{(totalCost / 100000).toFixed(1)}L used</span>
                            <span className={budgetUtilization > 100 ? 'text-red-600 font-medium' : ''}>
                                {budgetUtilization}% of ₹{(budget / 100000).toFixed(1)}L
                            </span>
                        </div>

                        {/* Cost Breakdown */}
                        <div className="space-y-2 text-sm">
                            {selectedVendors.map((v) => (
                                <div key={v.id} className="flex justify-between">
                                    <span className="text-gray-600 capitalize">{v.category}</span>
                                    <span>₹{(v.cost / 1000).toFixed(0)}K</span>
                                </div>
                            ))}
                            {selectedVendors.length > 0 && (
                                <>
                                    <hr className="my-2" />
                                    <div className="flex justify-between font-medium">
                                        <span>Subtotal</span>
                                        <span>₹{(totalCost / 100000).toFixed(1)}L</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500">
                                        <span>Platform Fee (2%)</span>
                                        <span>₹{(totalCost * 0.02 / 1000).toFixed(0)}K</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span className="text-green-600">₹{((totalCost * 1.02) / 100000).toFixed(2)}L</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </Card>

                    {/* Mood Board */}
                    <Card className="p-4">
                        <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Palette className="w-4 h-4" /> Mood Board
                        </h3>
                        <div className="border-2 border-dashed rounded-lg p-4 text-center text-gray-400">
                            <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Drag images here or click to upload</p>
                            <Button variant="outline" size="sm" className="mt-2">
                                Upload Images
                            </Button>
                        </div>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
                        <h3 className="font-semibold text-indigo-700 mb-3">Ready to Share?</h3>
                        <div className="space-y-2">
                            <Button
                                className="w-full gap-2"
                                variant="outline"
                                onClick={handleGenerateProposal}
                                disabled={selectedVendors.length === 0}
                            >
                                <FileText className="w-4 h-4" /> Preview Proposal
                            </Button>
                            <Button
                                className="w-full gap-2 bg-green-600 hover:bg-green-700"
                                onClick={handleSendProposal}
                                disabled={selectedVendors.length === 0 || proposalLocked}
                            >
                                <Send className="w-4 h-4" /> Send to Client
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
