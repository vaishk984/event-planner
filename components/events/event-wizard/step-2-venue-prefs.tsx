'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Check, MapPin, Building, Trees, Sparkles, Store } from 'lucide-react'
import { EventPlan } from '@/lib/types/event-plan'
import { ShowroomPreview } from './showroom-preview'

interface Step2Props {
    data: EventPlan['venue']
    updateData: (data: Partial<EventPlan['venue']>) => void
}

const VENUE_TYPES = [
    { id: 'indoor', name: 'Indoor', description: 'Banquet halls, hotels', icon: Building },
    { id: 'outdoor', name: 'Outdoor', description: 'Lawns, farmhouses', icon: Trees },
    { id: 'both', name: 'Both/Flexible', description: 'Indoor + outdoor areas', icon: Sparkles },
]

const CITIES = [
    'Mumbai', 'Delhi NCR', 'Bangalore', 'Hyderabad', 'Chennai',
    'Kolkata', 'Pune', 'Jaipur', 'Udaipur', 'Goa', 'Other'
]

const CAPACITY_RANGES = [
    { id: 'small', label: 'Intimate (50-150)', min: 50, max: 150 },
    { id: 'medium', label: 'Medium (150-400)', min: 150, max: 400 },
    { id: 'large', label: 'Large (400-800)', min: 400, max: 800 },
    { id: 'grand', label: 'Grand (800+)', min: 800, max: 2000 },
]

export function Step2VenuePrefs({ data, updateData }: Step2Props) {
    const [likedVenues, setLikedVenues] = useState<string[]>([])

    const handleVenueLike = (vendorId: string) => {
        setLikedVenues(prev =>
            prev.includes(vendorId)
                ? prev.filter(id => id !== vendorId)
                : [...prev, vendorId]
        )
    }

    return (
        <div className="space-y-6">
            {/* Venue Type Preference */}
            <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Venue Type Preference
                </Label>
                <p className="text-sm text-gray-500">What type of venue does the client prefer?</p>
                <div className="grid grid-cols-3 gap-4">
                    {VENUE_TYPES.map((type) => {
                        const Icon = type.icon
                        const isSelected = data.type === type.id
                        return (
                            <button
                                key={type.id}
                                onClick={() => updateData({ type: type.id as any })}
                                className={`p-5 rounded-xl border-2 text-center transition-all ${isSelected
                                    ? 'border-indigo-500 bg-indigo-50 shadow-md'
                                    : 'border-gray-200 hover:border-indigo-300'
                                    }`}
                            >
                                <Icon className={`w-8 h-8 mx-auto mb-2 ${isSelected ? 'text-indigo-600' : 'text-gray-400'}`} />
                                <div className="font-medium">{type.name}</div>
                                <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Preferred City */}
            <div className="space-y-3">
                <Label className="text-base font-semibold">Preferred Location/City</Label>
                <div className="flex flex-wrap gap-2">
                    {CITIES.map((city) => (
                        <button
                            key={city}
                            onClick={() => updateData({ venueCity: city })}
                            className={`px-4 py-2 rounded-full text-sm transition-all ${data.venueCity === city
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {city}
                        </button>
                    ))}
                </div>
            </div>

            {/* Capacity Range */}
            <div className="space-y-3">
                <Label className="text-base font-semibold">Expected Capacity</Label>
                <p className="text-sm text-gray-500">Based on guest count, what size venue is needed?</p>
                <div className="grid grid-cols-4 gap-3">
                    {CAPACITY_RANGES.map((range) => {
                        const isSelected = data.capacity >= range.min && data.capacity <= range.max
                        return (
                            <button
                                key={range.id}
                                onClick={() => updateData({ capacity: range.max })}
                                className={`p-4 rounded-xl border-2 text-center transition-all ${isSelected
                                    ? 'border-indigo-500 bg-indigo-50'
                                    : 'border-gray-200 hover:border-indigo-300'
                                    }`}
                            >
                                <div className="text-sm font-medium">{range.label}</div>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Showroom Preview - Venues */}
            <Card className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
                <div className="flex items-center gap-2 mb-3">
                    <Store className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-semibold text-indigo-700">Show Client: Available Venues</h3>
                </div>
                <ShowroomPreview
                    category="venue"
                    title="Our Partner Venues"
                    onSelectVendor={handleVenueLike}
                    selectedVendorIds={likedVenues}
                    filterCity={data.venueCity !== 'Other' ? data.venueCity : undefined}
                />
                {likedVenues.length > 0 && (
                    <div className="mt-3 p-2 bg-green-50 rounded text-sm text-green-700">
                        ✓ Client liked {likedVenues.length} venue(s) - noted for design phase
                    </div>
                )}
            </Card>

            {/* Special Requirements */}
            <div className="space-y-3">
                <Label className="text-base font-semibold">Venue Requirements & Constraints</Label>
                <Textarea
                    placeholder="Note any special requirements...
e.g., Wheelchair accessibility needed, must have parking for 100+ cars, prefer heritage property, need in-house catering, etc."
                    value={data.logisticsNotes || ''}
                    onChange={(e) => updateData({ logisticsNotes: e.target.value })}
                    rows={3}
                    className="resize-none"
                />
            </div>

            {/* Summary Card */}
            <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="flex items-center gap-2 text-blue-700 mb-2">
                    <Check className="w-5 h-5" />
                    <span className="font-medium">Venue Preferences Captured</span>
                </div>
                <div className="text-sm text-blue-600 grid grid-cols-3 gap-2">
                    <div>Type: <span className="font-medium capitalize">{data.type || 'Not set'}</span></div>
                    <div>City: <span className="font-medium">{data.venueCity || 'Not set'}</span></div>
                    <div>Liked: <span className="font-medium">{likedVenues.length} venues</span></div>
                </div>
            </Card>
        </div>
    )
}

