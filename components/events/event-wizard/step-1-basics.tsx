'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Card } from '@/components/ui/card'
import { IndianRupee, Users, Calendar, MessageSquare } from 'lucide-react'
import { EventPlan } from '@/lib/types/event-plan'

interface Step1Props {
    data: EventPlan['basics']
    updateData: (data: Partial<EventPlan['basics']>) => void
}

const EVENT_TYPES = [
    { id: 'wedding', name: 'Wedding', emoji: '💒' },
    { id: 'corporate', name: 'Corporate', emoji: '🏢' },
    { id: 'birthday', name: 'Birthday', emoji: '🎂' },
    { id: 'anniversary', name: 'Anniversary', emoji: '💝' },
    { id: 'other', name: 'Other', emoji: '🎉' },
]

export function Step1Basics({ data, updateData }: Step1Props) {
    return (
        <div className="space-y-6">
            {/* Event Name */}
            <div className="space-y-2">
                <Label htmlFor="eventName" className="text-base font-semibold">
                    Event Name
                </Label>
                <Input
                    id="eventName"
                    placeholder="e.g., Sharma Wedding Reception"
                    value={data.eventName}
                    onChange={(e) => updateData({ eventName: e.target.value })}
                    className="text-lg h-12"
                />
            </div>

            {/* Event Type Selection */}
            <div className="space-y-3">
                <Label className="text-base font-semibold">Event Type</Label>
                <div className="grid grid-cols-5 gap-3">
                    {EVENT_TYPES.map((type) => (
                        <button
                            key={type.id}
                            onClick={() => updateData({ eventType: type.id as any })}
                            className={`p-4 rounded-xl border-2 transition-all text-center ${data.eventType === type.id
                                ? 'border-indigo-500 bg-indigo-50 shadow-md'
                                : 'border-gray-200 hover:border-indigo-300'
                                }`}
                        >
                            <div className="text-2xl mb-1">{type.emoji}</div>
                            <div className="text-sm font-medium">{type.name}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="eventDate" className="text-base font-semibold flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Event Date
                    </Label>
                    <Input
                        id="eventDate"
                        type="date"
                        value={data.eventDate}
                        onChange={(e) => updateData({ eventDate: e.target.value })}
                        className="h-12"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="eventTime" className="text-base font-semibold">
                        Start Time
                    </Label>
                    <Input
                        id="eventTime"
                        type="time"
                        value={data.eventTime}
                        onChange={(e) => updateData({ eventTime: e.target.value })}
                        className="h-12"
                    />
                </div>
            </div>

            {/* Guest Count & Budget */}
            <div className="grid grid-cols-2 gap-6">
                {/* Guest Count */}
                <Card className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Users className="w-5 h-5 text-indigo-600" />
                        <Label className="text-base font-semibold">Guest Count</Label>
                    </div>
                    <div className="text-4xl font-bold text-indigo-600 mb-3">
                        {data.guestCount}
                    </div>
                    <Slider
                        value={data.guestCount}
                        onValueChange={(value) => updateData({ guestCount: value })}
                        min={50}
                        max={2000}
                        step={50}
                        className="my-4"
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                        <span>50</span>
                        <span>2000</span>
                    </div>
                </Card>

                {/* Budget */}
                <Card className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <IndianRupee className="w-5 h-5 text-green-600" />
                        <Label className="text-base font-semibold">Budget</Label>
                    </div>
                    <div className="text-4xl font-bold text-green-600 mb-3">
                        ₹{(data.budget / 100000).toFixed(1)}L
                    </div>
                    <Slider
                        value={data.budget}
                        onValueChange={(value) => updateData({ budget: value })}
                        min={100000}
                        max={10000000}
                        step={100000}
                        className="my-4"
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                        <span>₹1L</span>
                        <span>₹1Cr</span>
                    </div>
                </Card>
            </div>

            {/* Client Vision */}
            <div className="space-y-2">
                <Label htmlFor="clientVision" className="text-base font-semibold flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Client's Vision
                </Label>
                <p className="text-sm text-gray-500">
                    Capture the client's dreams, must-haves, and special requests from your consultation
                </p>
                <Textarea
                    id="clientVision"
                    placeholder="e.g., The client wants a royal Rajasthani theme with lots of marigolds. They specifically mentioned wanting a live ghazal performance during dinner. The bride's favorite color is magenta..."
                    value={data.clientVision}
                    onChange={(e) => updateData({ clientVision: e.target.value })}
                    rows={4}
                    className="resize-none"
                />
            </div>
        </div>
    )
}
