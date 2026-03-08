'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, ChevronLeft, ChevronRight, ExternalLink, Heart, Check } from 'lucide-react'
import { MOCK_VENDORS } from '@/lib/mock-data/vendors'
import Link from 'next/link'

interface ShowroomPreviewProps {
    category: 'venue' | 'catering' | 'decor' | 'photography' | 'entertainment'
    title: string
    onSelectVendor?: (vendorId: string) => void
    selectedVendorIds?: string[]
    filterCity?: string
}

export function ShowroomPreview({
    category,
    title,
    onSelectVendor,
    selectedVendorIds = [],
    filterCity
}: ShowroomPreviewProps) {
    const [scrollIndex, setScrollIndex] = useState(0)

    // Filter vendors by category and optionally city
    let vendors = MOCK_VENDORS.filter(v => v.category === category)
    if (filterCity) {
        vendors = vendors.filter(v => v.city.toLowerCase().includes(filterCity.toLowerCase()))
    }

    // Show 3 at a time
    const visibleVendors = vendors.slice(scrollIndex, scrollIndex + 3)
    const canScrollLeft = scrollIndex > 0
    const canScrollRight = scrollIndex + 3 < vendors.length

    if (vendors.length === 0) {
        return (
            <Card className="p-4 bg-gray-50 border-dashed">
                <p className="text-sm text-gray-500 text-center">
                    No vendors available for this category{filterCity ? ` in ${filterCity}` : ''}
                </p>
            </Card>
        )
    }

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-700">{title}</h4>
                    <Badge variant="secondary" className="text-xs">
                        {vendors.length} available
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setScrollIndex(Math.max(0, scrollIndex - 1))}
                        disabled={!canScrollLeft}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setScrollIndex(Math.min(vendors.length - 3, scrollIndex + 1))}
                        disabled={!canScrollRight}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Link href={`/showroom/browse/${category}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm" className="gap-1 text-indigo-600">
                            View All <ExternalLink className="w-3 h-3" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Vendor Cards */}
            <div className="grid grid-cols-3 gap-3">
                {visibleVendors.map((vendor) => {
                    const isSelected = selectedVendorIds.includes(vendor.id)
                    return (
                        <Card
                            key={vendor.id}
                            className={`overflow-hidden transition-all cursor-pointer hover:shadow-md ${isSelected ? 'ring-2 ring-green-500' : ''
                                }`}
                            onClick={() => onSelectVendor?.(vendor.id)}
                        >
                            {/* Image */}
                            <div className="relative h-28 bg-gray-100">
                                <img
                                    src={vendor.imageUrl}
                                    alt={vendor.name}
                                    className="w-full h-full object-cover"
                                />
                                {isSelected && (
                                    <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                                        <Check className="w-3 h-3" />
                                    </div>
                                )}
                                <div className="absolute bottom-2 left-2 bg-white/90 px-2 py-0.5 rounded text-xs font-medium">
                                    {vendor.city}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-3">
                                <h5 className="font-medium text-sm truncate">{vendor.name}</h5>
                                <div className="flex items-center gap-1 mt-1">
                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                    <span className="text-xs text-gray-600">{vendor.rating}</span>
                                    <span className="text-xs text-gray-400">({vendor.reviewCount})</span>
                                </div>
                                <div className="mt-2 text-sm font-semibold text-green-600">
                                    ₹{vendor.startPrice.toLocaleString('en-IN')}
                                    <span className="text-xs text-gray-400 font-normal"> onwards</span>
                                </div>
                                {/* Features preview */}
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {vendor.features.slice(0, 2).map((f, i) => (
                                        <Badge key={i} variant="outline" className="text-[10px] px-1 py-0">
                                            {f}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    )
                })}
            </div>

            {/* Selection hint */}
            {onSelectVendor && (
                <p className="text-xs text-gray-400 text-center">
                    💡 Click a vendor to mark as client's preference
                </p>
            )}
        </div>
    )
}
