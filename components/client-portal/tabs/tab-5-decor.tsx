'use client'

import { useState } from 'react'
import { useClientIntake } from '@/components/providers/client-intake-provider'
import { CategoryShowroom } from '@/components/client-portal/category-showroom'
import { InspirationGallery } from '@/components/client-portal/inspiration-gallery'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ArrowRight, ArrowLeft, Palette, Flower2 } from 'lucide-react'

const STYLES = [
    { id: 'traditional', name: 'Traditional', emoji: '🏛️', desc: 'Classic, timeless' },
    { id: 'modern', name: 'Modern', emoji: '✨', desc: 'Sleek, contemporary' },
    { id: 'fusion', name: 'Fusion', emoji: '🎭', desc: 'Best of both' },
    { id: 'luxury', name: 'Luxury', emoji: '👑', desc: 'Grand, opulent' },
    { id: 'rustic', name: 'Rustic', emoji: '🌿', desc: 'Natural, earthy' },
    { id: 'bohemian', name: 'Bohemian', emoji: '🎨', desc: 'Artistic, free' },
]

const COLOR_MOODS = [
    { id: 'warm', name: 'Warm', colors: ['#ef4444', '#f97316', '#eab308'] },
    { id: 'cool', name: 'Cool', colors: ['#3b82f6', '#06b6d4', '#8b5cf6'] },
    { id: 'pastel', name: 'Pastel', colors: ['#fce7f3', '#dbeafe', '#dcfce7'] },
    { id: 'bold', name: 'Bold', colors: ['#dc2626', '#0d9488', '#7c3aed'] },
    { id: 'gold', name: 'Gold & Royal', colors: ['#d97706', '#fbbf24', '#fef3c7'] },
]

const INTENSITIES = [
    { id: 'minimal', name: 'Minimal', desc: 'Less is more' },
    { id: 'moderate', name: 'Moderate', desc: 'Balanced' },
    { id: 'grand', name: 'Grand', desc: 'Elaborate' },
    { id: 'maximum', name: 'Maximum', desc: 'Show-stopping' },
]

const FLOWERS = ['Marigold', 'Roses', 'Orchids', 'Lilies', 'Jasmine', 'Lotus', 'Mixed']

const LIGHTING = [
    { id: 'fairy_lights', name: 'Fairy Lights', emoji: '✨' },
    { id: 'chandeliers', name: 'Chandeliers', emoji: '💎' },
    { id: 'minimal', name: 'Minimal', emoji: '💡' },
    { id: 'dramatic', name: 'Dramatic', emoji: '🔦' },
]

export function Tab5Decor() {
    const { data, updateDecor, toggleCategoryLikedVendor, goToTab } = useClientIntake()
    const [likedInspirations, setLikedInspirations] = useState<string[]>([])

    const toggleFlower = (flower: string) => {
        const current = data.decor.flowers
        if (current.includes(flower)) {
            updateDecor({ flowers: current.filter(f => f !== flower) })
        } else {
            updateDecor({ flowers: [...current, flower] })
        }
    }

    const toggleInspiration = (imageId: string) => {
        setLikedInspirations(prev =>
            prev.includes(imageId)
                ? prev.filter(id => id !== imageId)
                : [...prev, imageId]
        )
    }

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
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 text-white mb-4">
                    <Palette className="w-7 h-7" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Decor & Theme
                </h1>
                <p className="text-gray-500">
                    Design the perfect ambiance for your event
                </p>
            </div>

            <div className="space-y-5">
                {/* Inspiration Gallery - B2 Feature */}
                <InspirationGallery
                    onLike={toggleInspiration}
                    likedImages={likedInspirations}
                    selectedStyle={data.decor.style}
                />
                {/* Style Preference */}
                <div className="space-y-2">
                    <Label className="font-semibold">Style Preference</Label>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                        {STYLES.map((style) => (
                            <button
                                key={style.id}
                                onClick={() => updateDecor({ style: style.id as any })}
                                className={`p-3 rounded-xl border-2 text-center transition-all ${data.decor.style === style.id
                                    ? 'border-purple-500 bg-purple-50 shadow-md scale-105'
                                    : 'border-gray-200 hover:border-purple-300'
                                    }`}
                            >
                                <div className="text-xl">{style.emoji}</div>
                                <div className="text-xs font-medium mt-1">{style.name}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Color Mood */}
                <div className="space-y-2">
                    <Label className="font-semibold">Color Mood</Label>
                    <div className="grid grid-cols-5 gap-2">
                        {COLOR_MOODS.map((mood) => (
                            <button
                                key={mood.id}
                                onClick={() => updateDecor({ colorMood: mood.id as any })}
                                className={`p-3 rounded-xl border-2 text-center transition-all ${data.decor.colorMood === mood.id
                                    ? 'border-pink-500 bg-pink-50 shadow-md'
                                    : 'border-gray-200 hover:border-pink-300'
                                    }`}
                            >
                                <div className="flex gap-0.5 justify-center mb-1">
                                    {mood.colors.map((color, i) => (
                                        <div key={i} className="w-4 h-4 rounded-full border" style={{ backgroundColor: color }} />
                                    ))}
                                </div>
                                <div className="text-xs font-medium">{mood.name}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Intensity & Lighting */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="font-semibold">Decor Intensity</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {INTENSITIES.map((level) => (
                                <button
                                    key={level.id}
                                    onClick={() => updateDecor({ intensity: level.id as any })}
                                    className={`p-2 rounded-lg border-2 text-center transition-all ${data.decor.intensity === level.id
                                        ? 'border-purple-500 bg-purple-50'
                                        : 'border-gray-200 hover:border-purple-300'
                                        }`}
                                >
                                    <div className="text-sm font-medium">{level.name}</div>
                                    <div className="text-xs text-gray-500">{level.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="font-semibold">Lighting Style</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {LIGHTING.map((light) => (
                                <button
                                    key={light.id}
                                    onClick={() => updateDecor({ lighting: light.id as any })}
                                    className={`p-2 rounded-lg border-2 text-center transition-all ${data.decor.lighting === light.id
                                        ? 'border-amber-500 bg-amber-50'
                                        : 'border-gray-200 hover:border-amber-300'
                                        }`}
                                >
                                    <span className="text-lg">{light.emoji}</span>
                                    <div className="text-xs font-medium">{light.name}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Flower Preferences */}
                <div className="space-y-2">
                    <Label className="font-semibold flex items-center gap-2">
                        <Flower2 className="w-4 h-4" /> Flower Preferences
                    </Label>
                    <div className="flex flex-wrap gap-2">
                        {FLOWERS.map((flower) => (
                            <button
                                key={flower}
                                onClick={() => toggleFlower(flower)}
                                className={`px-3 py-1.5 rounded-full text-sm transition-all ${data.decor.flowers.includes(flower)
                                    ? 'bg-pink-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                🌸 {flower}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Showroom Preview */}
                <Card className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
                    <CategoryShowroom
                        category="decor"
                        title="Browse Decorators"
                        likedVendors={data.decor.likedVendors}
                        onToggleLike={(id) => toggleCategoryLikedVendor('decor', id)}
                    />
                </Card>

                {/* Special Requests */}
                <div className="space-y-2">
                    <Label className="font-semibold">Special Decor Requests</Label>
                    <Textarea
                        placeholder="e.g., Swing (jhula) for photos, specific entrance design, mandap style, stage preferences..."
                        value={data.decor.specialRequests}
                        onChange={(e) => updateDecor({ specialRequests: e.target.value })}
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
                        Continue to Music <ArrowRight className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </Card>
    )
}
