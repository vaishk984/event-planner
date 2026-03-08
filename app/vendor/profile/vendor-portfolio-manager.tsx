'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Camera, Plus, Trash2, X, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { updateVendorProfile } from '@/lib/actions/vendor-actions'
import type { Vendor } from '@/types/domain'

interface VendorPortfolioManagerProps {
    vendor: Vendor
}

export function VendorPortfolioManager({ vendor }: VendorPortfolioManagerProps) {
    const [portfolio, setPortfolio] = useState<string[]>(vendor.portfolio || [])
    const [newUrl, setNewUrl] = useState('')
    const [saving, setSaving] = useState(false)
    const [isAdding, setIsAdding] = useState(false)

    // Handle adding a new image URL
    const handleAddImage = () => {
        if (!newUrl.trim()) return

        // Basic URL validation
        if (!newUrl.startsWith('http') && !newUrl.startsWith('/')) {
            toast.error('Please enter a valid URL (starting with http:// or /)')
            return
        }

        const updatedPortfolio = [...portfolio, newUrl.trim()]
        setPortfolio(updatedPortfolio)
        setNewUrl('')
        setIsAdding(false)

        // Auto-save on add
        savePortfolio(updatedPortfolio)
    }

    // Handle removing an image
    const handleRemoveImage = (index: number) => {
        const updatedPortfolio = portfolio.filter((_, i) => i !== index)
        setPortfolio(updatedPortfolio)

        // Auto-save on remove
        savePortfolio(updatedPortfolio)
    }

    // Save changes to backend
    const savePortfolio = async (updatedPortfolio: string[]) => {
        setSaving(true)
        try {
            const result = await updateVendorProfile({
                portfolio: updatedPortfolio
            })

            if (result.success) {
                toast.success('Portfolio updated')
            } else {
                toast.error(result.error || 'Failed to update portfolio')
                // Revert local state on failure
                setPortfolio(vendor.portfolio || [])
            }
        } catch (error) {
            toast.error('Error saving portfolio')
            setPortfolio(vendor.portfolio || [])
        } finally {
            setSaving(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Portfolio Gallery</CardTitle>
                        <CardDescription>Showcase your best work to potential clients</CardDescription>
                    </div>
                    {!isAdding && (
                        <Button onClick={() => setIsAdding(true)} size="sm">
                            <Plus className="w-4 h-4 mr-2" /> Add Photos
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {/* Add Image Input */}
                {isAdding && (
                    <div className="mb-6 p-4 border rounded-lg bg-gray-50 flex gap-2 items-center">
                        <Camera className="w-5 h-5 text-gray-500" />
                        <Input
                            value={newUrl}
                            onChange={e => setNewUrl(e.target.value)}
                            placeholder="Enter image URL (e.g. key work link)"
                            className="flex-1"
                            onKeyDown={e => e.key === 'Enter' && handleAddImage()}
                            autoFocus
                        />
                        <Button onClick={handleAddImage} disabled={saving}>Add</Button>
                        <Button variant="ghost" size="icon" onClick={() => setIsAdding(false)}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                )}

                {/* Empty State */}
                {portfolio.length === 0 && !isAdding && (
                    <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-xl">
                        <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="font-medium">No portfolio images yet</p>
                        <p className="text-sm mt-1">Add photos to attract more clients</p>
                        <Button variant="outline" className="mt-4" onClick={() => setIsAdding(true)}>
                            <Plus className="w-4 h-4 mr-2" /> Add First Photo
                        </Button>
                    </div>
                )}

                {/* Image Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {portfolio.map((url, idx) => (
                        <div key={idx} className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 border">
                            <img
                                src={url}
                                alt={`Portfolio ${idx + 1}`}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=Image+Error'
                                }}
                            />

                            {/* Overlay Actions */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleRemoveImage(idx)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
