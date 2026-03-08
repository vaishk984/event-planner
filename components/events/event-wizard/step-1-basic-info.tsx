'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { BudgetMeter } from '@/components/events/budget/budget-meter'
import { useState } from 'react'

interface Step1Props {
    data: any
    updateData: (data: any) => void
}

export function Step1BasicInfo({ data, updateData }: Step1Props) {
    // Local state for immediate UI feedback before syncing with parent
    const [budget, setBudget] = useState(data.budget || 500000)

    // Using a fixed "allocated" amount for now to demonstrate the meter 
    // In later steps, this will calculate based on selected services
    const estimatedAllocation = Math.round(budget * 0.3) // Mock 30% allocated initially

    const handleBudgetChange = (value: number) => {
        setBudget(value)
        updateData({ ...data, budget: value })
    }

    const incrementGuests = () => {
        const current = Number(data.guestCount) || 50
        updateData({ ...data, guestCount: current + 10 })
    }

    const decrementGuests = () => {
        const current = Number(data.guestCount) || 50
        if (current > 10) {
            updateData({ ...data, guestCount: current - 10 })
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
                <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Event Basics
                </h3>
                <p className="text-sm text-gray-500">
                    Let's define the core parameters of the event to initialize the planning engine.
                </p>
            </div>

            {/* Smart Budget Meter - Top Placement */}
            <BudgetMeter
                totalBudget={budget}
                allocated={estimatedAllocation}
                className="bg-indigo-50/50 border border-indigo-100"
            />

            <div className="grid gap-6">
                {/* Event Name & Type */}
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="name">Event Name</Label>
                        <Input
                            id="name"
                            value={data.name || ''}
                            onChange={(e) => updateData({ ...data, name: e.target.value })}
                            placeholder="e.g. Sharma Wedding 2025"
                            className="bg-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="eventType">Event Type</Label>
                        <select
                            id="eventType"
                            value={data.eventType || ''}
                            onChange={(e) => updateData({ ...data, eventType: e.target.value })}
                            className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                            <option value="">Select Category</option>
                            <optgroup label="Social Events">
                                <option value="wedding">Wedding</option>
                                <option value="engagement">Engagement</option>
                                <option value="birthday">Birthday Party</option>
                                <option value="anniversary">Anniversary</option>
                            </optgroup>
                            <optgroup label="Corporate Events">
                                <option value="conference">Conference</option>
                                <option value="seminar">Seminar</option>
                                <option value="annual_function">Annual Function</option>
                            </optgroup>
                        </select>
                    </div>
                </div>

                {/* Date & Location */}
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="eventDate">Event Date</Label>
                        <Input
                            id="eventDate"
                            type="date"
                            value={data.eventDate || ''}
                            onChange={(e) => updateData({ ...data, eventDate: e.target.value })}
                            className="bg-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Location / City</Label>
                        <Input
                            placeholder="e.g. Mumbai, Delhi"
                            className="bg-white"
                            value={data.location || ''}
                            onChange={(e) => updateData({ ...data, location: e.target.value })}
                        />
                    </div>
                </div>

                {/* Budget Slider */}
                <div className="space-y-4 pt-2">
                    <div className="flex justify-between items-center">
                        <Label>Estimated Total Budget</Label>
                        <span className="text-indigo-600 font-bold text-lg">
                            ₹{budget.toLocaleString()}
                        </span>
                    </div>
                    <Slider
                        min={100000}
                        max={5000000}
                        step={50000}
                        value={budget}
                        onValueChange={handleBudgetChange}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>₹1 Lakh</span>
                        <span>₹50 Lakhs+</span>
                    </div>
                </div>

                {/* Guest Count Counter */}
                <div className="space-y-2">
                    <Label htmlFor="guestCount">Expected Guest Count</Label>
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={decrementGuests}
                            className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 text-lg font-bold text-gray-600 transition-colors bg-white"
                        >
                            -
                        </button>
                        <Input
                            id="guestCount"
                            type="number"
                            value={data.guestCount || ''}
                            onChange={(e) => updateData({ ...data, guestCount: Number(e.target.value) })}
                            placeholder="0"
                            className="text-center font-bold text-lg h-10 w-full bg-white"
                        />
                        <button
                            type="button"
                            onClick={incrementGuests}
                            className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 text-lg font-bold text-gray-600 transition-colors bg-white"
                        >
                            +
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
