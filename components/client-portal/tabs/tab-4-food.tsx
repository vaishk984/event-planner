'use client'

import { useClientIntake } from '@/components/providers/client-intake-provider'
import { CategoryShowroom } from '@/components/client-portal/category-showroom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ArrowRight, ArrowLeft, UtensilsCrossed, Check } from 'lucide-react'

const DIETARY_OPTIONS = [
    { id: 'veg', name: 'Veg', icon: '🥗' },
    { id: 'non-veg', name: 'Non-Veg', icon: '🍖' },
    { id: 'jain', name: 'Jain', icon: '🌿' },
    { id: 'vegan', name: 'Vegan', icon: '🌱' },
    { id: 'halal', name: 'Halal', icon: '🔷' },
]

const CUISINES = [
    'North Indian', 'South Indian', 'Rajasthani', 'Gujarati',
    'Continental', 'Chinese', 'Italian', 'Mughlai', 'Thai'
]

const SERVING_STYLES = [
    { id: 'buffet', name: 'Buffet', icon: '🍽️', desc: 'Self-service' },
    { id: 'plated', name: 'Sit-Down', icon: '🍛', desc: 'Table service' },
    { id: 'live_counters', name: 'Live Counters', icon: '🔥', desc: 'Made fresh' },
    { id: 'mixed', name: 'Mixed', icon: '🎯', desc: 'Combination' },
]

const BUDGET_LEVELS = [
    { id: 'standard', name: 'Standard', range: '₹800-1200/plate' },
    { id: 'premium', name: 'Premium', range: '₹1200-2000/plate' },
    { id: 'luxury', name: 'Luxury', range: '₹2000+/plate' },
]

export function Tab4Food() {
    const { data, updateFood, toggleCategoryLikedVendor, goToTab } = useClientIntake()

    const toggleDietary = (id: string) => {
        const current = data.food.dietary
        if (current.includes(id)) {
            updateFood({ dietary: current.filter(d => d !== id) })
        } else {
            updateFood({ dietary: [...current, id] })
        }
    }

    const toggleCuisine = (cuisine: string) => {
        const current = data.food.cuisines
        if (current.includes(cuisine)) {
            updateFood({ cuisines: current.filter(c => c !== cuisine) })
        } else {
            updateFood({ cuisines: [...current, cuisine] })
        }
    }

    // Navigation uses the raw currentTab value
    // Page.tsx handles the component mapping
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
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white mb-4">
                    <UtensilsCrossed className="w-7 h-7" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Food & Catering
                </h1>
                <p className="text-gray-500">
                    Let's plan the perfect menu for your guests
                </p>
            </div>

            <div className="space-y-6">
                {/* Dietary Requirements */}
                <div className="space-y-2">
                    <Label className="font-semibold">Dietary Requirements *</Label>
                    <div className="grid grid-cols-5 gap-2">
                        {DIETARY_OPTIONS.map((option) => {
                            const isSelected = data.food.dietary.includes(option.id)
                            return (
                                <button
                                    key={option.id}
                                    onClick={() => toggleDietary(option.id)}
                                    className={`p-3 rounded-xl border-2 text-center transition-all ${isSelected
                                        ? 'border-green-500 bg-green-50 shadow-md'
                                        : 'border-gray-200 hover:border-green-300'
                                        }`}
                                >
                                    <div className="text-xl">{option.icon}</div>
                                    <div className="text-xs font-medium mt-1">{option.name}</div>
                                    {isSelected && <Check className="w-3 h-3 text-green-600 mx-auto mt-1" />}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Cuisine Preferences */}
                <div className="space-y-2">
                    <Label className="font-semibold">Cuisine Preferences</Label>
                    <div className="flex flex-wrap gap-2">
                        {CUISINES.map((cuisine) => (
                            <button
                                key={cuisine}
                                onClick={() => toggleCuisine(cuisine)}
                                className={`px-3 py-1.5 rounded-full text-sm transition-all ${data.food.cuisines.includes(cuisine)
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {cuisine}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Serving Style & Budget */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="font-semibold">Serving Style</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {SERVING_STYLES.map((style) => (
                                <button
                                    key={style.id}
                                    onClick={() => updateFood({ servingStyle: style.id as any })}
                                    className={`p-3 rounded-lg border-2 text-center transition-all ${data.food.servingStyle === style.id
                                        ? 'border-amber-500 bg-amber-50'
                                        : 'border-gray-200 hover:border-amber-300'
                                        }`}
                                >
                                    <span className="text-lg">{style.icon}</span>
                                    <div className="text-xs font-medium">{style.name}</div>
                                    <div className="text-[10px] text-gray-500">{style.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="font-semibold">Budget Level</Label>
                        <div className="space-y-2">
                            {BUDGET_LEVELS.map((level) => (
                                <button
                                    key={level.id}
                                    onClick={() => updateFood({ budgetLevel: level.id as any })}
                                    className={`w-full p-3 rounded-lg border-2 text-left transition-all ${data.food.budgetLevel === level.id
                                        ? 'border-orange-500 bg-orange-50'
                                        : 'border-gray-200 hover:border-orange-300'
                                        }`}
                                >
                                    <div className="font-medium">{level.name}</div>
                                    <div className="text-xs text-orange-600">{level.range}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Showroom Preview */}
                <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                    <CategoryShowroom
                        category="catering"
                        title="Browse Caterers"
                        likedVendors={data.food.likedVendors}
                        onToggleLike={(id) => toggleCategoryLikedVendor('food', id)}
                    />
                </Card>

                {/* Special Requests */}
                <div className="space-y-2">
                    <Label className="font-semibold">Special Food Requests</Label>
                    <Textarea
                        placeholder="e.g., Live chaat counter, pani puri station, specific dishes you want, allergies..."
                        value={data.food.specialRequests}
                        onChange={(e) => updateFood({ specialRequests: e.target.value })}
                        rows={2}
                        className="resize-none"
                    />
                </div>

                {/* Navigation */}
                <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={handleBack} className="h-12 px-6 gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </Button>
                    <Button
                        onClick={handleContinue}
                        className="flex-1 h-12 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 gap-2"
                    >
                        Continue to Decor <ArrowRight className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </Card>
    )
}
