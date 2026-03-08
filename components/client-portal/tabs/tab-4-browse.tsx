'use client'

import { useState } from 'react'
import { useClientIntake } from '@/components/providers/client-intake-provider'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    ArrowRight, ArrowLeft, Store, Heart, MapPin, Star, IndianRupee
} from 'lucide-react'
import { MOCK_VENDORS } from '@/lib/mock-data/vendors'

const CATEGORIES = ['venue', 'catering', 'decor', 'photography', 'entertainment']

export function Tab4Browse() {
    const { data, toggleLikedVendor, goToTab } = useClientIntake()
    const [activeCategory, setActiveCategory] = useState('venue')

    // Filter vendors by category and optionally by city
    const filteredVendors = MOCK_VENDORS.filter(v => {
        if (v.category !== activeCategory) return false
        // For venues, filter by city if selected
        if (activeCategory === 'venue' && data.city && v.city) {
            return v.city === data.city
        }
        return true
    })

    const handleContinue = () => {
        goToTab(data.currentTab + 1)
    }

    const handleBack = () => {
        goToTab(data.currentTab - 1)
    }

    return (
        <Card className="p-6 bg-white/80 backdrop-blur shadow-xl border-0">
            {/* Header */}
            <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 text-white mb-4">
                    <Store className="w-7 h-7" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Explore Our Partners
                </h1>
                <p className="text-gray-500">
                    Tap ❤️ on vendors you like - it helps us understand your taste!
                </p>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
                {CATEGORIES.map((cat) => {
                    const isActive = activeCategory === cat
                    const likedInCategory = MOCK_VENDORS
                        .filter(v => v.category === cat && data.likedVendors.includes(v.id))
                        .length

                    return (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${isActive
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            <span className="capitalize">{cat}</span>
                            {likedInCategory > 0 && (
                                <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center ${isActive ? 'bg-white/20' : 'bg-pink-100 text-pink-600'
                                    }`}>
                                    {likedInCategory}
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Skip venue if personal */}
            {activeCategory === 'venue' && data.venueType === 'personal' && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2">
                    ✓ You have your own venue! Browse other categories or continue.
                </div>
            )}

            {/* Vendor Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 max-h-[400px] overflow-y-auto">
                {filteredVendors.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-gray-400">
                        No vendors in this category for {data.city || 'selected city'}
                    </div>
                ) : (
                    filteredVendors.map((vendor) => {
                        const isLiked = data.likedVendors.includes(vendor.id)
                        return (
                            <div
                                key={vendor.id}
                                className="rounded-xl overflow-hidden border bg-white shadow-sm hover:shadow-md transition-all"
                            >
                                {/* Image */}
                                <div className="aspect-[4/3] bg-gray-100 relative">
                                    {vendor.imageUrl ? (
                                        <img
                                            src={vendor.imageUrl}
                                            alt={vendor.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <Store className="w-12 h-12" />
                                        </div>
                                    )}
                                    {/* Heart Button */}
                                    <button
                                        onClick={() => toggleLikedVendor(vendor.id)}
                                        className={`absolute top-2 right-2 w-10 h-10 rounded-full flex items-center justify-center transition-all ${isLiked
                                            ? 'bg-pink-500 text-white scale-110'
                                            : 'bg-white/80 text-gray-400 hover:text-pink-500'
                                            }`}
                                    >
                                        <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                                    </button>
                                </div>

                                {/* Info */}
                                <div className="p-3">
                                    <h3 className="font-medium text-sm truncate">{vendor.name}</h3>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                        <MapPin className="w-3 h-3" />
                                        <span>{vendor.city || 'Multiple cities'}</span>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center gap-1">
                                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                            <span className="text-xs">{vendor.rating || 4.5}</span>
                                        </div>
                                        <div className="flex items-center text-xs text-green-600 font-medium">
                                            <IndianRupee className="w-3 h-3" />
                                            {(vendor.startPrice / 100000).toFixed(1)}L+
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Liked Summary */}
            {data.likedVendors.length > 0 && (
                <div className="mb-4 p-4 bg-pink-50 rounded-xl border border-pink-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
                        <span className="font-medium text-pink-700">
                            {data.likedVendors.length} vendors saved
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {CATEGORIES.map(cat => {
                            const count = MOCK_VENDORS
                                .filter(v => v.category === cat && data.likedVendors.includes(v.id))
                                .length
                            if (count === 0) return null
                            return (
                                <Badge key={cat} variant="secondary" className="text-xs capitalize">
                                    {cat}: {count}
                                </Badge>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3">
                <Button
                    variant="outline"
                    onClick={handleBack}
                    className="h-12 px-6 gap-2"
                >
                    <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Button
                    onClick={handleContinue}
                    className="flex-1 h-12 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 gap-2"
                >
                    I'm Done Browsing <ArrowRight className="w-5 h-5" />
                </Button>
            </div>
        </Card>
    )
}
