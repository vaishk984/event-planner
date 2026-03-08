'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Plus, X, IndianRupee, Users } from 'lucide-react'
import { EventPlan, CUISINE_TYPES } from '@/lib/types/event-plan'

interface Step4Props {
    data: EventPlan['catering']
    updateData: (data: Partial<EventPlan['catering']>) => void
    guestCount: number
}

const MENU_STYLES = [
    { id: 'buffet', name: 'Buffet', description: 'Self-service variety', icon: '🍽️' },
    { id: 'plated', name: 'Plated', description: 'Seated service', icon: '🍛' },
    { id: 'live_counters', name: 'Live Counters', description: 'Interactive cooking', icon: '🔥' },
    { id: 'mixed', name: 'Mixed', description: 'Combination style', icon: '🎯' },
]

const DIETARY_OPTIONS = [
    { id: 'veg', name: 'Vegetarian', icon: '🥗' },
    { id: 'non-veg', name: 'Non-Vegetarian', icon: '🍖' },
    { id: 'jain', name: 'Jain', icon: '🌿' },
    { id: 'vegan', name: 'Vegan', icon: '🌱' },
    { id: 'halal', name: 'Halal', icon: '🔷' },
]

export function Step4Catering({ data, updateData, guestCount }: Step4Props) {
    const [newHighlight, setNewHighlight] = useState('')

    const toggleCuisine = (cuisine: string) => {
        const current = data.cuisineTypes || []
        if (current.includes(cuisine)) {
            updateData({ cuisineTypes: current.filter(c => c !== cuisine) })
        } else {
            updateData({ cuisineTypes: [...current, cuisine] })
        }
    }

    const toggleDietary = (option: string) => {
        const current = data.dietaryOptions || []
        if (current.includes(option)) {
            updateData({ dietaryOptions: current.filter(d => d !== option) })
        } else {
            updateData({ dietaryOptions: [...current, option] })
        }
    }

    const addMenuHighlight = () => {
        if (newHighlight.trim()) {
            updateData({ menuHighlights: [...(data.menuHighlights || []), newHighlight.trim()] })
            setNewHighlight('')
        }
    }

    const removeHighlight = (index: number) => {
        updateData({
            menuHighlights: data.menuHighlights?.filter((_, i) => i !== index) || []
        })
    }

    // Calculate total catering cost
    const totalCost = data.perPlateCost * guestCount

    return (
        <div className="space-y-6">
            {/* Menu Style */}
            <div className="space-y-3">
                <Label className="text-base font-semibold">Menu Style</Label>
                <div className="grid grid-cols-4 gap-3">
                    {MENU_STYLES.map((style) => (
                        <button
                            key={style.id}
                            onClick={() => updateData({ menuStyle: style.id as any })}
                            className={`p-4 rounded-xl border-2 text-center transition-all ${data.menuStyle === style.id
                                    ? 'border-indigo-500 bg-indigo-50 shadow-md'
                                    : 'border-gray-200 hover:border-indigo-300'
                                }`}
                        >
                            <div className="text-2xl mb-1">{style.icon}</div>
                            <div className="text-sm font-medium">{style.name}</div>
                            <div className="text-[10px] text-gray-500">{style.description}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Cuisines */}
            <div className="space-y-3">
                <Label className="text-base font-semibold">Cuisine Types</Label>
                <div className="flex flex-wrap gap-2">
                    {CUISINE_TYPES.map((cuisine) => (
                        <button
                            key={cuisine}
                            onClick={() => toggleCuisine(cuisine)}
                            className={`px-3 py-1.5 rounded-full text-sm transition-all ${data.cuisineTypes?.includes(cuisine)
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {cuisine}
                        </button>
                    ))}
                </div>
            </div>

            {/* Dietary Options */}
            <div className="space-y-3">
                <Label className="text-base font-semibold">Dietary Requirements</Label>
                <div className="flex gap-3">
                    {DIETARY_OPTIONS.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => toggleDietary(option.id)}
                            className={`flex-1 p-3 rounded-xl border-2 text-center transition-all ${data.dietaryOptions?.includes(option.id)
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-200 hover:border-green-300'
                                }`}
                        >
                            <div className="text-xl">{option.icon}</div>
                            <div className="text-xs font-medium mt-1">{option.name}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Menu Highlights */}
            <div className="space-y-3">
                <Label className="text-base font-semibold">Menu Highlights</Label>
                <p className="text-sm text-gray-500">Add special dishes or must-have items</p>
                <div className="flex gap-2">
                    <Input
                        placeholder="e.g., Live Chaat Counter, Gulab Jamun Station..."
                        value={newHighlight}
                        onChange={(e) => setNewHighlight(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addMenuHighlight()}
                    />
                    <Button onClick={addMenuHighlight} size="icon">
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {data.menuHighlights?.map((item, idx) => (
                        <span
                            key={idx}
                            className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm flex items-center gap-1"
                        >
                            {item}
                            <button onClick={() => removeHighlight(idx)} className="ml-1 hover:text-red-600">
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                </div>
            </div>

            {/* Per Plate Cost & Calculator */}
            <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <Label className="text-sm text-gray-600">Per Plate Cost</Label>
                        <div className="flex items-center gap-1 mt-1">
                            <IndianRupee className="w-4 h-4 text-gray-500" />
                            <Input
                                type="number"
                                value={data.perPlateCost}
                                onChange={(e) => updateData({
                                    perPlateCost: parseInt(e.target.value) || 0,
                                    cateringCost: (parseInt(e.target.value) || 0) * guestCount
                                })}
                                className="h-10"
                            />
                        </div>
                    </div>
                    <div>
                        <Label className="text-sm text-gray-600">Guest Count</Label>
                        <div className="flex items-center gap-2 mt-1 h-10 px-3 bg-white rounded-md border">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span className="font-semibold">{guestCount}</span>
                        </div>
                    </div>
                    <div>
                        <Label className="text-sm text-gray-600">Total Catering Cost</Label>
                        <div className="flex items-center gap-1 mt-1 h-10 px-3 bg-green-100 rounded-md">
                            <IndianRupee className="w-4 h-4 text-green-700" />
                            <span className="font-bold text-green-700">
                                {(totalCost / 100000).toFixed(1)}L
                            </span>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}
