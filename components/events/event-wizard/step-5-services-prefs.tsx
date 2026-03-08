'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Check, Music, Camera, Sparkles, Store } from 'lucide-react'
import { EventPlan } from '@/lib/types/event-plan'
import { ShowroomPreview } from './showroom-preview'

interface Step5Props {
    data: EventPlan['entertainment']
    updateData: (data: Partial<EventPlan['entertainment']>) => void
}

const ENTERTAINMENT_PREFS = [
    { id: 'dj', name: 'DJ', icon: '🎧' },
    { id: 'live_band', name: 'Live Band', icon: '🎸' },
    { id: 'cultural', name: 'Cultural', icon: '💃' },
    { id: 'none', name: 'None', icon: '🔇' },
]

const PHOTOGRAPHY_NEEDS = [
    { id: 'basic', name: 'Basic', desc: '1 photographer' },
    { id: 'premium', name: 'Full', desc: 'Photo + Video' },
    { id: 'luxury', name: 'Premium', desc: 'Drone + Album' },
    { id: 'none', name: 'Client', desc: 'Arranging own' },
]

const ADDITIONAL_SERVICES = [
    { id: 'makeup', name: 'Makeup', icon: '💄' },
    { id: 'mehendi', name: 'Mehendi', icon: '🖐️' },
    { id: 'anchor', name: 'Anchor', icon: '🎤' },
    { id: 'valet', name: 'Valet', icon: '🚗' },
    { id: 'transport', name: 'Transport', icon: '🚌' },
    { id: 'pandit', name: 'Pandit', icon: '🙏' },
    { id: 'fireworks', name: 'Pyro', icon: '🎆' },
    { id: 'dhol', name: 'Dhol', icon: '🥁' },
]

export function Step5ServicesPrefs({ data, updateData }: Step5Props) {
    const [likedPhotographers, setLikedPhotographers] = useState<string[]>([])
    const [likedEntertainers, setLikedEntertainers] = useState<string[]>([])

    const toggleService = (serviceId: string) => {
        const current = data.additionalServices || []
        const exists = current.find(s => s.name === serviceId)
        if (exists) {
            updateData({ additionalServices: current.filter(s => s.name !== serviceId) })
        } else {
            updateData({ additionalServices: [...current, { name: serviceId, cost: 0 }] })
        }
    }

    const handlePhotoLike = (vendorId: string) => {
        setLikedPhotographers(prev =>
            prev.includes(vendorId)
                ? prev.filter(id => id !== vendorId)
                : [...prev, vendorId]
        )
    }

    const handleEntertainmentLike = (vendorId: string) => {
        setLikedEntertainers(prev =>
            prev.includes(vendorId)
                ? prev.filter(id => id !== vendorId)
                : [...prev, vendorId]
        )
    }

    return (
        <div className="space-y-5">
            {/* Entertainment & Photography in grid */}
            <div className="grid grid-cols-2 gap-4">
                {/* Entertainment Preference */}
                <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                        <Music className="w-4 h-4" /> Entertainment
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                        {ENTERTAINMENT_PREFS.map((pref) => (
                            <button
                                key={pref.id}
                                onClick={() => updateData({ entertainmentType: pref.id as any })}
                                className={`p-2 rounded-lg border-2 text-center transition-all ${data.entertainmentType === pref.id
                                    ? 'border-purple-500 bg-purple-50'
                                    : 'border-gray-200 hover:border-purple-300'
                                    }`}
                            >
                                <span className="text-lg">{pref.icon}</span>
                                <span className="text-xs ml-1">{pref.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Photography Needs */}
                <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                        <Camera className="w-4 h-4" /> Photography
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                        {PHOTOGRAPHY_NEEDS.map((level) => (
                            <button
                                key={level.id}
                                onClick={() => updateData({ photographyPackage: level.id as any })}
                                className={`p-2 rounded-lg border-2 text-center transition-all ${data.photographyPackage === level.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-blue-300'
                                    }`}
                            >
                                <div className="text-xs font-medium">{level.name}</div>
                                <div className="text-[10px] text-gray-500">{level.desc}</div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Additional Services */}
            <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Additional Services Needed
                </Label>
                <div className="grid grid-cols-8 gap-2">
                    {ADDITIONAL_SERVICES.map((service) => {
                        const isSelected = data.additionalServices?.some(s => s.name === service.id)
                        return (
                            <button
                                key={service.id}
                                onClick={() => toggleService(service.id)}
                                className={`p-2 rounded-lg border-2 text-center transition-all ${isSelected
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-200 hover:border-green-300'
                                    }`}
                            >
                                <div className="text-lg">{service.icon}</div>
                                <div className="text-[10px] font-medium">{service.name}</div>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Showroom Preview - Photography */}
            <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                    <Store className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-700">Show Client: Photographers & Videographers</h3>
                </div>
                <ShowroomPreview
                    category="photography"
                    title="Photography Partners"
                    onSelectVendor={handlePhotoLike}
                    selectedVendorIds={likedPhotographers}
                />
                {likedPhotographers.length > 0 && (
                    <div className="mt-2 text-xs text-green-700">
                        ✓ {likedPhotographers.length} photographer(s) liked
                    </div>
                )}
            </Card>

            {/* Showroom Preview - Entertainment */}
            <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                    <Store className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-purple-700">Show Client: DJs & Entertainment</h3>
                </div>
                <ShowroomPreview
                    category="entertainment"
                    title="Entertainment Partners"
                    onSelectVendor={handleEntertainmentLike}
                    selectedVendorIds={likedEntertainers}
                />
                {likedEntertainers.length > 0 && (
                    <div className="mt-2 text-xs text-green-700">
                        ✓ {likedEntertainers.length} entertainer(s) liked
                    </div>
                )}
            </Card>

            {/* Special Notes */}
            <div className="space-y-2">
                <Label className="text-sm font-semibold">Special Requests</Label>
                <Textarea
                    placeholder="e.g., Live ghazal during dinner, Telugu anchor, candid photography style..."
                    rows={2}
                    className="resize-none"
                />
            </div>

            {/* Summary Card */}
            <Card className="p-3 bg-purple-50 border-purple-200">
                <div className="flex items-center gap-2 text-purple-700">
                    <Check className="w-4 h-4" />
                    <span className="text-sm">
                        <span className="font-medium capitalize">{data.entertainmentType || 'Entertainment'}</span> •
                        <span className="font-medium capitalize"> {data.photographyPackage || 'Photo'}</span> •
                        <span className="font-medium"> {data.additionalServices?.length || 0} services</span> •
                        <span className="font-medium"> {likedPhotographers.length + likedEntertainers.length}</span> vendors liked
                    </span>
                </div>
            </Card>
        </div>
    )
}

