'use client'

import { useClientIntake } from '@/components/providers/client-intake-provider'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { ArrowRight, ArrowLeft, Sparkles, Users } from 'lucide-react'

const SERVICES = [
    { id: 'makeup', name: 'Makeup & Hair', icon: '💄', desc: 'Bridal/Party makeup' },
    { id: 'mehendi', name: 'Mehendi', icon: '🖐️', desc: 'Henna artist' },
    { id: 'anchor', name: 'Anchor/Host', icon: '🎤', desc: 'Event MC' },
    { id: 'valet', name: 'Valet Parking', icon: '🚗', desc: 'Car parking service' },
    { id: 'transport', name: 'Guest Transport', icon: '🚌', desc: 'Buses, cars' },
    { id: 'pandit', name: 'Pandit/Priest', icon: '🙏', desc: 'Religious ceremony' },
    { id: 'fireworks', name: 'Fireworks', icon: '🎆', desc: 'Pyro effects' },
    { id: 'dhol', name: 'Dhol/Band', icon: '🥁', desc: 'Baraat dhol' },
]

export function Tab8Services() {
    const { data, updateServices, goToTab } = useClientIntake()

    const toggleService = (serviceId: keyof typeof data.services) => {
        if (typeof data.services[serviceId] === 'boolean') {
            updateServices({ [serviceId]: !data.services[serviceId] })
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
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 text-white mb-4">
                    <Sparkles className="w-7 h-7" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Additional Services
                </h1>
                <p className="text-gray-500">
                    Complete your event with these extras
                </p>
            </div>

            <div className="space-y-6">
                {/* Services Grid */}
                <div className="space-y-2">
                    <Label className="font-semibold">Select Services Needed</Label>
                    <div className="grid grid-cols-4 gap-3">
                        {SERVICES.map((service) => {
                            const isSelected = data.services[service.id as keyof typeof data.services] === true
                            return (
                                <button
                                    key={service.id}
                                    onClick={() => toggleService(service.id as keyof typeof data.services)}
                                    className={`p-3 rounded-xl border-2 text-center transition-all ${isSelected
                                        ? 'border-green-500 bg-green-50 shadow-md scale-105'
                                        : 'border-gray-200 hover:border-green-300'
                                        }`}
                                >
                                    <div className="text-2xl">{service.icon}</div>
                                    <div className="font-medium text-xs mt-1">{service.name}</div>
                                    <div className="text-[10px] text-gray-500">{service.desc}</div>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Staff Requirements */}
                <div className="space-y-3">
                    <Label className="font-semibold flex items-center gap-2">
                        <Users className="w-4 h-4" /> Staff & Workers Needed
                    </Label>
                    <Card className="p-4 bg-gray-50">
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span>Estimated Staff Count</span>
                                    <span className="font-bold text-indigo-600">{data.services.staffCount || 0} people</span>
                                </div>
                                <Slider
                                    value={data.services.staffCount || 0}
                                    onValueChange={(val) => updateServices({ staffCount: val })}
                                    max={100}
                                    min={0}
                                    step={5}
                                />
                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                    <span>0</span>
                                    <span>50</span>
                                    <span>100+</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500">
                                Includes waiters, helpers, coordinators, security, etc.
                            </p>
                        </div>
                    </Card>
                </div>

                {/* Furniture Requirements */}
                <div className="space-y-2">
                    <Label className="font-semibold">Furniture & Setup Needs</Label>
                    <Textarea
                        placeholder="e.g., Round tables for 500 guests, 50 sofas for lounge, tent/shamiyana setup, baraati chairs..."
                        value={data.services.furnitureNeeds}
                        onChange={(e) => updateServices({ furnitureNeeds: e.target.value })}
                        rows={2}
                        className="resize-none"
                    />
                </div>

                {/* Special Requests */}
                <div className="space-y-2">
                    <Label className="font-semibold">Other Requirements</Label>
                    <Textarea
                        placeholder="Any other services or specific requirements not listed above..."
                        value={data.services.specialRequests}
                        onChange={(e) => updateServices({ specialRequests: e.target.value })}
                        rows={2}
                        className="resize-none"
                    />
                </div>

                {/* Summary */}
                {(Object.values(data.services).some(v => v === true) || data.services.staffCount > 0) && (
                    <Card className="p-3 bg-green-50 border-green-200">
                        <div className="text-sm text-green-700">
                            <span className="font-medium">Selected: </span>
                            {SERVICES.filter(s => data.services[s.id as keyof typeof data.services] === true)
                                .map(s => s.name).join(', ') || 'None'}
                            {data.services.staffCount > 0 && ` • ${data.services.staffCount} staff`}
                        </div>
                    </Card>
                )}

                {/* Navigation */}
                <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={handleBack} className="h-12 px-6 gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </Button>
                    <Button
                        onClick={handleContinue}
                        className="flex-1 h-12 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 gap-2"
                    >
                        Browse All Vendors <ArrowRight className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </Card>
    )
}
