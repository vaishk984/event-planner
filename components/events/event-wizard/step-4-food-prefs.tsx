'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Check, UtensilsCrossed, Store } from 'lucide-react'
import { EventPlan } from '@/lib/types/event-plan'
import { ShowroomPreview } from './showroom-preview'

interface Step4Props {
    data: EventPlan['catering']
    updateData: (data: Partial<EventPlan['catering']>) => void
}

const DIETARY_OPTIONS = [
    { id: 'veg', name: 'Veg', icon: '🥗' },
    { id: 'non-veg', name: 'Non-Veg', icon: '🍖' },
    { id: 'jain', name: 'Jain', icon: '🌿' },
    { id: 'vegan', name: 'Vegan', icon: '🌱' },
    { id: 'halal', name: 'Halal', icon: '🔷' },
]

const CUISINE_PREFERENCES = [
    'North Indian', 'South Indian', 'Rajasthani', 'Gujarati',
    'Continental', 'Chinese', 'Italian', 'Thai', 'Mughlai'
]

const MENU_STYLE_PREFS = [
    { id: 'buffet', name: 'Buffet', icon: '🍽️' },
    { id: 'plated', name: 'Sit-Down', icon: '🍛' },
    { id: 'live_counters', name: 'Live Counters', icon: '🔥' },
    { id: 'mixed', name: 'Mixed', icon: '🎯' },
]

const BUDGET_LEVELS = [
    { id: 'standard', name: 'Standard', range: '₹800-1200', cost: 1000 },
    { id: 'premium', name: 'Premium', range: '₹1200-2000', cost: 1500 },
    { id: 'luxury', name: 'Luxury', range: '₹2000+', cost: 2500 },
]

export function Step4FoodPrefs({ data, updateData }: Step4Props) {
    const [likedCaterers, setLikedCaterers] = useState<string[]>([])

    const toggleDietary = (option: string) => {
        const current = data.dietaryOptions || []
        if (current.includes(option)) {
            updateData({ dietaryOptions: current.filter(d => d !== option) })
        } else {
            updateData({ dietaryOptions: [...current, option] })
        }
    }

    const toggleCuisine = (cuisine: string) => {
        const current = data.cuisineTypes || []
        if (current.includes(cuisine)) {
            updateData({ cuisineTypes: current.filter(c => c !== cuisine) })
        } else {
            updateData({ cuisineTypes: [...current, cuisine] })
        }
    }

    const handleCatererLike = (vendorId: string) => {
        setLikedCaterers(prev =>
            prev.includes(vendorId)
                ? prev.filter(id => id !== vendorId)
                : [...prev, vendorId]
        )
    }

    return (
        <div className="space-y-5">
            {/* Dietary Requirements */}
            <div className="space-y-2">
                <Label className="text-base font-semibold flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4" /> Dietary Requirements
                </Label>
                <div className="grid grid-cols-5 gap-2">
                    {DIETARY_OPTIONS.map((option) => {
                        const isSelected = data.dietaryOptions?.includes(option.id)
                        return (
                            <button
                                key={option.id}
                                onClick={() => toggleDietary(option.id)}
                                className={`p-3 rounded-xl border-2 text-center transition-all ${isSelected
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-200 hover:border-green-300'
                                    }`}
                            >
                                <div className="text-xl">{option.icon}</div>
                                <div className="text-xs font-medium mt-1">{option.name}</div>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Cuisine Preferences */}
            <div className="space-y-2">
                <Label className="text-sm font-semibold">Cuisine Preferences</Label>
                <div className="flex flex-wrap gap-2">
                    {CUISINE_PREFERENCES.map((cuisine) => (
                        <button
                            key={cuisine}
                            onClick={() => toggleCuisine(cuisine)}
                            className={`px-3 py-1 rounded-full text-sm transition-all ${data.cuisineTypes?.includes(cuisine)
                                ? 'bg-amber-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {cuisine}
                        </button>
                    ))}
                </div>
            </div>

            {/* Menu Style & Budget in grid */}
            <div className="grid grid-cols-2 gap-4">
                {/* Menu Style */}
                <div className="space-y-2">
                    <Label className="text-sm font-semibold">Serving Style</Label>
                    <div className="grid grid-cols-2 gap-2">
                        {MENU_STYLE_PREFS.map((style) => (
                            <button
                                key={style.id}
                                onClick={() => updateData({ menuStyle: style.id as any })}
                                className={`p-2 rounded-lg border-2 text-center transition-all ${data.menuStyle === style.id
                                    ? 'border-amber-500 bg-amber-50'
                                    : 'border-gray-200 hover:border-amber-300'
                                    }`}
                            >
                                <span className="text-lg">{style.icon}</span>
                                <span className="text-xs ml-1">{style.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Budget Level */}
                <div className="space-y-2">
                    <Label className="text-sm font-semibold">Budget Level</Label>
                    <div className="grid grid-cols-3 gap-2">
                        {BUDGET_LEVELS.map((level) => {
                            const isSelected = (data.perPlateCost <= 1200 && level.id === 'standard') ||
                                (data.perPlateCost > 1200 && data.perPlateCost <= 2000 && level.id === 'premium') ||
                                (data.perPlateCost > 2000 && level.id === 'luxury')
                            return (
                                <button
                                    key={level.id}
                                    onClick={() => updateData({ perPlateCost: level.cost })}
                                    className={`p-2 rounded-lg border-2 text-center transition-all ${isSelected
                                        ? 'border-orange-500 bg-orange-50'
                                        : 'border-gray-200 hover:border-orange-300'
                                        }`}
                                >
                                    <div className="text-xs font-medium">{level.name}</div>
                                    <div className="text-[10px] text-orange-600">{level.range}</div>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Showroom Preview - Catering */}
            <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                <div className="flex items-center gap-2 mb-3">
                    <Store className="w-5 h-5 text-amber-600" />
                    <h3 className="font-semibold text-amber-700">Show Client: Our Caterers</h3>
                </div>
                <ShowroomPreview
                    category="catering"
                    title="Partner Caterers"
                    onSelectVendor={handleCatererLike}
                    selectedVendorIds={likedCaterers}
                />
                {likedCaterers.length > 0 && (
                    <div className="mt-3 p-2 bg-green-50 rounded text-sm text-green-700">
                        ✓ Client liked {likedCaterers.length} caterer(s) - noted for design phase
                    </div>
                )}
            </Card>

            {/* Special Requests */}
            <div className="space-y-2">
                <Label className="text-sm font-semibold">Special Food Requests</Label>
                <Textarea
                    placeholder="e.g., Live chaat counter, specific dishes, allergies..."
                    value={data.menuHighlights?.join(', ') || ''}
                    onChange={(e) => updateData({ menuHighlights: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    rows={2}
                    className="resize-none"
                />
            </div>

            {/* Summary Card */}
            <Card className="p-3 bg-amber-50 border-amber-200">
                <div className="flex items-center gap-2 text-amber-700">
                    <Check className="w-4 h-4" />
                    <span className="text-sm">
                        <span className="font-medium">{data.dietaryOptions?.join('+') || 'Dietary'}</span> •
                        <span className="font-medium"> {data.cuisineTypes?.slice(0, 2).join(', ') || 'Cuisines'}</span> •
                        <span className="font-medium"> {likedCaterers.length}</span> liked
                    </span>
                </div>
            </Card>
        </div>
    )
}

