'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Camera, Music, Sparkles, Brush, Hand, Mic, Car,
    CheckCircle2, Circle, Star, IndianRupee, Loader2, Trash2,
    Flower2, Lightbulb, HeartHandshake
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getEventVendors, addVendorToEvent, removeVendorFromEvent } from '@/lib/actions/event-vendor-actions'

// All vendor service categories — planner picks what they need
const VENDOR_CATEGORIES = [
    { id: 'photography', name: 'Photography & Video', icon: Camera, color: 'blue' },
    { id: 'entertainment', name: 'Music & Entertainment', icon: Music, color: 'purple' },
    { id: 'decor', name: 'Decor & Design', icon: Sparkles, color: 'pink' },
    { id: 'makeup', name: 'Makeup & Hair', icon: Brush, color: 'rose' },
    { id: 'mehendi', name: 'Mehendi Artist', icon: Hand, color: 'amber' },
    { id: 'anchor', name: 'Anchor / Host', icon: Mic, color: 'green' },
    { id: 'transport', name: 'Guest Transport', icon: Car, color: 'indigo' },
    { id: 'florist', name: 'Florist', icon: Flower2, color: 'emerald' },
    { id: 'choreography', name: 'Choreographer', icon: HeartHandshake, color: 'fuchsia' },
    { id: 'lighting', name: 'Lighting & AV', icon: Lightbulb, color: 'yellow' },
]

const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; badge: string }> = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' },
        purple: { bg: 'bg-purple-50', text: 'text-purple-600', badge: 'bg-purple-100 text-purple-700' },
        pink: { bg: 'bg-pink-50', text: 'text-pink-600', badge: 'bg-pink-100 text-pink-700' },
        rose: { bg: 'bg-rose-50', text: 'text-rose-600', badge: 'bg-rose-100 text-rose-700' },
        amber: { bg: 'bg-amber-50', text: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' },
        green: { bg: 'bg-green-50', text: 'text-green-600', badge: 'bg-green-100 text-green-700' },
        indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', badge: 'bg-indigo-100 text-indigo-700' },
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
        fuchsia: { bg: 'bg-fuchsia-50', text: 'text-fuchsia-600', badge: 'bg-fuchsia-100 text-fuchsia-700' },
        yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', badge: 'bg-yellow-100 text-yellow-700' },
    }
    return colors[color] || colors.blue
}

interface VendorAssignment {
    categoryId: string
    vendor: {
        id: string
        name: string
        rating: number
        price: number
    } | null
}

export default function ServicesPage() {
    const params = useParams()
    const eventId = params.id as string
    const [loading, setLoading] = useState(true)
    const [vendorAssignments, setVendorAssignments] = useState<Map<string, VendorAssignment>>(new Map())

    useEffect(() => {
        fetchData()
    }, [eventId])

    const fetchData = async () => {
        try {
            setLoading(true)

            // Fetch assigned vendors
            const eventVendors = await getEventVendors(eventId)

            // Map vendors by category
            const assignmentsMap = new Map<string, VendorAssignment>()

            // Initialize all categories as empty
            VENDOR_CATEGORIES.forEach(cat => {
                assignmentsMap.set(cat.id, {
                    categoryId: cat.id,
                    vendor: null
                })
            })

            // Fill in assigned vendors
            eventVendors.forEach(ev => {
                const category = ev.vendorCategory || 'other'
                if (assignmentsMap.has(category)) {
                    assignmentsMap.set(category, {
                        categoryId: category,
                        vendor: {
                            id: ev.vendorId,
                            name: ev.vendorName || 'Unknown',
                            rating: (ev as any).vendorRating || 0,
                            price: ev.agreedAmount || 0
                        }
                    })
                }
            })

            setVendorAssignments(assignmentsMap)
        } catch (error) {
            console.error('Failed to load services data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSelectVendor = async (categoryId: string) => {
        // For now, redirect to showroom filtered by category
        window.location.href = `/showroom?category=${categoryId}`
    }

    const handleRemoveVendor = async (categoryId: string, vendorId: string) => {
        try {
            const result = await removeVendorFromEvent(eventId, vendorId)

            if (result.success) {
                await fetchData() // Refresh data
            } else {
                alert(`Failed to remove vendor: ${result.error}`)
            }
        } catch (error) {
            console.error('Error removing vendor:', error)
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

    const selectedCount = Array.from(vendorAssignments.values()).filter(a => a.vendor !== null).length
    const totalBudget = Array.from(vendorAssignments.values()).reduce((sum, a) => sum + (a.vendor?.price || 0), 0)

    return (
        <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-700">{selectedCount}/{VENDOR_CATEGORIES.length}</p>
                            <p className="text-sm text-green-600">Vendors Assigned</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                            <IndianRupee className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-orange-700">₹{(totalBudget / 100000).toFixed(1)}L</p>
                            <p className="text-sm text-orange-600">Services Budget</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-purple-700">{VENDOR_CATEGORIES.length - selectedCount}</p>
                            <p className="text-sm text-purple-600">Pending Selection</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Vendor Grid */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Vendor Assignments</CardTitle>
                        <Link href="/showroom">
                            <Button variant="outline" size="sm">Browse Showroom</Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                        {VENDOR_CATEGORIES.map((category) => {
                            const Icon = category.icon
                            const colors = getColorClasses(category.color)
                            const assignment = vendorAssignments.get(category.id)
                            const vendor = assignment?.vendor

                            return (
                                <div
                                    key={category.id}
                                    className={`p-4 rounded-xl border-2 transition-all ${vendor
                                        ? 'border-green-300 bg-green-50/50'
                                        : 'border-gray-200 hover:border-orange-300'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
                                                <Icon className={`w-5 h-5 ${colors.text}`} />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium">{category.name}</h4>
                                                {vendor ? (
                                                    <>
                                                        <p className="text-sm text-gray-600">{vendor.name}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {vendor.rating > 0 && (
                                                                <>
                                                                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                                                    <span className="text-xs">{vendor.rating}</span>
                                                                </>
                                                            )}
                                                            <span className="text-xs text-green-600 font-medium">
                                                                ₹{(vendor.price / 1000).toFixed(0)}K
                                                            </span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <p className="text-sm text-gray-400">Not selected</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            {vendor ? (
                                                <>
                                                    <Badge className="bg-green-100 text-green-700">
                                                        <CheckCircle2 className="w-3 h-3 mr-1" /> Assigned
                                                    </Badge>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleRemoveVendor(category.id, vendor.id)}
                                                        className="text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-3 h-3 mr-1" />
                                                        Remove
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    className="bg-orange-500 hover:bg-orange-600"
                                                    onClick={() => handleSelectVendor(category.id)}
                                                >
                                                    Select
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Vendor Assigned</span>
                </div>
                <div className="flex items-center gap-2">
                    <Circle className="w-4 h-4 text-gray-300" />
                    <span>Pending Selection</span>
                </div>
            </div>
        </div>
    )
}
