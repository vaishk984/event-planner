'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Plus, X, IndianRupee, Camera, Music } from 'lucide-react'
import { EventPlan, PHOTOGRAPHY_PACKAGES } from '@/lib/types/event-plan'

interface Step5Props {
    data: EventPlan['entertainment']
    updateData: (data: Partial<EventPlan['entertainment']>) => void
}

const ENTERTAINMENT_TYPES = [
    { id: 'dj', name: 'DJ', description: 'Electronic dance music', icon: '🎧', defaultCost: 75000 },
    { id: 'live_band', name: 'Live Band', description: 'Live musicians', icon: '🎸', defaultCost: 150000 },
    { id: 'cultural', name: 'Cultural', description: 'Traditional performances', icon: '💃', defaultCost: 100000 },
    { id: 'none', name: 'None', description: 'No entertainment needed', icon: '🔇', defaultCost: 0 },
]

const ADDITIONAL_SERVICES = [
    { id: 'makeup', name: 'Makeup Artist', icon: '💄', defaultCost: 50000 },
    { id: 'mehendi', name: 'Mehendi Artist', icon: '🖐️', defaultCost: 25000 },
    { id: 'anchor', name: 'Event Anchor', icon: '🎤', defaultCost: 40000 },
    { id: 'valet', name: 'Valet Parking', icon: '🚗', defaultCost: 30000 },
    { id: 'fireworks', name: 'Fireworks', icon: '🎆', defaultCost: 75000 },
    { id: 'transport', name: 'Guest Transport', icon: '🚌', defaultCost: 100000 },
]

export function Step5Entertainment({ data, updateData }: Step5Props) {
    const [newServiceName, setNewServiceName] = useState('')
    const [newServiceCost, setNewServiceCost] = useState('')

    const selectEntertainment = (type: typeof ENTERTAINMENT_TYPES[0]) => {
        updateData({
            entertainmentType: type.id as any,
            entertainmentCost: type.defaultCost
        })
    }

    const selectPhotography = (pkg: typeof PHOTOGRAPHY_PACKAGES[0]) => {
        updateData({
            photographyPackage: pkg.id as any,
            photographyCost: pkg.price
        })
    }

    const toggleService = (service: typeof ADDITIONAL_SERVICES[0]) => {
        const current = data.additionalServices || []
        const exists = current.find(s => s.name === service.name)

        if (exists) {
            updateData({
                additionalServices: current.filter(s => s.name !== service.name)
            })
        } else {
            updateData({
                additionalServices: [...current, { name: service.name, cost: service.defaultCost }]
            })
        }
    }

    const addCustomService = () => {
        if (newServiceName.trim()) {
            updateData({
                additionalServices: [
                    ...(data.additionalServices || []),
                    { name: newServiceName.trim(), cost: parseInt(newServiceCost) || 0 }
                ]
            })
            setNewServiceName('')
            setNewServiceCost('')
        }
    }

    const totalAdditionalCost = data.additionalServices?.reduce((sum, s) => sum + s.cost, 0) || 0

    return (
        <div className="space-y-6">
            {/* Entertainment Type */}
            <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                    <Music className="w-4 h-4" /> Entertainment
                </Label>
                <div className="grid grid-cols-4 gap-3">
                    {ENTERTAINMENT_TYPES.map((type) => (
                        <button
                            key={type.id}
                            onClick={() => selectEntertainment(type)}
                            className={`p-4 rounded-xl border-2 text-center transition-all ${data.entertainmentType === type.id
                                    ? 'border-indigo-500 bg-indigo-50 shadow-md'
                                    : 'border-gray-200 hover:border-indigo-300'
                                }`}
                        >
                            <div className="text-2xl mb-1">{type.icon}</div>
                            <div className="text-sm font-medium">{type.name}</div>
                            {type.defaultCost > 0 && (
                                <div className="text-xs text-gray-500 mt-1">
                                    ₹{(type.defaultCost / 1000)}K
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Photography Package */}
            <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                    <Camera className="w-4 h-4" /> Photography & Videography
                </Label>
                <div className="grid grid-cols-3 gap-3">
                    {PHOTOGRAPHY_PACKAGES.map((pkg) => (
                        <Card
                            key={pkg.id}
                            onClick={() => selectPhotography(pkg)}
                            className={`p-4 cursor-pointer transition-all ${data.photographyPackage === pkg.id
                                    ? 'ring-2 ring-indigo-500 bg-indigo-50'
                                    : 'hover:shadow-md'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold">{pkg.name}</h4>
                                {data.photographyPackage === pkg.id && (
                                    <Check className="w-5 h-5 text-indigo-600" />
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mb-2">{pkg.description}</p>
                            <div className="text-lg font-bold text-indigo-600">
                                ₹{(pkg.price / 1000)}K
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Additional Services */}
            <div className="space-y-3">
                <Label className="text-base font-semibold">Additional Services</Label>
                <div className="grid grid-cols-3 gap-3">
                    {ADDITIONAL_SERVICES.map((service) => {
                        const isSelected = data.additionalServices?.some(s => s.name === service.name)
                        return (
                            <button
                                key={service.id}
                                onClick={() => toggleService(service)}
                                className={`p-3 rounded-xl border-2 text-left transition-all ${isSelected
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-gray-200 hover:border-green-300'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xl">{service.icon}</span>
                                    {isSelected && <Check className="w-4 h-4 text-green-600" />}
                                </div>
                                <div className="text-sm font-medium mt-1">{service.name}</div>
                                <div className="text-xs text-gray-500">₹{(service.defaultCost / 1000)}K</div>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Custom Service */}
            <Card className="p-4">
                <Label className="text-sm font-medium mb-2 block">Add Custom Service</Label>
                <div className="flex gap-2">
                    <Input
                        placeholder="Service name"
                        value={newServiceName}
                        onChange={(e) => setNewServiceName(e.target.value)}
                        className="flex-1"
                    />
                    <Input
                        type="number"
                        placeholder="Cost"
                        value={newServiceCost}
                        onChange={(e) => setNewServiceCost(e.target.value)}
                        className="w-32"
                    />
                    <Button onClick={addCustomService} size="icon">
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>
            </Card>

            {/* Summary */}
            <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                <Label className="text-sm font-semibold mb-3 block">Entertainment & Services Summary</Label>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span>Entertainment ({data.entertainmentType})</span>
                        <span className="font-medium">₹{(data.entertainmentCost / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Photography ({data.photographyPackage})</span>
                        <span className="font-medium">₹{(data.photographyCost / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Additional Services ({data.additionalServices?.length || 0})</span>
                        <span className="font-medium">₹{(totalAdditionalCost / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold text-indigo-700">
                        <span>Total</span>
                        <span>₹{((data.entertainmentCost + data.photographyCost + totalAdditionalCost) / 100000).toFixed(2)}L</span>
                    </div>
                </div>
            </Card>
        </div>
    )
}
