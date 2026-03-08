'use client'

import { useClientIntake } from '@/components/providers/client-intake-provider'
import { CategoryShowroom } from '@/components/client-portal/category-showroom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ArrowRight, ArrowLeft, Music } from 'lucide-react'

const ENTERTAINMENT_TYPES = [
    { id: 'dj', name: 'DJ', icon: '🎧', desc: 'Modern beats' },
    { id: 'live_band', name: 'Live Band', icon: '🎸', desc: 'Live music' },
    { id: 'cultural', name: 'Cultural', icon: '💃', desc: 'Traditional' },
    { id: 'none', name: 'None/Own', icon: '🔇', desc: 'Arranging own' },
]

const GENRES = ['Bollywood', 'Sufi', 'Classical', 'Western', 'Retro', 'Punjabi', 'Regional']

const SOUND_LEVELS = [
    { id: 'moderate', name: 'Moderate', desc: 'Conversational-friendly' },
    { id: 'loud', name: 'Loud', desc: 'Dance floor energy' },
    { id: 'concert', name: 'Concert', desc: 'Full blast party' },
]

const PERFORMANCES = [
    { id: 'dhol', name: 'Dhol', icon: '🥁' },
    { id: 'dance_troupe', name: 'Dance Troupe', icon: '💃' },
    { id: 'singer', name: 'Singer', icon: '🎤' },
    { id: 'comedian', name: 'Comedian', icon: '🎭' },
    { id: 'magician', name: 'Magician', icon: '🪄' },
    { id: 'fireworks', name: 'Fireworks', icon: '🎆' },
]

export function Tab6Entertainment() {
    const { data, updateEntertainment, toggleCategoryLikedVendor, goToTab } = useClientIntake()

    const toggleGenre = (genre: string) => {
        const current = data.entertainment.genres
        if (current.includes(genre)) {
            updateEntertainment({ genres: current.filter(g => g !== genre) })
        } else {
            updateEntertainment({ genres: [...current, genre] })
        }
    }

    const togglePerformance = (perf: string) => {
        const current = data.entertainment.performances
        if (current.includes(perf)) {
            updateEntertainment({ performances: current.filter(p => p !== perf) })
        } else {
            updateEntertainment({ performances: [...current, perf] })
        }
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
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white mb-4">
                    <Music className="w-7 h-7" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Music & Entertainment
                </h1>
                <p className="text-gray-500">
                    Set the vibe for your celebration
                </p>
            </div>

            <div className="space-y-5">
                {/* Entertainment Type */}
                <div className="space-y-2">
                    <Label className="font-semibold">Entertainment Type</Label>
                    <div className="grid grid-cols-4 gap-3">
                        {ENTERTAINMENT_TYPES.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => updateEntertainment({ type: type.id as any })}
                                className={`p-4 rounded-xl border-2 text-center transition-all ${data.entertainment.type === type.id
                                    ? 'border-purple-500 bg-purple-50 shadow-md scale-105'
                                    : 'border-gray-200 hover:border-purple-300'
                                    }`}
                            >
                                <div className="text-2xl">{type.icon}</div>
                                <div className="font-medium mt-1">{type.name}</div>
                                <div className="text-xs text-gray-500">{type.desc}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Music Genres */}
                <div className="space-y-2">
                    <Label className="font-semibold">Music Genres Preferred</Label>
                    <div className="flex flex-wrap gap-2">
                        {GENRES.map((genre) => (
                            <button
                                key={genre}
                                onClick={() => toggleGenre(genre)}
                                className={`px-4 py-2 rounded-full text-sm transition-all ${data.entertainment.genres.includes(genre)
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                🎵 {genre}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sound Level */}
                <div className="space-y-2">
                    <Label className="font-semibold">Sound Level</Label>
                    <div className="grid grid-cols-3 gap-3">
                        {SOUND_LEVELS.map((level) => (
                            <button
                                key={level.id}
                                onClick={() => updateEntertainment({ soundLevel: level.id as any })}
                                className={`p-3 rounded-lg border-2 text-center transition-all ${data.entertainment.soundLevel === level.id
                                    ? 'border-pink-500 bg-pink-50'
                                    : 'border-gray-200 hover:border-pink-300'
                                    }`}
                            >
                                <div className="font-medium">{level.name}</div>
                                <div className="text-xs text-gray-500">{level.desc}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Special Performances */}
                <div className="space-y-2">
                    <Label className="font-semibold">Special Performances Needed</Label>
                    <div className="grid grid-cols-6 gap-2">
                        {PERFORMANCES.map((perf) => {
                            const isSelected = data.entertainment.performances.includes(perf.id)
                            return (
                                <button
                                    key={perf.id}
                                    onClick={() => togglePerformance(perf.id)}
                                    className={`p-2 rounded-lg border-2 text-center transition-all ${isSelected
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-gray-200 hover:border-green-300'
                                        }`}
                                >
                                    <div className="text-lg">{perf.icon}</div>
                                    <div className="text-[10px] font-medium">{perf.name}</div>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Showroom Preview */}
                <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                    <CategoryShowroom
                        category="entertainment"
                        title="Browse DJs & Entertainment"
                        likedVendors={data.entertainment.likedVendors}
                        onToggleLike={(id) => toggleCategoryLikedVendor('entertainment', id)}
                    />
                </Card>

                {/* Special Requests */}
                <div className="space-y-2">
                    <Label className="font-semibold">Special Requests</Label>
                    <Textarea
                        placeholder="e.g., Specific songs, live ghazal during dinner, regional artists..."
                        value={data.entertainment.specialRequests}
                        onChange={(e) => updateEntertainment({ specialRequests: e.target.value })}
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
                        Continue to Photography <ArrowRight className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </Card>
    )
}
