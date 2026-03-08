'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart, Star, IndianRupee, Store, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { MOCK_VENDORS } from '@/lib/mock-data/vendors'

interface CategoryShowroomProps {
    category: string
    title: string
    likedVendors: string[]
    onToggleLike: (vendorId: string) => void
    maxItems?: number
}

// Mock tags for vendors
const VENDOR_TAGS: Record<string, string[]> = {
    'catering': ['Live Counters', 'Jain Options', 'Corporate Menu', 'Box Meals'],
    'decor': ['Wedding', 'Floral', 'Modern', 'Traditional'],
    'photography': ['Candid', 'Cinematic', 'Drone', 'Portrait'],
    'entertainment': ['DJ', 'Live Band', 'Cultural', 'Bollywood'],
}

export function CategoryShowroom({
    category,
    title,
    likedVendors,
    onToggleLike,
    maxItems = 4
}: CategoryShowroomProps) {
    const [startIndex, setStartIndex] = useState(0)

    // Filter vendors by category
    const allVendors = MOCK_VENDORS.filter(v => v.category === category)
    const vendors = allVendors.slice(startIndex, startIndex + 2)
    const availableCount = allVendors.length

    const canGoBack = startIndex > 0
    const canGoForward = startIndex + 2 < allVendors.length

    const goBack = () => setStartIndex(Math.max(0, startIndex - 2))
    const goForward = () => setStartIndex(Math.min(allVendors.length - 2, startIndex + 2))

    // Get random tags for a vendor
    const getVendorTags = (vendorId: string) => {
        const tags = VENDOR_TAGS[category] || []
        const random = parseInt(vendorId.replace(/\D/g, '')) % tags.length
        return tags.slice(random, random + 2)
    }

    if (allVendors.length === 0) {
        return (
            <Card className="p-4 bg-gray-50 text-center text-gray-400">
                <Store className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No vendors available in this category</p>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="font-semibold text-amber-700 flex items-center gap-2">
                        <Store className="w-5 h-5" /> Show Client: {title}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                        Partner {title} • <span className="text-amber-600">{availableCount} available</span>
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={goBack}
                        disabled={!canGoBack}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${canGoBack ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 'bg-gray-100 text-gray-300'
                            }`}
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={goForward}
                        disabled={!canGoForward}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${canGoForward ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 'bg-gray-100 text-gray-300'
                            }`}
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                    <a href={`/showroom/browse/${category}`} target="_blank" rel="noopener noreferrer" className="text-amber-600 text-sm font-medium flex items-center gap-1 hover:underline ml-2">
                        View All <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            </div>

            {/* Vendor Cards - Larger Style */}
            <div className="grid grid-cols-2 gap-4">
                {vendors.map((vendor) => {
                    const isLiked = likedVendors.includes(vendor.id)
                    const tags = getVendorTags(vendor.id)
                    const reviewCount = Math.floor(Math.random() * 200) + 50

                    return (
                        <button
                            key={vendor.id}
                            onClick={() => onToggleLike(vendor.id)}
                            className={`rounded-xl overflow-hidden border-2 bg-white text-left transition-all hover:shadow-md ${isLiked ? 'border-pink-400 ring-2 ring-pink-100' : 'border-gray-200'
                                }`}
                        >
                            {/* Image */}
                            <div className="aspect-[16/10] bg-gray-100 relative">
                                {vendor.imageUrl ? (
                                    <img
                                        src={vendor.imageUrl}
                                        alt={vendor.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gradient-to-br from-gray-100 to-gray-200">
                                        <Store className="w-12 h-12" />
                                    </div>
                                )}
                                {/* Heart Badge */}
                                {isLiked && (
                                    <div className="absolute top-2 right-2 bg-pink-500 text-white px-2 py-0.5 rounded text-xs flex items-center gap-1">
                                        <Heart className="w-3 h-3 fill-current" /> Selected
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="p-3">
                                <h3 className="font-medium text-sm">{vendor.name}</h3>

                                {/* Rating */}
                                <div className="flex items-center gap-2 mt-1">
                                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                    <span className="text-sm font-medium">{vendor.rating || 4.5}</span>
                                    <span className="text-xs text-gray-400">({reviewCount})</span>
                                </div>

                                {/* Price */}
                                <div className="flex items-center text-sm text-green-600 font-medium mt-1">
                                    <IndianRupee className="w-3 h-3" />
                                    <span>{Math.round(vendor.startPrice / 100)} onwards</span>
                                </div>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {tags.map((tag) => (
                                        <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0 bg-gray-50">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </button>
                    )
                })}
            </div>

            {/* Hint */}
            <p className="text-center text-xs text-amber-600 flex items-center justify-center gap-1">
                💡 Click a vendor to mark as client's preference
            </p>
        </div>
    )
}
