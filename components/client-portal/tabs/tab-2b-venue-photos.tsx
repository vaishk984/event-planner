'use client'

import { useState } from 'react'
import { useClientIntake } from '@/components/providers/client-intake-provider'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CameraCapture } from '@/components/ui/camera-capture'
import {
    ArrowRight, ArrowLeft, Camera, Upload, X, Image as ImageIcon,
    MapPin, Users, Car
} from 'lucide-react'

export function Tab2bVenuePhotos() {
    const { data, updatePersonalVenue, goToTab } = useClientIntake()
    const [isDragging, setIsDragging] = useState(false)
    const [showCamera, setShowCamera] = useState(false)

    const handleSkip = () => {
        updatePersonalVenue({ photosSkipped: true })
        goToTab(4) // Go to Food tab
    }

    const handleContinue = () => {
        goToTab(4) // Go to Food tab
    }

    const handleFileUpload = (files: FileList | null) => {
        if (!files) return
        // In real app, upload to storage and get URLs
        // For now, create preview URLs
        const newPhotos = Array.from(files).map(file => URL.createObjectURL(file))
        updatePersonalVenue({ photos: [...data.personalVenue.photos, ...newPhotos] })
    }

    const handleCameraCapture = (imageData: string) => {
        updatePersonalVenue({ photos: [...data.personalVenue.photos, imageData] })
        setShowCamera(false)
    }

    const removePhoto = (index: number) => {
        const newPhotos = [...data.personalVenue.photos]
        newPhotos.splice(index, 1)
        updatePersonalVenue({ photos: newPhotos })
    }

    // Show camera mode
    if (showCamera) {
        return (
            <Card className="p-4 bg-white/80 backdrop-blur shadow-xl border-0">
                <div className="text-center mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Take Venue Photo</h2>
                    <p className="text-sm text-gray-500">Capture different angles of your venue</p>
                </div>
                <CameraCapture
                    onCapture={handleCameraCapture}
                    onCancel={() => setShowCamera(false)}
                />
            </Card>
        )
    }

    return (
        <Card className="p-8 bg-white/80 backdrop-blur shadow-xl border-0">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 text-white mb-4">
                    <Camera className="w-7 h-7" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Share Your Venue Photos
                </h1>
                <p className="text-gray-500">
                    Help us visualize your beautiful space for event design
                </p>
            </div>

            <div className="space-y-6 max-w-lg mx-auto">
                {/* Photo Upload Area */}
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                        e.preventDefault()
                        setIsDragging(false)
                        handleFileUpload(e.dataTransfer.files)
                    }}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${isDragging
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-gray-400'
                        }`}
                >
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="hidden"
                        id="photo-upload"
                    />

                    {data.personalVenue.photos.length === 0 ? (
                        <div className="space-y-4">
                            <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
                                <ImageIcon className="w-8 h-8 text-gray-400" />
                            </div>
                            <div>
                                <p className="text-gray-600 font-medium">Drag photos here or use options below</p>
                                <p className="text-sm text-gray-400">Include different angles of your venue</p>
                            </div>
                            <div className="flex gap-3 justify-center">
                                <label htmlFor="photo-upload">
                                    <Button type="button" variant="outline" className="gap-2" asChild>
                                        <span><Upload className="w-4 h-4" /> Upload Photos</span>
                                    </Button>
                                </label>
                                <Button
                                    variant="default"
                                    className="gap-2 bg-green-600 hover:bg-green-700"
                                    onClick={() => setShowCamera(true)}
                                >
                                    <Camera className="w-4 h-4" /> Take Photo
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-3">
                                {data.personalVenue.photos.map((photo, index) => (
                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                                        <img src={photo} alt={`Venue ${index + 1}`} className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => removePhoto(index)}
                                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <label htmlFor="photo-upload" className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400">
                                    <Upload className="w-6 h-6 text-gray-400" />
                                </label>
                                <button
                                    onClick={() => setShowCamera(true)}
                                    className="aspect-square border-2 border-dashed border-green-300 bg-green-50 rounded-lg flex items-center justify-center cursor-pointer hover:border-green-400"
                                >
                                    <Camera className="w-6 h-6 text-green-500" />
                                </button>
                            </div>
                            <p className="text-sm text-green-600">✓ {data.personalVenue.photos.length} photos added</p>
                        </div>
                    )}
                </div>

                {/* Venue Details */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                        <Label className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" /> Venue Name
                        </Label>
                        <Input
                            placeholder="e.g., My Farmhouse"
                            value={data.personalVenue.name}
                            onChange={(e) => updatePersonalVenue({ name: e.target.value })}
                            className="h-11"
                        />
                    </div>
                    <div className="space-y-2 col-span-2">
                        <Label>Address</Label>
                        <Input
                            placeholder="Full address for planning"
                            value={data.personalVenue.address}
                            onChange={(e) => updatePersonalVenue({ address: e.target.value })}
                            className="h-11"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Users className="w-4 h-4" /> Capacity
                        </Label>
                        <Input
                            type="number"
                            placeholder="e.g., 200"
                            value={data.personalVenue.capacity || ''}
                            onChange={(e) => updatePersonalVenue({ capacity: parseInt(e.target.value) || 0 })}
                            className="h-11"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Type</Label>
                        <div className="flex gap-2">
                            {['indoor', 'outdoor', 'both'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => updatePersonalVenue({ type: type as any })}
                                    className={`flex-1 py-2 px-3 rounded-lg border text-sm capitalize ${data.personalVenue.type === type
                                        ? 'border-green-500 bg-green-50 text-green-700'
                                        : 'border-gray-200'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Parking */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <Car className="w-4 h-4" /> Parking Available?
                    </Label>
                    <div className="flex gap-2">
                        {[
                            { id: 'yes', label: 'Yes, plenty' },
                            { id: 'limited', label: 'Limited' },
                            { id: 'no', label: 'No parking' }
                        ].map((option) => (
                            <button
                                key={option.id}
                                onClick={() => updatePersonalVenue({ parking: option.id as any })}
                                className={`flex-1 py-2 px-3 rounded-lg border text-sm ${data.personalVenue.parking === option.id
                                    ? 'border-green-500 bg-green-50 text-green-700'
                                    : 'border-gray-200'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Skip Option */}
                <div className="text-center p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <p className="text-sm text-amber-700 mb-2">
                        💡 Don't have photos right now?
                    </p>
                    <Button
                        variant="link"
                        className="text-amber-600"
                        onClick={handleSkip}
                    >
                        Skip & share later via WhatsApp
                    </Button>
                </div>

                {/* Navigation */}
                <div className="flex gap-3 pt-4">
                    <Button
                        variant="outline"
                        onClick={() => goToTab(2)}
                        className="h-12 px-6 gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </Button>
                    <Button
                        onClick={handleContinue}
                        className="flex-1 h-12 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 gap-2"
                    >
                        Continue <ArrowRight className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </Card>
    )
}
