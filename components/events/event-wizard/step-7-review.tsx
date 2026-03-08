'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Calendar, MapPin, Palette, UtensilsCrossed, Music, Clock,
    IndianRupee, Users, FileText, Send, Download, Check, Eye
} from 'lucide-react'
import { EventPlan } from '@/lib/types/event-plan'
import Link from 'next/link'

interface Step7Props {
    eventPlan: EventPlan
}

export function Step7Review({ eventPlan }: Step7Props) {
    const { basics, venue, themeDecor, catering, entertainment, timeline } = eventPlan

    // Calculate totals
    const venueCost = venue.venueCost || 0
    const decorCost = themeDecor.decorCost || 0
    const cateringCost = catering.perPlateCost * basics.guestCount
    const entertainmentCost = entertainment.entertainmentCost || 0
    const photographyCost = entertainment.photographyCost || 0
    const additionalCost = entertainment.additionalServices?.reduce((sum, s) => sum + s.cost, 0) || 0

    const subtotal = venueCost + decorCost + cateringCost + entertainmentCost + photographyCost + additionalCost
    const platformFee = Math.round(subtotal * 0.02)
    const grandTotal = subtotal + platformFee
    const budgetUtilization = ((grandTotal / basics.budget) * 100).toFixed(0)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Plan Summary</h2>
                <p className="text-gray-500">Review all details before generating the client proposal</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <Card className="p-4 text-center bg-indigo-50">
                    <Calendar className="w-6 h-6 mx-auto mb-2 text-indigo-600" />
                    <div className="text-lg font-bold text-gray-900">
                        {basics.eventDate
                            ? new Date(basics.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                            : '-'
                        }
                    </div>
                    <div className="text-xs text-gray-500">Event Date</div>
                </Card>
                <Card className="p-4 text-center bg-purple-50">
                    <Users className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                    <div className="text-lg font-bold text-gray-900">{basics.guestCount}</div>
                    <div className="text-xs text-gray-500">Guests</div>
                </Card>
                <Card className="p-4 text-center bg-green-50">
                    <IndianRupee className="w-6 h-6 mx-auto mb-2 text-green-600" />
                    <div className="text-lg font-bold text-gray-900">₹{(grandTotal / 100000).toFixed(1)}L</div>
                    <div className="text-xs text-gray-500">Total Cost</div>
                </Card>
                <Card className={`p-4 text-center ${parseInt(budgetUtilization) > 100 ? 'bg-red-50' : 'bg-blue-50'
                    }`}>
                    <div className="text-lg font-bold text-gray-900">{budgetUtilization}%</div>
                    <div className="text-xs text-gray-500">Budget Used</div>
                </Card>
            </div>

            {/* Section Cards */}
            <div className="grid grid-cols-2 gap-4">
                {/* Basics */}
                <Card className="p-4">
                    <div className="flex items-center gap-2 mb-3 text-indigo-600">
                        <Calendar className="w-5 h-5" />
                        <h3 className="font-semibold">Event Basics</h3>
                    </div>
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Name</span>
                            <span className="font-medium">{basics.eventName || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Type</span>
                            <span className="font-medium capitalize">{basics.eventType}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Date & Time</span>
                            <span className="font-medium">{basics.eventDate} at {basics.eventTime}</span>
                        </div>
                    </div>
                    {basics.clientVision && (
                        <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                            "{basics.clientVision.substring(0, 100)}..."
                        </div>
                    )}
                </Card>

                {/* Venue */}
                <Card className="p-4">
                    <div className="flex items-center gap-2 mb-3 text-blue-600">
                        <MapPin className="w-5 h-5" />
                        <h3 className="font-semibold">Venue</h3>
                    </div>
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Venue</span>
                            <span className="font-medium">{venue.venueName || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">City</span>
                            <span className="font-medium">{venue.venueCity || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Cost</span>
                            <span className="font-medium">₹{(venueCost / 100000).toFixed(1)}L</span>
                        </div>
                    </div>
                </Card>

                {/* Theme & Decor */}
                <Card className="p-4">
                    <div className="flex items-center gap-2 mb-3 text-pink-600">
                        <Palette className="w-5 h-5" />
                        <h3 className="font-semibold">Theme & Decor</h3>
                    </div>
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Theme</span>
                            <span className="font-medium">{themeDecor.themeName || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Style</span>
                            <span className="font-medium capitalize">{themeDecor.decorStyle}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-gray-500 text-sm">Colors:</span>
                            {themeDecor.colorPalette.map((color, i) => (
                                <div
                                    key={i}
                                    className="w-4 h-4 rounded-full border"
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Catering */}
                <Card className="p-4">
                    <div className="flex items-center gap-2 mb-3 text-amber-600">
                        <UtensilsCrossed className="w-5 h-5" />
                        <h3 className="font-semibold">Catering</h3>
                    </div>
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Style</span>
                            <span className="font-medium capitalize">{catering.menuStyle.replace('_', ' ')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Cuisines</span>
                            <span className="font-medium">{catering.cuisineTypes?.join(', ') || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Cost ({basics.guestCount} x ₹{catering.perPlateCost})</span>
                            <span className="font-medium">₹{(cateringCost / 100000).toFixed(1)}L</span>
                        </div>
                    </div>
                </Card>

                {/* Entertainment */}
                <Card className="p-4">
                    <div className="flex items-center gap-2 mb-3 text-purple-600">
                        <Music className="w-5 h-5" />
                        <h3 className="font-semibold">Entertainment & Services</h3>
                    </div>
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Entertainment</span>
                            <span className="font-medium capitalize">{entertainment.entertainmentType}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Photography</span>
                            <span className="font-medium capitalize">{entertainment.photographyPackage}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Additional</span>
                            <span className="font-medium">{entertainment.additionalServices?.length || 0} services</span>
                        </div>
                    </div>
                </Card>

                {/* Timeline */}
                <Card className="p-4">
                    <div className="flex items-center gap-2 mb-3 text-teal-600">
                        <Clock className="w-5 h-5" />
                        <h3 className="font-semibold">Timeline</h3>
                    </div>
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Schedule Items</span>
                            <span className="font-medium">{timeline.eventDaySchedule?.length || 0}</span>
                        </div>
                        {timeline.eventDaySchedule?.length > 0 && (
                            <>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Starts</span>
                                    <span className="font-medium">{timeline.eventDaySchedule[0].time}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Ends</span>
                                    <span className="font-medium">
                                        {timeline.eventDaySchedule[timeline.eventDaySchedule.length - 1].time}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </Card>
            </div>

            {/* Budget Breakdown */}
            <Card className="p-6 bg-gradient-to-r from-gray-50 to-slate-50">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <IndianRupee className="w-5 h-5" /> Budget Breakdown
                </h3>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Venue</span>
                        <span>₹{venueCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>Decor</span>
                        <span>₹{decorCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>Catering ({basics.guestCount} guests)</span>
                        <span>₹{cateringCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>Entertainment</span>
                        <span>₹{entertainmentCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>Photography</span>
                        <span>₹{photographyCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>Additional Services</span>
                        <span>₹{additionalCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                        <span>Platform Fee (2%)</span>
                        <span>₹{platformFee.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between text-lg font-bold">
                        <span>Grand Total</span>
                        <span className="text-indigo-600">₹{grandTotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                        <span>Client Budget</span>
                        <span>₹{basics.budget.toLocaleString('en-IN')}</span>
                    </div>
                </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
                <Button variant="outline" className="flex-1 h-12 gap-2">
                    <Eye className="w-5 h-5" /> Preview Proposal
                </Button>
                <Button variant="outline" className="flex-1 h-12 gap-2">
                    <Download className="w-5 h-5" /> Download PDF
                </Button>
                <Button className="flex-1 h-12 gap-2 bg-green-600 hover:bg-green-700">
                    <Send className="w-5 h-5" /> Send to Client
                </Button>
            </div>
        </div>
    )
}
