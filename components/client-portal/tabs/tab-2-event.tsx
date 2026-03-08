'use client'

import { useClientIntake } from '@/components/providers/client-intake-provider'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
    ArrowRight, ArrowLeft, Calendar, Heart, Cake, Building2,
    Baby, GraduationCap, PartyPopper, MapPin, Users, Home, Store, IndianRupee, Clock
} from 'lucide-react'
import { AvailabilityIndicator } from '@/components/client-portal/availability-indicator'

const EVENT_TYPES = [
    { id: 'wedding', label: 'Wedding', icon: Heart },
    { id: 'birthday', label: 'Birthday', icon: Cake },
    { id: 'corporate', label: 'Corporate', icon: Building2 },
    { id: 'baby_shower', label: 'Baby Shower', icon: Baby },
    { id: 'graduation', label: 'Graduation', icon: GraduationCap },
    { id: 'anniversary', label: 'Anniversary', icon: PartyPopper },
]

const CITIES = [
    'Mumbai', 'Delhi NCR', 'Bangalore', 'Jaipur', 'Udaipur', 'Goa',
    'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Other'
]

// Format budget display
function formatBudget(value: number): string {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`
    return `₹${(value / 100000).toFixed(1)}L`
}

// Convert slider value (0-100) to budget (1L to 1Cr)
function sliderToBudget(value: number): number {
    // Logarithmic scale: 0 = 1L, 100 = 1Cr
    const minLog = Math.log(100000)
    const maxLog = Math.log(10000000)
    return Math.round(Math.exp(minLog + (value / 100) * (maxLog - minLog)))
}

// Convert budget to slider value
function budgetToSlider(budget: number): number {
    const minLog = Math.log(100000)
    const maxLog = Math.log(10000000)
    return Math.round(((Math.log(budget) - minLog) / (maxLog - minLog)) * 100)
}

export function Tab2Event() {
    const { data, updateData, goToTab } = useClientIntake()

    const canProceed = data.eventType && data.city && data.venueType

    // Budget slider value (0-100)
    const budgetSlider = budgetToSlider(data.budgetMin || 1000000)

    const handleBudgetChange = (value: number) => {
        const budget = sliderToBudget(value)
        updateData('budgetMin', budget)
        updateData('budgetMax', budget * 1.5) // Set max as 1.5x of selected
    }

    const handleContinue = () => {
        if (canProceed) {
            // If personal venue, go to venue photos (tab 3)
            // If showroom venue, skip to food (tab 3 in short flow)
            goToTab(3)
        }
    }

    // Handle date suggestion from availability indicator
    const handleSuggestDate = (date: string) => {
        updateData('eventDate', date)
    }

    return (
        <Card className="p-6 bg-white/80 backdrop-blur shadow-xl border-0">
            {/* Header */}
            <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white mb-4">
                    <Calendar className="w-7 h-7" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Tell Us About Your Event
                </h1>
                <p className="text-gray-500">
                    Hi {data.clientName.split(' ')[0]}! What are we celebrating?
                </p>
            </div>

            <div className="space-y-6 max-w-lg mx-auto">
                {/* Event Type */}
                <div className="space-y-3">
                    <Label className="text-gray-700">What type of event? *</Label>
                    <div className="grid grid-cols-3 gap-3">
                        {EVENT_TYPES.map((type) => {
                            const Icon = type.icon
                            const isSelected = data.eventType === type.id
                            return (
                                <button
                                    key={type.id}
                                    onClick={() => updateData('eventType', type.id as any)}
                                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${isSelected
                                        ? 'border-pink-500 bg-pink-50 text-pink-600 scale-105 shadow-lg'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <Icon className="w-6 h-6" />
                                    <span className="text-sm font-medium">{type.label}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Date Range - Start & End */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="startDate" className="text-gray-700 flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> Start Date
                        </Label>
                        <Input
                            id="startDate"
                            type="date"
                            value={data.eventDate}
                            onChange={(e) => updateData('eventDate', e.target.value)}
                            className="h-11"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="endDate" className="text-gray-700 flex items-center gap-2">
                            <Clock className="w-4 h-4" /> End Date
                        </Label>
                        <Input
                            id="endDate"
                            type="date"
                            value={data.eventEndDate}
                            onChange={(e) => updateData('eventEndDate', e.target.value)}
                            min={data.eventDate}
                            className="h-11"
                        />
                    </div>
                </div>

                {/* Availability Indicator - E2 Feature */}
                {data.eventDate && (
                    <AvailabilityIndicator
                        date={data.eventDate}
                        onSuggestDate={handleSuggestDate}
                    />
                )}

                <label className="flex items-center gap-2 text-sm text-gray-500 -mt-2">
                    <input
                        type="checkbox"
                        checked={data.isDateFlexible}
                        onChange={(e) => updateData('isDateFlexible', e.target.checked)}
                        className="rounded"
                    />
                    Dates are flexible
                </label>

                {/* Guest Count & Budget */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Guest Count Card */}
                    <Card className="p-4 bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
                        <Label className="text-indigo-600 flex items-center gap-2 text-sm font-medium">
                            <Users className="w-4 h-4" /> Guest Count
                        </Label>
                        <div className="text-3xl font-bold text-indigo-600 my-2">
                            {data.guestCount}
                        </div>
                        <Slider
                            value={data.guestCount}
                            onValueChange={(val) => updateData('guestCount', val)}
                            max={2000}
                            min={50}
                            step={10}
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>50</span>
                            <span>2000</span>
                        </div>
                    </Card>

                    {/* Budget Card */}
                    <Card className="p-4 bg-gradient-to-br from-green-50 to-white border-green-100">
                        <Label className="text-green-600 flex items-center gap-2 text-sm font-medium">
                            <IndianRupee className="w-4 h-4" /> Budget
                        </Label>
                        <div className="text-3xl font-bold text-green-600 my-2">
                            {formatBudget(data.budgetMin || 1000000)}
                        </div>
                        <Slider
                            value={budgetSlider}
                            onValueChange={handleBudgetChange}
                            max={100}
                            min={0}
                            step={1}
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>₹1L</span>
                            <span>₹1Cr</span>
                        </div>
                    </Card>
                </div>

                {/* City */}
                <div className="space-y-3">
                    <Label className="text-gray-700 flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> City *
                    </Label>
                    <div className="flex flex-wrap gap-2">
                        {CITIES.map((city) => {
                            const isSelected = data.city === city
                            return (
                                <button
                                    key={city}
                                    onClick={() => updateData('city', city)}
                                    className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${isSelected
                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    {city}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Venue Type */}
                <div className="space-y-3">
                    <Label className="text-gray-700">Venue *</Label>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => updateData('venueType', 'personal')}
                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${data.venueType === 'personal'
                                ? 'border-green-500 bg-green-50 text-green-700 shadow-lg'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <Home className="w-8 h-8" />
                            <div className="text-center">
                                <div className="font-medium">I have a venue</div>
                                <div className="text-xs text-gray-500">Home, farmhouse, etc.</div>
                            </div>
                        </button>

                        <button
                            onClick={() => updateData('venueType', 'showroom')}
                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${data.venueType === 'showroom'
                                ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-lg'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <Store className="w-8 h-8" />
                            <div className="text-center">
                                <div className="font-medium">Help me find one</div>
                                <div className="text-xs text-gray-500">Browse venue options</div>
                            </div>
                        </button>
                    </div>
                    {data.venueType === 'personal' && (
                        <p className="text-sm text-green-600 text-center animate-in fade-in">
                            ✓ Great! We'll ask for photos in the next step
                        </p>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex gap-3 pt-4">
                    <Button
                        variant="outline"
                        onClick={() => goToTab(1)}
                        className="h-12 px-6 gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </Button>
                    <Button
                        onClick={handleContinue}
                        disabled={!canProceed}
                        className="flex-1 h-12 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 gap-2"
                    >
                        Continue <ArrowRight className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </Card>
    )
}
