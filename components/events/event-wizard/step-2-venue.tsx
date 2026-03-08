'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Users, IndianRupee, Check, AlertTriangle, Building2 } from 'lucide-react'
import { EventPlan } from '@/lib/types/event-plan'

interface Step2Props {
    data: EventPlan['venue']
    updateData: (data: Partial<EventPlan['venue']>) => void
    budget: number
    guestCount: number
}

// Mock platform venues
const PLATFORM_VENUES = [
    {
        id: 'v1',
        name: 'Grand Hyatt Ballroom',
        address: 'Bandra Kurla Complex, Mumbai',
        city: 'Mumbai',
        capacity: 1000,
        cost: 500000,
        features: ['AC', 'Parking', 'Catering Kitchen', 'Green Room'],
        image: '🏛️'
    },
    {
        id: 'v2',
        name: 'Taj Lands End',
        address: 'Bandstand, Bandra West',
        city: 'Mumbai',
        capacity: 600,
        cost: 700000,
        features: ['Sea View', 'Valet Parking', 'In-house Decor'],
        image: '🏨'
    },
    {
        id: 'v3',
        name: 'JW Marriott Sahar',
        address: 'Andheri East, Mumbai',
        city: 'Mumbai',
        capacity: 800,
        cost: 450000,
        features: ['Airport Proximity', 'Multiple Halls', 'Lawn Area'],
        image: '🏢'
    },
    {
        id: 'v4',
        name: 'ITC Maratha',
        address: 'Andheri East, Mumbai',
        city: 'Mumbai',
        capacity: 500,
        cost: 550000,
        features: ['Grand Lobby', 'Luxury Rooms', 'Award-winning Chef'],
        image: '🏰'
    },
]

export function Step2Venue({ data, updateData, budget, guestCount }: Step2Props) {
    const [venueType, setVenueType] = useState<'platform' | 'custom'>(data.type || 'platform')

    const selectVenue = (venue: typeof PLATFORM_VENUES[0]) => {
        updateData({
            type: 'platform',
            venueId: venue.id,
            venueName: venue.name,
            venueAddress: venue.address,
            venueCity: venue.city,
            capacity: venue.capacity,
            venueCost: venue.cost,
            venueFeatures: venue.features,
        })
    }

    const budgetPercentage = data.venueCost ? (data.venueCost / budget) * 100 : 0

    return (
        <div className="space-y-6">
            {/* Venue Type Toggle */}
            <div className="flex gap-4">
                <Button
                    variant={venueType === 'platform' ? 'default' : 'outline'}
                    onClick={() => setVenueType('platform')}
                    className="flex-1 h-12"
                >
                    <Building2 className="w-5 h-5 mr-2" />
                    Browse Platform Venues
                </Button>
                <Button
                    variant={venueType === 'custom' ? 'default' : 'outline'}
                    onClick={() => setVenueType('custom')}
                    className="flex-1 h-12"
                >
                    <MapPin className="w-5 h-5 mr-2" />
                    Client's Own Venue
                </Button>
            </div>

            {venueType === 'platform' ? (
                <>
                    {/* Platform Venues Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {PLATFORM_VENUES.map((venue) => {
                            const isSelected = data.venueId === venue.id
                            const capacityOk = venue.capacity >= guestCount
                            const budgetOk = venue.cost <= budget * 0.4 // Max 40% of budget

                            return (
                                <Card
                                    key={venue.id}
                                    className={`p-4 cursor-pointer transition-all ${isSelected
                                            ? 'ring-2 ring-indigo-500 bg-indigo-50'
                                            : 'hover:shadow-md'
                                        }`}
                                    onClick={() => selectVenue(venue)}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="text-3xl">{venue.image}</div>
                                        {isSelected && (
                                            <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                                                <Check className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="font-semibold text-gray-900">{venue.name}</h3>
                                    <p className="text-sm text-gray-500 mb-2">{venue.address}</p>

                                    <div className="flex flex-wrap gap-2 mb-3">
                                        <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${capacityOk ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            <Users className="w-3 h-3" />
                                            {venue.capacity} capacity
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${budgetOk ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            <IndianRupee className="w-3 h-3" />
                                            {(venue.cost / 100000).toFixed(1)}L
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-1">
                                        {venue.features.slice(0, 3).map((f) => (
                                            <span key={f} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                                                {f}
                                            </span>
                                        ))}
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                </>
            ) : (
                /* Custom Venue Form */
                <Card className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Venue Name</Label>
                            <Input
                                placeholder="e.g., Kapoor Family Farmhouse"
                                value={data.venueName}
                                onChange={(e) => updateData({ venueName: e.target.value, type: 'custom' })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>City</Label>
                            <Input
                                placeholder="e.g., Mumbai"
                                value={data.venueCity}
                                onChange={(e) => updateData({ venueCity: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Full Address</Label>
                        <Textarea
                            placeholder="Complete venue address..."
                            value={data.venueAddress}
                            onChange={(e) => updateData({ venueAddress: e.target.value })}
                            rows={2}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Venue Capacity</Label>
                            <Input
                                type="number"
                                placeholder="500"
                                value={data.capacity || ''}
                                onChange={(e) => updateData({ capacity: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Venue Cost (if any)</Label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={data.venueCost || ''}
                                onChange={(e) => updateData({ venueCost: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                    </div>
                </Card>
            )}

            {/* Logistics Notes */}
            <div className="space-y-2">
                <Label className="text-base font-semibold">Logistics Notes</Label>
                <Textarea
                    placeholder="Parking availability, entry restrictions, setup timing, any special requirements..."
                    value={data.logisticsNotes}
                    onChange={(e) => updateData({ logisticsNotes: e.target.value })}
                    rows={3}
                />
            </div>

            {/* Budget Check */}
            {data.venueCost > 0 && (
                <Card className={`p-4 ${budgetPercentage > 40 ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'
                    }`}>
                    <div className="flex items-center gap-2">
                        {budgetPercentage > 40 ? (
                            <AlertTriangle className="w-5 h-5 text-orange-600" />
                        ) : (
                            <Check className="w-5 h-5 text-green-600" />
                        )}
                        <span className={budgetPercentage > 40 ? 'text-orange-700' : 'text-green-700'}>
                            Venue cost is {budgetPercentage.toFixed(0)}% of total budget
                            {budgetPercentage > 40 && ' (Recommended: under 40%)'}
                        </span>
                    </div>
                </Card>
            )}
        </div>
    )
}
