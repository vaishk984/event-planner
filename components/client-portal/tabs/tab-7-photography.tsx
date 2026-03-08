'use client'

import { useClientIntake } from '@/components/providers/client-intake-provider'
import { CategoryShowroom } from '@/components/client-portal/category-showroom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ArrowRight, ArrowLeft, Camera, Video, Plane } from 'lucide-react'

const PACKAGES = [
    { id: 'basic', name: 'Basic', desc: '1 photographer', icon: '📷' },
    { id: 'full', name: 'Full Coverage', desc: 'Photo + Video', icon: '🎬' },
    { id: 'premium', name: 'Premium', desc: 'Drone + Album', icon: '✨' },
    { id: 'own', name: 'Own Arrangement', desc: 'Client handles', icon: '🙋' },
]

const STYLES = [
    { id: 'candid', name: 'Candid', desc: 'Natural moments' },
    { id: 'traditional', name: 'Traditional', desc: 'Posed, formal' },
    { id: 'cinematic', name: 'Cinematic', desc: 'Movie-like' },
    { id: 'mixed', name: 'Mixed', desc: 'All styles' },
]

const ALBUM_TYPES = [
    { id: 'digital', name: 'Digital Only', desc: 'Online gallery' },
    { id: 'printed', name: 'Printed Album', desc: 'Physical album' },
    { id: 'premium', name: 'Premium', desc: 'Canvas + Album' },
]

export function Tab7Photography() {
    const { data, updatePhotography, toggleCategoryLikedVendor, goToTab } = useClientIntake()

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
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white mb-4">
                    <Camera className="w-7 h-7" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Photography & Video
                </h1>
                <p className="text-gray-500">
                    Capture memories that last forever
                </p>
            </div>

            <div className="space-y-5">
                {/* Package Level */}
                <div className="space-y-2">
                    <Label className="font-semibold">Package Level</Label>
                    <div className="grid grid-cols-4 gap-3">
                        {PACKAGES.map((pkg) => (
                            <button
                                key={pkg.id}
                                onClick={() => updatePhotography({ package: pkg.id as any })}
                                className={`p-4 rounded-xl border-2 text-center transition-all ${data.photography.package === pkg.id
                                    ? 'border-blue-500 bg-blue-50 shadow-md scale-105'
                                    : 'border-gray-200 hover:border-blue-300'
                                    }`}
                            >
                                <div className="text-2xl">{pkg.icon}</div>
                                <div className="font-medium mt-1">{pkg.name}</div>
                                <div className="text-xs text-gray-500">{pkg.desc}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Style Preference */}
                <div className="space-y-2">
                    <Label className="font-semibold">Style Preference</Label>
                    <div className="grid grid-cols-4 gap-3">
                        {STYLES.map((style) => (
                            <button
                                key={style.id}
                                onClick={() => updatePhotography({ style: style.id as any })}
                                className={`p-3 rounded-lg border-2 text-center transition-all ${data.photography.style === style.id
                                    ? 'border-cyan-500 bg-cyan-50'
                                    : 'border-gray-200 hover:border-cyan-300'
                                    }`}
                            >
                                <div className="font-medium">{style.name}</div>
                                <div className="text-xs text-gray-500">{style.desc}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Extra Options */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <Label className="font-semibold">Additional Options</Label>
                        <div className="space-y-2">
                            <button
                                onClick={() => updatePhotography({ drone: !data.photography.drone })}
                                className={`w-full p-3 rounded-lg border-2 flex items-center gap-3 transition-all ${data.photography.drone
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <Plane className="w-5 h-5" />
                                <div className="text-left flex-1">
                                    <div className="font-medium">Drone Coverage</div>
                                    <div className="text-xs text-gray-500">Aerial shots & videos</div>
                                </div>
                                {data.photography.drone && <span className="text-green-600">✓</span>}
                            </button>

                            <button
                                onClick={() => updatePhotography({ preWedding: !data.photography.preWedding })}
                                className={`w-full p-3 rounded-lg border-2 flex items-center gap-3 transition-all ${data.photography.preWedding
                                    ? 'border-pink-500 bg-pink-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <Video className="w-5 h-5" />
                                <div className="text-left flex-1">
                                    <div className="font-medium">Pre-Event Shoot</div>
                                    <div className="text-xs text-gray-500">Pre-wedding, pre-birthday, etc.</div>
                                </div>
                                {data.photography.preWedding && <span className="text-green-600">✓</span>}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="font-semibold">Album Type</Label>
                        <div className="space-y-2">
                            {ALBUM_TYPES.map((album) => (
                                <button
                                    key={album.id}
                                    onClick={() => updatePhotography({ album: album.id as any })}
                                    className={`w-full p-3 rounded-lg border-2 text-left transition-all ${data.photography.album === album.id
                                        ? 'border-purple-500 bg-purple-50'
                                        : 'border-gray-200 hover:border-purple-300'
                                        }`}
                                >
                                    <div className="font-medium">{album.name}</div>
                                    <div className="text-xs text-gray-500">{album.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Showroom Preview */}
                <Card className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
                    <CategoryShowroom
                        category="photography"
                        title="Browse Photographers"
                        likedVendors={data.photography.likedVendors}
                        onToggleLike={(id) => toggleCategoryLikedVendor('photography', id)}
                    />
                </Card>

                {/* Special Requests */}
                <div className="space-y-2">
                    <Label className="font-semibold">Special Requests</Label>
                    <Textarea
                        placeholder="e.g., Specific poses, locations for pre-shoot, video style preferences..."
                        value={data.photography.specialRequests}
                        onChange={(e) => updatePhotography({ specialRequests: e.target.value })}
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
                        Continue to Services <ArrowRight className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </Card>
    )
}
