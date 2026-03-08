'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Check, Palette } from 'lucide-react'
import { EventPlan, THEME_OPTIONS, DECOR_STYLES, COLOR_PALETTES } from '@/lib/types/event-plan'

interface Step3Props {
    data: EventPlan['themeDecor']
    updateData: (data: Partial<EventPlan['themeDecor']>) => void
}

export function Step3ThemeDecor({ data, updateData }: Step3Props) {
    const [selectedPalette, setSelectedPalette] = useState<string | null>(null)

    const selectPalette = (palette: typeof COLOR_PALETTES[0]) => {
        setSelectedPalette(palette.name)
        updateData({ colorPalette: palette.colors })
    }

    return (
        <div className="space-y-6">
            {/* Theme Selection */}
            <div className="space-y-3">
                <Label className="text-base font-semibold">Event Theme</Label>
                <div className="grid grid-cols-3 gap-3">
                    {THEME_OPTIONS.map((theme) => (
                        <button
                            key={theme.id}
                            onClick={() => updateData({ themeName: theme.name })}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${data.themeName === theme.name
                                    ? 'border-indigo-500 bg-indigo-50 shadow-md'
                                    : 'border-gray-200 hover:border-indigo-300'
                                }`}
                        >
                            <h4 className="font-semibold text-gray-900">{theme.name}</h4>
                            <p className="text-xs text-gray-500 mt-1">{theme.description}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Color Palette */}
            <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                    <Palette className="w-4 h-4" /> Color Palette
                </Label>
                <div className="grid grid-cols-3 gap-3">
                    {COLOR_PALETTES.map((palette) => (
                        <Card
                            key={palette.name}
                            onClick={() => selectPalette(palette)}
                            className={`p-3 cursor-pointer transition-all ${selectedPalette === palette.name ||
                                    JSON.stringify(data.colorPalette) === JSON.stringify(palette.colors)
                                    ? 'ring-2 ring-indigo-500'
                                    : 'hover:shadow-md'
                                }`}
                        >
                            <div className="flex gap-1 mb-2">
                                {palette.colors.map((color, idx) => (
                                    <div
                                        key={idx}
                                        className="w-8 h-8 rounded-full border border-white shadow"
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                            <span className="text-xs font-medium text-gray-700">{palette.name}</span>
                        </Card>
                    ))}
                </div>

                {/* Custom Color Display */}
                <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-gray-500">Selected:</span>
                    <div className="flex gap-1">
                        {data.colorPalette.map((color, idx) => (
                            <div
                                key={idx}
                                className="w-6 h-6 rounded-full border-2 border-white shadow"
                                style={{ backgroundColor: color }}
                                title={color}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Decor Style */}
            <div className="space-y-3">
                <Label className="text-base font-semibold">Decor Style</Label>
                <div className="flex gap-3">
                    {DECOR_STYLES.map((style) => (
                        <button
                            key={style.id}
                            onClick={() => updateData({ decorStyle: style.id as any })}
                            className={`flex-1 p-4 rounded-xl border-2 text-center transition-all ${data.decorStyle === style.id
                                    ? 'border-indigo-500 bg-indigo-50 shadow-md'
                                    : 'border-gray-200 hover:border-indigo-300'
                                }`}
                        >
                            <div className="text-2xl mb-1">{style.icon}</div>
                            <div className="text-sm font-medium">{style.name}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Decor Description */}
            <div className="space-y-2">
                <Label className="text-base font-semibold">Decor Description</Label>
                <p className="text-sm text-gray-500">
                    Describe the decor vision in detail - entry arch, stage design, table settings, etc.
                </p>
                <Textarea
                    placeholder="e.g., Grand entrance arch with white and blush pink roses, mandap with floating flowers, circular seating arrangement with gold chiavari chairs, crystal chandeliers, LED fairy light ceiling..."
                    value={data.decorDescription}
                    onChange={(e) => updateData({ decorDescription: e.target.value })}
                    rows={4}
                />
            </div>

            {/* Mood Board Placeholder */}
            <div className="space-y-2">
                <Label className="text-base font-semibold">Mood Board</Label>
                <Card className="p-8 border-2 border-dashed border-gray-300 text-center">
                    <div className="text-4xl mb-2">📸</div>
                    <p className="text-gray-500">Drag & drop reference images here</p>
                    <p className="text-xs text-gray-400 mt-1">(Coming soon)</p>
                </Card>
            </div>
        </div>
    )
}
