'use client'

import { useClientIntake } from '@/components/providers/client-intake-provider'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowRight, Sparkles, Instagram, Phone, Users, Globe, MessageCircle } from 'lucide-react'
import { DuplicateWarning } from '@/components/client-portal/duplicate-warning'

const SOURCES = [
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
    { id: 'instagram', label: 'Instagram', icon: Instagram },
    { id: 'phone', label: 'Phone Call', icon: Phone },
    { id: 'referral', label: 'Friend/Family', icon: Users },
    { id: 'website', label: 'Website', icon: Globe },
]

export function Tab1Start() {
    const { data, updateData, goToTab } = useClientIntake()

    const canProceed = data.clientName.trim() && data.phone.trim()

    const handleContinue = () => {
        if (canProceed) {
            goToTab(2)
        }
    }

    return (
        <Card className="p-8 bg-white/80 backdrop-blur shadow-xl border-0">
            {/* Welcome Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white mb-4">
                    <Sparkles className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Let's Plan Your Perfect Event!
                </h1>
                <p className="text-gray-500">
                    Tell us a bit about yourself to get started
                </p>
            </div>

            {/* Form */}
            <div className="space-y-6 max-w-md mx-auto">
                {/* Name */}
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700">Your Name *</Label>
                    <Input
                        id="name"
                        placeholder="Enter your full name"
                        value={data.clientName}
                        onChange={(e) => updateData('clientName', e.target.value)}
                        className="h-12 text-lg"
                    />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-700">Phone Number *</Label>
                    <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={data.phone}
                        onChange={(e) => updateData('phone', e.target.value)}
                        className="h-12 text-lg"
                    />
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">Email (Optional)</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={data.email}
                        onChange={(e) => updateData('email', e.target.value)}
                        className="h-12"
                    />
                </div>

                {/* Duplicate Warning - A4 Feature */}
                <DuplicateWarning
                    phone={data.phone}
                    email={data.email}
                    name={data.clientName}
                    eventDate={data.eventDate}
                />

                {/* How did you find us */}
                <div className="space-y-3">
                    <Label className="text-gray-700">How did you find us?</Label>
                    <div className="grid grid-cols-3 gap-2">
                        {SOURCES.map((source) => {
                            const Icon = source.icon
                            const isSelected = data.source === source.id
                            return (
                                <button
                                    key={source.id}
                                    onClick={() => updateData('source', source.id as any)}
                                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${isSelected
                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="text-xs">{source.label}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Continue Button */}
                <Button
                    onClick={handleContinue}
                    disabled={!canProceed}
                    className="w-full h-14 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 gap-2"
                >
                    Continue <ArrowRight className="w-5 h-5" />
                </Button>
            </div>
        </Card>
    )
}

