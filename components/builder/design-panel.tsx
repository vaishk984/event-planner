'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Palette, Image, Plus, X, ChevronRight, Sparkles
} from 'lucide-react'
import type { Event } from '@/types/domain'

interface DesignPanelProps {
    event: Event
    design: {
        moodboard: string[]
        colors: string[]
        notes: string
    }
    onUpdateDesign: (design: { moodboard: string[]; colors: string[]; notes: string }) => void
    onNext: () => void
}

const PRESET_COLORS = [
    '#D4AF37', // Gold
    '#8B0000', // Dark Red
    '#FFFAF0', // Floral White
    '#228B22', // Forest Green
    '#4169E1', // Royal Blue
    '#9370DB', // Medium Purple
    '#FF69B4', // Hot Pink
    '#20B2AA', // Light Sea Green
    '#F4A460', // Sandy Brown
    '#2F4F4F', // Dark Slate Gray
]

const THEME_SUGGESTIONS = [
    { name: 'Royal Rajasthani', colors: ['#D4AF37', '#8B0000', '#FFFAF0'] },
    { name: 'Modern Minimalist', colors: ['#FFFFFF', '#000000', '#808080'] },
    { name: 'Garden Romance', colors: ['#228B22', '#FF69B4', '#FFFAF0'] },
    { name: 'Beach Bliss', colors: ['#20B2AA', '#F4A460', '#87CEEB'] },
    { name: 'Vintage Elegance', colors: ['#D2691E', '#8B4513', '#FAEBD7'] },
]

export function DesignPanel({ event, design, onUpdateDesign, onNext }: DesignPanelProps) {
    const [newColor, setNewColor] = useState('#D4AF37')

    const addColor = (color: string) => {
        if (!design.colors.includes(color) && design.colors.length < 5) {
            onUpdateDesign({
                ...design,
                colors: [...design.colors, color]
            })
        }
    }

    const removeColor = (color: string) => {
        onUpdateDesign({
            ...design,
            colors: design.colors.filter(c => c !== color)
        })
    }

    const applyTheme = (theme: typeof THEME_SUGGESTIONS[0]) => {
        onUpdateDesign({
            ...design,
            colors: theme.colors,
            notes: design.notes || `${theme.name} theme inspired design`
        })
    }

    const updateNotes = (notes: string) => {
        onUpdateDesign({ ...design, notes })
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Design Studio</h2>
                    <p className="text-sm text-gray-500">Define the visual identity of this event</p>
                </div>
                <Button onClick={onNext} className="bg-orange-500 hover:bg-orange-600">
                    Continue to Package <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column - Color Palette */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                <Palette className="w-4 h-4" /> Color Palette
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Selected Colors */}
                            <div className="mb-4">
                                <p className="text-xs text-gray-400 mb-2">Selected Colors ({design.colors.length}/5)</p>
                                <div className="flex flex-wrap gap-2">
                                    {design.colors.map(color => (
                                        <div
                                            key={color}
                                            className="relative group"
                                        >
                                            <div
                                                className="w-12 h-12 rounded-lg border-2 border-white shadow-md"
                                                style={{ backgroundColor: color }}
                                            />
                                            <button
                                                onClick={() => removeColor(color)}
                                                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                            <p className="text-[10px] text-gray-400 text-center mt-1">{color}</p>
                                        </div>
                                    ))}
                                    {design.colors.length < 5 && (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={newColor}
                                                onChange={e => setNewColor(e.target.value)}
                                                className="w-12 h-12 rounded-lg cursor-pointer"
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => addColor(newColor)}
                                            >
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Preset Colors */}
                            <div>
                                <p className="text-xs text-gray-400 mb-2">Quick Add</p>
                                <div className="flex flex-wrap gap-2">
                                    {PRESET_COLORS.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => addColor(color)}
                                            disabled={design.colors.includes(color)}
                                            className={`w-8 h-8 rounded-lg border-2 transition-all ${design.colors.includes(color)
                                                    ? 'border-green-500 opacity-50'
                                                    : 'border-transparent hover:scale-110'
                                                }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Theme Suggestions */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                <Sparkles className="w-4 h-4" /> Theme Suggestions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {THEME_SUGGESTIONS.map(theme => (
                                    <button
                                        key={theme.name}
                                        onClick={() => applyTheme(theme)}
                                        className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex gap-1">
                                            {theme.colors.map(color => (
                                                <div
                                                    key={color}
                                                    className="w-6 h-6 rounded"
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                        <span className="font-medium text-sm">{theme.name}</span>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Vision Notes & Moodboard */}
                <div className="space-y-6">
                    {/* Theme Notes */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Theme & Vision Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                placeholder="Describe the vision for this event... 

Example: Royal Rajasthani theme with warm gold accents. Marigold flowers throughout. Traditional mandap with modern lighting. Elegant but not over-the-top."
                                value={design.notes}
                                onChange={e => updateNotes(e.target.value)}
                                className="min-h-[150px]"
                            />
                        </CardContent>
                    </Card>

                    {/* Moodboard Placeholder */}
                    <Card className="border-dashed border-2">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                <Image className="w-4 h-4" /> Moodboard
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div
                                        key={i}
                                        className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center"
                                    >
                                        <Image className="w-6 h-6 text-gray-300" />
                                    </div>
                                ))}
                            </div>
                            <Button variant="outline" className="w-full">
                                <Plus className="w-4 h-4 mr-2" /> Add Inspiration Images
                            </Button>
                            <p className="text-xs text-gray-400 text-center mt-2">
                                (Image upload coming in next version)
                            </p>
                        </CardContent>
                    </Card>

                    {/* Color Preview */}
                    {design.colors.length > 0 && (
                        <Card className="overflow-hidden">
                            <div
                                className="h-24 flex"
                                style={{
                                    background: `linear-gradient(90deg, ${design.colors.join(', ')})`
                                }}
                            />
                            <CardContent className="py-3">
                                <p className="text-sm text-center text-gray-500">Color Palette Preview</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
