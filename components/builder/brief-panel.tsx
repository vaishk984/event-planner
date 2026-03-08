'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Calendar, Users, MapPin, IndianRupee, Phone, Mail,
    Palette, Utensils, AlertCircle, ChevronRight, Image
} from 'lucide-react'
import type { Event, Intake } from '@/types/domain'

interface BriefPanelProps {
    event: Event
    intake: any // Using any for flexible mock data structure
    onNext: () => void
}

export function BriefPanel({ event, intake, onNext }: BriefPanelProps) {
    const budget = event.budgetMax || 0
    const budgetFormatted = budget >= 100000
        ? `₹${(budget / 100000).toFixed(1)}L`
        : `₹${budget.toLocaleString()}`

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Client Brief</h2>
                    <p className="text-sm text-gray-500">Everything the client told us about their event</p>
                </div>
                <Button onClick={onNext} className="bg-orange-500 hover:bg-orange-600">
                    Continue to Feasibility <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Left Column - Client Info */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Client Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-lg font-bold text-gray-900">{event.clientName}</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="w-4 h-4 text-gray-400" />
                                {event.clientPhone || 'Not provided'}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="w-4 h-4 text-gray-400" />
                                {event.clientEmail || 'Not provided'}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-orange-700">Budget</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-orange-600">{budgetFormatted}</p>
                            {event.budgetMin && (
                                <p className="text-sm text-orange-600/70">
                                    Range: ₹{(event.budgetMin / 100000).toFixed(1)}L - {budgetFormatted}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Middle Column - Event Details */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Event Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Date</p>
                                    <p className="font-medium">
                                        {new Date(event.date).toLocaleDateString('en-IN', {
                                            weekday: 'long',
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                    <Users className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Guest Count</p>
                                    <p className="font-medium">{event.guestCount} guests</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                    <MapPin className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Venue Preference</p>
                                    <p className="font-medium capitalize">{event.venueType || 'Not specified'}</p>
                                </div>
                            </div>

                            <div className="pt-2 border-t">
                                <Badge className="bg-orange-100 text-orange-700 capitalize">
                                    {event.type}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Preferences */}
                <div className="space-y-4">
                    {intake && (
                        <>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                        <Palette className="w-4 h-4" /> Style & Colors
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {intake.stylePreferences && intake.stylePreferences.length > 0 && (
                                        <div className="mb-3">
                                            <p className="text-xs text-gray-400 mb-1">Style</p>
                                            <div className="flex flex-wrap gap-1">
                                                {intake.stylePreferences.map((style: string, i: number) => (
                                                    <Badge key={i} variant="secondary" className="capitalize">
                                                        {style}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {intake.colorPreferences && intake.colorPreferences.length > 0 && (
                                        <div>
                                            <p className="text-xs text-gray-400 mb-1">Colors</p>
                                            <div className="flex flex-wrap gap-1">
                                                {intake.colorPreferences.map((color: string, i: number) => (
                                                    <Badge key={i} variant="outline" className="capitalize">
                                                        {color}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {intake.specialRequirements && (
                                <Card className="bg-amber-50 border-amber-200">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-amber-700 flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" /> Special Requirements
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-amber-800">
                                            {intake.specialRequirements}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    )}

                    {/* Vision Board Placeholder */}
                    <Card className="border-dashed border-2 bg-gray-50/50">
                        <CardContent className="py-8 text-center">
                            <Image className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                            <p className="text-sm text-gray-400">Vision Board</p>
                            <p className="text-xs text-gray-300">Coming soon</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
