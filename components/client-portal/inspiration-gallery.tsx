'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock inspiration images - in production, these would come from a CMS
const INSPIRATION_IMAGES = {
    traditional: [
        { id: 't1', url: '/api/placeholder/400/300', title: 'Royal Marigold Setup', tags: ['marigold', 'gold', 'mandap'] },
        { id: 't2', url: '/api/placeholder/400/300', title: 'Temple Style Entry', tags: ['traditional', 'flowers', 'bells'] },
        { id: 't3', url: '/api/placeholder/400/300', title: 'Classic Red & Gold', tags: ['red', 'gold', 'elegant'] },
        { id: 't4', url: '/api/placeholder/400/300', title: 'Brass & Flowers', tags: ['brass', 'urlis', 'floating'] },
    ],
    modern: [
        { id: 'm1', url: '/api/placeholder/400/300', title: 'Minimal White', tags: ['white', 'minimal', 'clean'] },
        { id: 'm2', url: '/api/placeholder/400/300', title: 'Geometric Backdrop', tags: ['geometric', 'modern', 'gold'] },
        { id: 'm3', url: '/api/placeholder/400/300', title: 'Neon Signs', tags: ['neon', 'fun', 'colorful'] },
        { id: 'm4', url: '/api/placeholder/400/300', title: 'Industrial Chic', tags: ['industrial', 'rustic', 'modern'] },
    ],
    luxury: [
        { id: 'l1', url: '/api/placeholder/400/300', title: 'Crystal Chandeliers', tags: ['crystal', 'chandelier', 'grand'] },
        { id: 'l2', url: '/api/placeholder/400/300', title: 'All White Florals', tags: ['white', 'roses', 'luxury'] },
        { id: 'l3', url: '/api/placeholder/400/300', title: 'Gold Everything', tags: ['gold', 'opulent', 'royal'] },
        { id: 'l4', url: '/api/placeholder/400/300', title: 'Fairy Lights Canopy', tags: ['lights', 'canopy', 'magical'] },
    ],
    rustic: [
        { id: 'r1', url: '/api/placeholder/400/300', title: 'Barn Style', tags: ['barn', 'wood', 'rustic'] },
        { id: 'r2', url: '/api/placeholder/400/300', title: 'Wildflowers', tags: ['wildflowers', 'natural', 'boho'] },
        { id: 'r3', url: '/api/placeholder/400/300', title: 'Fairy Garden', tags: ['garden', 'fairy', 'whimsical'] },
        { id: 'r4', url: '/api/placeholder/400/300', title: 'Jute & Burlap', tags: ['jute', 'natural', 'eco'] },
    ],
}

interface InspirationGalleryProps {
    onLike: (imageId: string) => void
    likedImages: string[]
    selectedStyle?: string
}

export function InspirationGallery({ onLike, likedImages, selectedStyle }: InspirationGalleryProps) {
    const [activeCategory, setActiveCategory] = useState<string>(selectedStyle || 'traditional')
    const [lightboxImage, setLightboxImage] = useState<string | null>(null)

    const categories = [
        { id: 'traditional', label: 'Traditional', emoji: '🪷' },
        { id: 'modern', label: 'Modern', emoji: '✨' },
        { id: 'luxury', label: 'Luxury', emoji: '👑' },
        { id: 'rustic', label: 'Rustic', emoji: '🌿' },
    ]

    const images = INSPIRATION_IMAGES[activeCategory as keyof typeof INSPIRATION_IMAGES] || []

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-pink-500" />
                    Inspiration Gallery
                </CardTitle>
                <CardDescription>
                    Like images to help us understand your vision ({likedImages.length} liked)
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Category tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {categories.map(cat => (
                        <Button
                            key={cat.id}
                            variant={activeCategory === cat.id ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setActiveCategory(cat.id)}
                            className={activeCategory === cat.id ? 'bg-pink-500 hover:bg-pink-600' : ''}
                        >
                            <span className="mr-1">{cat.emoji}</span> {cat.label}
                        </Button>
                    ))}
                </div>

                {/* Image grid */}
                <div className="grid grid-cols-2 gap-3">
                    {images.map(img => {
                        const isLiked = likedImages.includes(img.id)
                        return (
                            <div
                                key={img.id}
                                className={cn(
                                    "relative group rounded-xl overflow-hidden cursor-pointer border-2 transition-all",
                                    isLiked ? "border-pink-500 shadow-lg shadow-pink-100" : "border-transparent"
                                )}
                                onClick={() => onLike(img.id)}
                            >
                                {/* Placeholder gradient - in production, use real images */}
                                <div className={cn(
                                    "aspect-[4/3] flex items-center justify-center",
                                    activeCategory === 'traditional' && "bg-gradient-to-br from-orange-100 to-amber-200",
                                    activeCategory === 'modern' && "bg-gradient-to-br from-gray-100 to-slate-200",
                                    activeCategory === 'luxury' && "bg-gradient-to-br from-yellow-100 to-amber-300",
                                    activeCategory === 'rustic' && "bg-gradient-to-br from-green-100 to-emerald-200",
                                )}>
                                    <span className="text-4xl">
                                        {activeCategory === 'traditional' && '🪷'}
                                        {activeCategory === 'modern' && '✨'}
                                        {activeCategory === 'luxury' && '👑'}
                                        {activeCategory === 'rustic' && '🌿'}
                                    </span>
                                </div>

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                {/* Title */}
                                <div className="absolute bottom-0 left-0 right-0 p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p className="text-sm font-medium truncate">{img.title}</p>
                                </div>

                                {/* Like button */}
                                <div className={cn(
                                    "absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all",
                                    isLiked
                                        ? "bg-pink-500 text-white"
                                        : "bg-white/80 text-gray-600 opacity-0 group-hover:opacity-100"
                                )}>
                                    <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Liked summary */}
                {likedImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                        <span className="text-sm text-gray-500 mr-2">Liked:</span>
                        {likedImages.slice(0, 5).map(id => (
                            <Badge key={id} variant="secondary" className="gap-1">
                                ❤️ {id}
                                <button
                                    onClick={(e) => { e.stopPropagation(); onLike(id) }}
                                    className="ml-1 hover:text-red-500"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </Badge>
                        ))}
                        {likedImages.length > 5 && (
                            <Badge variant="outline">+{likedImages.length - 5} more</Badge>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
