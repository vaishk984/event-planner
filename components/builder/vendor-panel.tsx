'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
    Search, Star, Check, Plus, X, ChevronRight,
    Camera, UtensilsCrossed, Palette, Music, Building, Cake, Flower2,
    Send, Clock, CheckCircle2, XCircle, Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import type { Event, Vendor } from '@/types/domain'
import {
    createBookingRequest,
    getRequestsForEvent,
    searchVendors,
    deleteBookingRequest
} from '@/actions/booking'

interface VendorPanelProps {
    event: Event
    shortlist: { confirmed: Vendor[]; maybe: Vendor[] }
    onUpdateShortlist: (shortlist: { confirmed: Vendor[]; maybe: Vendor[] }) => void
    onNext: () => void
}

const CATEGORIES = [
    { id: 'photography', label: 'Photography', icon: Camera },
    { id: 'catering', label: 'Catering', icon: UtensilsCrossed },
    { id: 'decor', label: 'Decor', icon: Palette },
    { id: 'music', label: 'Music/DJ', icon: Music },
    { id: 'venue', label: 'Venue', icon: Building },
    { id: 'cake', label: 'Cake', icon: Cake },
    { id: 'florist', label: 'Florist', icon: Flower2 },
]

export function VendorPanel({ event, shortlist, onUpdateShortlist, onNext }: VendorPanelProps) {
    const [selectedCategory, setSelectedCategory] = useState('photography')
    const [searchQuery, setSearchQuery] = useState('')
    const [compareMode, setCompareMode] = useState(false)
    const [compareList, setCompareList] = useState<string[]>([])
    const [sentRequests, setSentRequests] = useState<Record<string, any>>({})
    const [sending, setSending] = useState<string | null>(null)

    // Real data state
    const [vendors, setVendors] = useState<Vendor[]>([])
    const [loadingVendors, setLoadingVendors] = useState(false)

    // Load existing requests
    useEffect(() => {
        const loadRequests = async () => {
            const requests = await getRequestsForEvent(event.id)
            const requestMap: Record<string, any> = {}
            requests.forEach(r => {
                requestMap[`${r.vendorId}`] = r // Simply map by vendorId for now
            })
            setSentRequests(requestMap)
        }
        loadRequests()
    }, [event.id])

    // Load vendors when category or search changes
    useEffect(() => {
        const loadVendors = async () => {
            setLoadingVendors(true)
            try {
                // Determine search query - if empty, fetch category defaults
                const results = await searchVendors(selectedCategory, searchQuery)
                setVendors(results as unknown as Vendor[])
            } catch (error) {
                console.error('Failed to load vendors:', error)
                toast.error('Failed to load vendors')
            } finally {
                setLoadingVendors(false)
            }
        }

        // Debounce search
        const timeoutId = setTimeout(() => {
            loadVendors()
        }, 500)

        return () => clearTimeout(timeoutId)
    }, [selectedCategory, searchQuery])

    const isInShortlist = (vendorId: string) => {
        return shortlist.confirmed.some(v => v.id === vendorId) ||
            shortlist.maybe.some(v => v.id === vendorId)
    }

    const addToConfirmed = async (vendor: Vendor) => {
        if (!isInShortlist(vendor.id)) {
            // Optimistic update
            onUpdateShortlist({
                ...shortlist,
                confirmed: [...shortlist.confirmed, vendor]
            })

            try {
                const result = await createBookingRequest({
                    eventId: event.id,
                    vendorId: vendor.id,
                    eventName: event.name,
                    eventDate: event.date,
                    city: event.city,
                    venue: event.venueName,
                    guestCount: event.guestCount,
                    service: vendor.category,
                    budget: vendor.basePrice || 0,
                    status: 'pending'
                })

                console.log('[VendorPanel] createBookingRequest result:', result)

                if (result.error) {
                    toast.error(`Failed to save: ${result.error}`)
                    console.error(result.error)
                } else {
                    toast.success('Added to plan')
                }
            } catch (error) {
                console.error('Error adding to plan:', error)
            }
        }
    }

    const addToMaybe = (vendor: Vendor) => {
        if (!isInShortlist(vendor.id)) {
            onUpdateShortlist({
                ...shortlist,
                maybe: [...shortlist.maybe, vendor]
            })
        }
    }

    const removeFromShortlist = async (vendorId: string) => {
        // Optimistic update
        onUpdateShortlist({
            confirmed: shortlist.confirmed.filter(v => v.id !== vendorId),
            maybe: shortlist.maybe.filter(v => v.id !== vendorId)
        })

        try {
            // Delete from DB (if it exists)
            // Note: We don't know if it was confirmed (DB) or maybe (Local), so we try delete anyway
            // or we check if it was in confirmed list.
            await deleteBookingRequest(event.id, vendorId)
            toast.success('Removed from plan')
        } catch (error) {
            console.error('Error removing from plan:', error)
        }
    }

    const toggleCompare = (vendorId: string) => {
        if (compareList.includes(vendorId)) {
            setCompareList(compareList.filter(id => id !== vendorId))
        } else if (compareList.length < 3) {
            setCompareList([...compareList, vendorId])
        }
    }

    // Send booking request to vendor
    const sendRequestToVendor = async (vendor: Vendor) => {
        setSending(vendor.id)

        try {
            const result = await createBookingRequest({
                eventId: event.id,
                eventName: event.name,
                eventDate: event.date,
                city: event.city,
                venue: event.venueName,
                guestCount: event.guestCount,
                vendorId: vendor.id,
                service: vendor.category,
                budget: vendor.basePrice || 0,
                status: 'pending' // Initial status
            })

            if (result.error) {
                toast.error(result.error)
                return
            }

            // Optimistic update
            setSentRequests(prev => ({
                ...prev,
                [`${vendor.id}`]: {
                    status: 'pending',
                    updatedAt: new Date().toISOString()
                }
            }))

            toast.success(`Request sent to ${vendor.name}!`)
        } catch (error) {
            console.error('Error sending request:', error)
            toast.error('Failed to send request')
        } finally {
            setSending(null)
        }
    }

    const getRequestStatus = (vendorId: string) => {
        return sentRequests[vendorId]
    }

    const totalConfirmed = shortlist.confirmed.reduce((sum, v) => sum + (v.basePrice || 0), 0)

    return (
        <div className="flex h-[600px]">
            {/* Left Sidebar - Categories */}
            <div className="w-48 border-r bg-gray-50 p-4">
                <p className="text-xs font-medium text-gray-500 mb-3">CATEGORIES</p>
                <div className="space-y-1">
                    {CATEGORIES.map(cat => {
                        const Icon = cat.icon
                        // Note: Counts would need a separate aggregate query, skipping for specific breakdown for now
                        // or could fetch all counts once. For now, removing count to avoid misleading 0.

                        return (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === cat.id
                                    ? 'bg-orange-100 text-orange-700 font-medium'
                                    : 'hover:bg-gray-100 text-gray-700'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="flex-1 text-left">{cat.label}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Middle - Vendor List */}
            <div className="flex-1 p-4 overflow-y-auto">
                <div className="flex items-center gap-3 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search vendors..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    {/* Compare logic - hiding briefly if complexity is high, or keeping it */}
                    {/* Keeping basic compare */}
                </div>

                {/* Loading State */}
                {loadingVendors ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
                    </div>
                ) : vendors.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        No vendors found in this category.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {vendors.map(vendor => (
                            <Card key={vendor.id} className={`group overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white ${isInShortlist(vendor.id) ? 'ring-2 ring-green-500' : ''}`}>
                                <div className="flex flex-col sm:flex-row h-full">
                                    {/* Image Section */}
                                    <div className="relative w-full sm:w-48 h-48 sm:h-auto shrink-0 overflow-hidden">
                                        <img
                                            src={vendor.images?.[0] || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800'}
                                            alt={vendor.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                            <span className="text-xs font-bold text-gray-900">{vendor.rating || 4.8}</span>
                                            <span className="text-[10px] text-gray-500">({vendor.reviewCount || 12})</span>
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="flex-1 p-4 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start gap-2">
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-900 leading-tight group-hover:text-orange-600 transition-colors">
                                                        {vendor.name}
                                                    </h3>
                                                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                                        {vendor.isVerified && (
                                                            <Badge className="bg-blue-50 text-blue-700 text-[10px] px-1.5 py-0 border-blue-100 mr-2">Verified</Badge>
                                                        )}
                                                        <span>{vendor.city || 'Mumbai'}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs text-gray-500">Starts from</div>
                                                    <div className="font-bold text-gray-900 text-lg">
                                                        ₹{vendor.basePrice?.toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                                                {vendor.description}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                                            {isInShortlist(vendor.id) ? (
                                                <Button variant="outline" size="sm" onClick={() => removeFromShortlist(vendor.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                                                    <X className="w-4 h-4 mr-1" /> Remove
                                                </Button>
                                            ) : (
                                                <>
                                                    <Button variant="outline" size="sm" onClick={() => addToMaybe(vendor)}>
                                                        Maybe
                                                    </Button>
                                                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white shadow-sm" onClick={() => addToConfirmed(vendor)}>
                                                        <Plus className="w-4 h-4 mr-1" /> Add to Plan
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Right Sidebar - Shortlist */}
            <div className="w-64 border-l bg-gray-50 p-4">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-gray-700">Shortlist</p>
                    <Badge className="bg-orange-100 text-orange-700">
                        {shortlist.confirmed.length + shortlist.maybe.length}
                    </Badge>
                </div>

                {/* Confirmed */}
                <div className="mb-4">
                    <p className="text-xs font-medium text-green-600 mb-2">✓ CONFIRMED ({shortlist.confirmed.length})</p>
                    <div className="space-y-2">
                        {shortlist.confirmed.map(vendor => {
                            const request = getRequestStatus(vendor.id)
                            const isSending = sending === vendor.id

                            return (
                                <div key={vendor.id} className="bg-white rounded-lg p-2 border border-green-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{vendor.name}</p>
                                            <p className="text-xs text-green-600">₹{vendor.basePrice?.toLocaleString()}</p>
                                        </div>
                                        <button onClick={() => removeFromShortlist(vendor.id)}>
                                            <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                                        </button>
                                    </div>

                                    {/* Request Status */}
                                    {request ? (
                                        <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${request.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                            request.status === 'declined' ? 'bg-red-100 text-red-600' :
                                                'bg-amber-100 text-amber-700'
                                            }`}>
                                            {request.status === 'accepted' && <CheckCircle2 className="w-3 h-3" />}
                                            {request.status === 'declined' && <XCircle className="w-3 h-3" />}
                                            {request.status === 'pending' && <Clock className="w-3 h-3" />}
                                            <span className="capitalize">{request.status}</span>
                                        </div>
                                    ) : (
                                        <Button
                                            size="sm"
                                            className="w-full h-7 text-xs bg-blue-600 hover:bg-blue-700"
                                            onClick={() => sendRequestToVendor(vendor)}
                                            disabled={isSending}
                                        >
                                            {isSending ? (
                                                <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Sending...</>
                                            ) : (
                                                <><Send className="w-3 h-3 mr-1" /> Send Request</>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Maybe */}
                <div className="mb-4">
                    <p className="text-xs font-medium text-amber-600 mb-2">? MAYBE ({shortlist.maybe.length})</p>
                    <div className="space-y-2">
                        {shortlist.maybe.map(vendor => (
                            <div key={vendor.id} className="bg-white rounded-lg p-2 border border-amber-200 flex items-center gap-2">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{vendor.name}</p>
                                    <p className="text-xs text-amber-600">₹{vendor.basePrice?.toLocaleString()}</p>
                                </div>
                                <button onClick={() => removeFromShortlist(vendor.id)}>
                                    <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Total */}
                <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">Confirmed Total</span>
                        <span className="font-bold text-green-600">₹{totalConfirmed.toLocaleString()}</span>
                    </div>
                </div>

                <Button onClick={onNext} className="w-full mt-4 bg-orange-500 hover:bg-orange-600">
                    Continue <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
    )
}
