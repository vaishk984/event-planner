'use client'

import { useClientIntake, getBudgetFromSlider } from '@/components/providers/client-intake-provider'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
    ArrowRight, ArrowLeft, Palette, IndianRupee, Sparkles
} from 'lucide-react'

const STYLES = [
    { id: 'traditional', label: 'Traditional', emoji: '🏛️', desc: 'Classic, timeless elegance' },
    { id: 'modern', label: 'Modern', emoji: '✨', desc: 'Sleek, contemporary vibes' },
    { id: 'fusion', label: 'Fusion', emoji: '🎭', desc: 'Best of both worlds' },
    { id: 'minimal', label: 'Minimal', emoji: '🌿', desc: 'Simple, elegant beauty' },
]

const COLORS = [
    { id: 'warm', label: 'Warm', colors: ['#ef4444', '#f97316', '#eab308'], desc: 'Reds, oranges, golds' },
    { id: 'cool', label: 'Cool', colors: ['#3b82f6', '#06b6d4', '#8b5cf6'], desc: 'Blues, teals, purples' },
    { id: 'pastel', label: 'Pastel', colors: ['#fce7f3', '#dbeafe', '#dcfce7'], desc: 'Soft, dreamy tones' },
    { id: 'bold', label: 'Bold', colors: ['#dc2626', '#0d9488', '#7c3aed'], desc: 'Vibrant, statement colors' },
]

export function Tab3Style() {
    const { data, updateData, goToTab } = useClientIntake()

    const budgetInfo = getBudgetFromSlider(data.budgetRange)
    const nextTab = data.venueType === 'personal' ? 5 : 4
    const prevTab = data.venueType === 'personal' ? 3 : 2

    const handleContinue = () => {
        goToTab(nextTab)
    }

    return (
        <Card className="p-8 bg-white/80 backdrop-blur shadow-xl border-0">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white mb-4">
                    <Palette className="w-7 h-7" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Your Vision & Style
                </h1>
                <p className="text-gray-500">
                    Help us understand your aesthetic preferences
                </p>
            </div>

            <div className="space-y-8 max-w-lg mx-auto">
                {/* Budget Slider */}
                <div className="space-y-4">
                    <Label className="flex items-center gap-2 text-gray-700">
                        <IndianRupee className="w-4 h-4" /> Budget Comfort Level
                    </Label>
                    <div className="px-4">
                        <Slider
                            value={data.budgetRange}
                            onValueChange={(val) => {
                                updateData('budgetRange', val)
                                const { min, max } = getBudgetFromSlider(val)
                                updateData('budgetMin', min)
                                updateData('budgetMax', max)
                            }}
                            max={100}
                            min={0}
                            step={5}
                        />
                        <div className="flex justify-between text-sm text-gray-400">
                            <span>₹5L</span>
                            <span>₹20L</span>
                            <span>₹50L+</span>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200">
                            <span className="text-lg font-bold text-green-700">{budgetInfo.label}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">This helps us suggest the right vendors</p>
                    </div>
                </div>

                {/* Style Preference */}
                <div className="space-y-3">
                    <Label className="text-gray-700 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> Style Preference
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                        {STYLES.map((style) => {
                            const isSelected = data.stylePreference === style.id
                            return (
                                <button
                                    key={style.id}
                                    onClick={() => updateData('stylePreference', style.id as any)}
                                    className={`p-4 rounded-xl border-2 transition-all text-left ${isSelected
                                        ? 'border-purple-500 bg-purple-50 shadow-lg scale-[1.02]'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="text-2xl mb-1">{style.emoji}</div>
                                    <div className="font-medium">{style.label}</div>
                                    <div className="text-xs text-gray-500">{style.desc}</div>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Color Mood */}
                <div className="space-y-3">
                    <Label className="text-gray-700">Color Mood</Label>
                    <div className="grid grid-cols-2 gap-3">
                        {COLORS.map((color) => {
                            const isSelected = data.colorMood === color.id
                            return (
                                <button
                                    key={color.id}
                                    onClick={() => updateData('colorMood', color.id as any)}
                                    className={`p-3 rounded-xl border-2 transition-all ${isSelected
                                        ? 'border-indigo-500 bg-indigo-50 shadow-lg'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex gap-1 mb-2 justify-center">
                                        {color.colors.map((c, i) => (
                                            <div
                                                key={i}
                                                className="w-6 h-6 rounded-full border border-white shadow"
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                    <div className="font-medium text-sm">{color.label}</div>
                                    <div className="text-xs text-gray-500">{color.desc}</div>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Special Requests */}
                <div className="space-y-2">
                    <Label className="text-gray-700">Any special requests or must-haves?</Label>
                    <Textarea
                        placeholder="e.g., I want a swing (jhula) for photos, prefer marigold decorations, no lilies..."
                        value={data.specialRequests}
                        onChange={(e) => updateData('specialRequests', e.target.value)}
                        rows={4}
                        className="resize-none"
                    />
                </div>

                {/* Navigation */}
                <div className="flex gap-3 pt-4">
                    <Button
                        variant="outline"
                        onClick={() => goToTab(prevTab)}
                        className="h-12 px-6 gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </Button>
                    <Button
                        onClick={handleContinue}
                        className="flex-1 h-12 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 gap-2"
                    >
                        Browse Vendors <ArrowRight className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </Card>
    )
}
