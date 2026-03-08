'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Check, Palette, Store } from 'lucide-react'
import { EventPlan } from '@/lib/types/event-plan'
import { ShowroomPreview } from './showroom-preview'

interface Step3Props {
    data: EventPlan['themeDecor']
    updateData: (data: Partial<EventPlan['themeDecor']>) => void
}

const STYLE_PREFERENCES = [
    { id: 'modern', name: 'Modern', description: 'Clean, minimal, contemporary', emoji: '✨' },
    { id: 'traditional', name: 'Traditional', description: 'Cultural, classic, timeless', emoji: '🏛️' },
    { id: 'fusion', name: 'Fusion', description: 'Mix of modern & traditional', emoji: '🎭' },
    { id: 'luxury', name: 'Luxury', description: 'Grand, opulent, extravagant', emoji: '👑' },
    { id: 'rustic', name: 'Rustic', description: 'Natural, earthy, organic', emoji: '🌿' },
    { id: 'bohemian', name: 'Bohemian', description: 'Artistic, free-spirited', emoji: '🎨' },
]

const COLOR_MOODS = [
    { id: 'bright', name: 'Bright & Vibrant', colors: ['#ec4899', '#f59e0b', '#10b981'], description: 'Energetic, festive' },
    { id: 'pastel', name: 'Soft & Pastel', colors: ['#fce7f3', '#dbeafe', '#d1fae5'], description: 'Gentle, romantic' },
    { id: 'dark', name: 'Dark & Elegant', colors: ['#1e1b4b', '#3b0764', '#14532d'], description: 'Sophisticated, moody' },
    { id: 'neutral', name: 'Neutral & Classic', colors: ['#f5f5f4', '#d6d3d1', '#a8a29e'], description: 'Timeless, clean' },
    { id: 'gold', name: 'Gold & Royal', colors: ['#d97706', '#fbbf24', '#fef3c7'], description: 'Regal, luxurious' },
    { id: 'custom', name: 'Client Has Colors', colors: [], description: 'Specific colors in mind' },
]

const DECOR_INTENSITY = [
    { id: 'minimal', name: 'Minimal', description: 'Less is more' },
    { id: 'moderate', name: 'Moderate', description: 'Balanced decor' },
    { id: 'grand', name: 'Grand', description: 'Elaborate' },
    { id: 'over_the_top', name: 'Maximum', description: 'Show-stopping' },
]

export function Step3StylePrefs({ data, updateData }: Step3Props) {
    const [likedDecor, setLikedDecor] = useState<string[]>([])

    const handleDecorLike = (vendorId: string) => {
        setLikedDecor(prev =>
            prev.includes(vendorId)
                ? prev.filter(id => id !== vendorId)
                : [...prev, vendorId]
        )
    }

    return (
        <div className="space-y-5">
            {/* Style Preference */}
            <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                    <Palette className="w-4 h-4" /> Style Preference
                </Label>
                <div className="grid grid-cols-6 gap-2">
                    {STYLE_PREFERENCES.map((style) => (
                        <button
                            key={style.id}
                            onClick={() => updateData({ themeName: style.name, decorStyle: style.id as any })}
                            className={`p-3 rounded-xl border-2 text-center transition-all ${data.themeName === style.name
                                ? 'border-indigo-500 bg-indigo-50 shadow-md'
                                : 'border-gray-200 hover:border-indigo-300'
                                }`}
                        >
                            <div className="text-xl">{style.emoji}</div>
                            <div className="text-xs font-medium mt-1">{style.name}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Color Mood */}
            <div className="space-y-3">
                <Label className="text-base font-semibold">Color Mood</Label>
                <div className="grid grid-cols-6 gap-2">
                    {COLOR_MOODS.map((mood) => {
                        const isSelected = data.colorPalette?.toString() === mood.colors.toString()
                        return (
                            <button
                                key={mood.id}
                                onClick={() => updateData({
                                    colorPalette: mood.colors.length > 0 ? mood.colors : data.colorPalette
                                })}
                                className={`p-3 rounded-xl border-2 text-center transition-all ${isSelected
                                    ? 'border-pink-500 bg-pink-50'
                                    : 'border-gray-200 hover:border-pink-300'
                                    }`}
                            >
                                <div className="flex gap-0.5 justify-center mb-1">
                                    {mood.colors.length > 0 ? mood.colors.map((color, i) => (
                                        <div key={i} className="w-4 h-4 rounded-full border" style={{ backgroundColor: color }} />
                                    )) : <div className="text-lg">🎨</div>}
                                </div>
                                <div className="text-xs font-medium">{mood.name}</div>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Decor Intensity */}
            <div className="space-y-3">
                <Label className="text-base font-semibold">Decor Intensity</Label>
                <div className="grid grid-cols-4 gap-3">
                    {DECOR_INTENSITY.map((level) => (
                        <button
                            key={level.id}
                            onClick={() => updateData({ decorStyle: level.id as any })}
                            className={`p-3 rounded-xl border-2 text-center transition-all ${data.decorStyle === level.id
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-purple-300'
                                }`}
                        >
                            <div className="text-sm font-medium">{level.name}</div>
                            <div className="text-xs text-gray-500">{level.description}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Showroom Preview - Decor */}
            <Card className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
                <div className="flex items-center gap-2 mb-3">
                    <Store className="w-5 h-5 text-pink-600" />
                    <h3 className="font-semibold text-pink-700">Show Client: Decor Portfolios</h3>
                </div>
                <ShowroomPreview
                    category="decor"
                    title="Our Decor Partners"
                    onSelectVendor={handleDecorLike}
                    selectedVendorIds={likedDecor}
                />
                {likedDecor.length > 0 && (
                    <div className="mt-3 p-2 bg-green-50 rounded text-sm text-green-700">
                        ✓ Client liked {likedDecor.length} decorator(s) - noted for design phase
                    </div>
                )}
            </Card>

            {/* Special Decor Notes */}
            <div className="space-y-2">
                <Label className="text-sm font-semibold">Specific Decor Requests</Label>
                <Textarea
                    placeholder="e.g., Want lots of marigolds, phoolon ki chaadar, swing for couple..."
                    value={data.decorDescription || ''}
                    onChange={(e) => updateData({ decorDescription: e.target.value })}
                    rows={2}
                    className="resize-none"
                />
            </div>

            {/* Summary Card */}
            <Card className="p-3 bg-pink-50 border-pink-200">
                <div className="flex items-center gap-2 text-pink-700">
                    <Check className="w-4 h-4" />
                    <span className="text-sm">
                        <span className="font-medium">{data.themeName || 'Style'}</span> •
                        <span className="font-medium capitalize"> {data.decorStyle || 'moderate'}</span> decor •
                        <span className="font-medium"> {likedDecor.length}</span> liked
                    </span>
                </div>
            </Card>
        </div>
    )
}

