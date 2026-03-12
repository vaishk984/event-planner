'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UtensilsCrossed, Star, IndianRupee, CheckCircle2, AlertCircle, Users, Loader2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getEventVendors, addVendorToEvent, removeVendorFromEvent } from '@/lib/actions/event-vendor-actions'
import type { Event } from '@/types/domain'
import { getEvent } from '@/lib/actions/event-actions'

interface CatererVendor {
    id: string
    name: string
    rating: number
    reviewCount: number
    basePrice: number
    imageUrl?: string
    isSelected: boolean
}

export default function FoodPage() {
    const params = useParams()
    const eventId = params.id as string
    const [loading, setLoading] = useState(true)
    const [event, setEvent] = useState<Event | null>(null)
    const [selectedCaterers, setSelectedCaterers] = useState<CatererVendor[]>([])
    const [availableCaterers, setAvailableCaterers] = useState<CatererVendor[]>([])

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
                return
            }

            setEvent(eventData)

            // Fetch all available caterers
            const { data: allCaterers, error: caterersError } = await supabase
                .from('vendors')
                .select('*')
                .eq('category', 'catering')
                .eq('status', 'active')

            if (caterersError) throw caterersError

            // Build a lookup map for vendor details
            const vendorDetailsMap: Record<string, { rating: number; reviewCount: number }> = {}
            for (const v of (allCaterers || [])) {
                vendorDetailsMap[v.id] = {
                    rating: v.rating || 0,
                    reviewCount: v.review_count || 0,
                }
            }

            // Fetch assigned caterers (now with real ratings)
            const eventVendors = await getEventVendors(eventId)
            const assignedCaterers = eventVendors
                .filter(v => v.vendorCategory === 'catering')
                .map(v => ({
                    id: v.vendorId,
                    name: v.vendorName || 'Unknown Caterer',
                    rating: vendorDetailsMap[v.vendorId]?.rating || 0,
                    reviewCount: vendorDetailsMap[v.vendorId]?.reviewCount || 0,
                    basePrice: v.agreedAmount || 0,
                    isSelected: true
                }))

            setSelectedCaterers(assignedCaterers)

            // Map available caterers from already-fetched data
            const assignedIds = new Set(assignedCaterers.map(c => c.id))
            const available = (allCaterers || []).map((vendor: any) => ({
                id: vendor.id,
                name: vendor.company_name || vendor.name,
                rating: vendor.rating || 0,
                reviewCount: vendor.review_count || 0,
                basePrice: vendor.start_price || 0,
                imageUrl: vendor.image_url,
                isSelected: assignedIds.has(vendor.id)
            }))

            setAvailableCaterers(available)
        } catch (error) {
            console.error('Failed to load food page data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSelectCaterer = async (caterer: CatererVendor) => {
        try {
            const result = await addVendorToEvent(
                eventId,
                caterer.id,
                'catering',
                caterer.basePrice,
                { name: caterer.name, imageUrl: caterer.imageUrl }
            )

            if (result.success) {
                await fetchData() // Refresh data
            } else {
                alert(`Failed to add caterer: ${result.error}`)
            }
        } catch (error) {
            console.error('Error adding caterer:', error)
            alert('An unexpected error occurred')
        }
    }

    const handleRemoveCaterer = async (catererId: string) => {
        try {
            const result = await removeVendorFromEvent(eventId, catererId)

            if (result.success) {
                await fetchData() // Refresh data
            } else {
                alert(`Failed to remove caterer: ${result.error}`)
            }
        } catch (error) {
            console.error('Error removing caterer:', error)
            alert('An unexpected error occurred')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        )
    }

    if (!event) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Event not found</p>
            </div>
        )
    }

    // Extract food preferences from requirements if available
    const requirements = (event as any).requirements || {}
    const foodPrefs = requirements.food || {}

    const selectedCaterer = selectedCaterers[0] // For now, show first selected

    return (
        <div className="space-y-6">
            {/* Client Requirements Summary */}
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-amber-800">
                        <UtensilsCrossed className="w-5 h-5" /> Client's Food Requirements
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-4 gap-4">
                        <div>
                            <span className="text-xs text-amber-600 uppercase">Guest Count</span>
                            <p className="font-medium text-amber-800 flex items-center gap-1 mt-1">
                                <Users className="w-4 h-4" />
                                {event.guestCount || 'Not specified'}
                            </p>
                        </div>
                        <div>
                            <span className="text-xs text-amber-600 uppercase">Dietary</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {foodPrefs.dietary?.length ? foodPrefs.dietary.map((d: string) => (
                                    <Badge key={d} className="bg-amber-100 text-amber-700">{d}</Badge>
                                )) : <span className="text-sm text-amber-700">Not specified</span>}
                            </div>
                        </div>
                        <div>
                            <span className="text-xs text-amber-600 uppercase">Cuisines</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {foodPrefs.cuisines?.length ? foodPrefs.cuisines.map((c: string) => (
                                    <Badge key={c} variant="outline" className="text-amber-700 border-amber-300">{c}</Badge>
                                )) : <span className="text-sm text-amber-700">Not specified</span>}
                            </div>
                        </div>
                        <div>
                            <span className="text-xs text-amber-600 uppercase">Serving Style</span>
                            <p className="font-medium text-amber-800">{foodPrefs.servingStyle || 'Not specified'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Selected Caterer */}
            {selectedCaterer && (
                <Card className="border-2 border-green-300 bg-green-50/50">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2 text-green-800">
                                <CheckCircle2 className="w-5 h-5" /> Selected Caterer
                            </CardTitle>
                            <Badge className="bg-green-200 text-green-800">Confirmed</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900">{selectedCaterer.name}</h3>
                                <div className="flex items-center gap-3 mt-2">
                                    {selectedCaterer.rating > 0 && (
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                            <span className="font-medium">{selectedCaterer.rating}</span>
                                            <span className="text-gray-500 text-sm">({selectedCaterer.reviewCount} reviews)</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1 text-green-600">
                                        <IndianRupee className="w-4 h-4" />
                                        <span className="font-medium">₹{selectedCaterer.basePrice.toLocaleString()}/plate</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right flex flex-col items-end gap-2">
                                {event.guestCount && (
                                    <>
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Users className="w-4 h-4" />
                                            <span>{event.guestCount} guests</span>
                                        </div>
                                        <p className="text-2xl font-bold text-green-600">
                                            ₹{((selectedCaterer.basePrice * event.guestCount) / 100000).toFixed(1)}L
                                        </p>
                                        <p className="text-xs text-gray-500">Estimated total</p>
                                    </>
                                )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRemoveCaterer(selectedCaterer.id)}
                                    className="text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Remove
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Caterer Options */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Caterer Options</CardTitle>
                        <Link href="/showroom">
                            <Button variant="outline" size="sm">Browse More</Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    {availableCaterers.length === 0 ? (
                        <p className="text-center py-8 text-gray-500">No caterers available. Add caterers from the Showroom.</p>
                    ) : (
                        <div className="space-y-3">
                            {availableCaterers.map((caterer) => (
                                <div
                                    key={caterer.id}
                                    className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all ${caterer.isSelected
                                        ? 'border-green-400 bg-green-50'
                                        : 'border-gray-200 hover:border-orange-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                                            {caterer.imageUrl ? (
                                                <img src={caterer.imageUrl} alt={caterer.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <UtensilsCrossed className="w-8 h-8 text-gray-300" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-medium">{caterer.name}</h4>
                                            {caterer.rating > 0 && (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                                    <span className="text-sm">{caterer.rating}</span>
                                                    <span className="text-xs text-gray-400">({caterer.reviewCount})</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-green-600">₹{caterer.basePrice.toLocaleString()}/plate</div>
                                        {event.guestCount && (
                                            <p className="text-xs text-gray-500 mb-2">
                                                ₹{((caterer.basePrice * event.guestCount) / 100000).toFixed(1)}L total
                                            </p>
                                        )}
                                        {caterer.isSelected ? (
                                            <Badge className="bg-green-500">Selected</Badge>
                                        ) : (
                                            <Button
                                                size="sm"
                                                className="bg-orange-500 hover:bg-orange-600"
                                                onClick={() => handleSelectCaterer(caterer)}
                                            >
                                                Select
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Menu Planning */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-500" /> Menu Planning
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                        <p className="text-amber-800">
                            📋 Menu planning will be available after caterer confirmation.
                            Work with the selected caterer to finalize the menu based on client preferences.
                        </p>
                        <Button variant="outline" className="mt-3" disabled>
                            Plan Menu (Coming Soon)
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
