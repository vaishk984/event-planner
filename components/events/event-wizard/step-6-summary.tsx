'use client'

import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Calendar, MapPin, Palette, UtensilsCrossed, Music,
    IndianRupee, CheckCircle2, Clock, Send, FileText, ArrowRight
} from 'lucide-react'
import { EventPlan } from '@/lib/types/event-plan'
import { useEventContext } from '@/components/providers/event-provider'

interface Step6Props {
    eventPlan: EventPlan
}

export function Step6Summary({ eventPlan }: Step6Props) {
    const router = useRouter()
    const { createEventFromWizard } = useEventContext()

    const { basics, venue, themeDecor, catering, entertainment } = eventPlan

    // Calculate initial rough estimate based on preferences
    const calculateEstimate = () => {
        let estimate = 0

        // Base venue estimate based on city and capacity
        const venueEstimates: Record<string, number> = {
            'Mumbai': 500000, 'Delhi NCR': 450000, 'Bangalore': 400000,
            'Jaipur': 350000, 'Udaipur': 600000, 'Goa': 450000
        }
        estimate += venueEstimates[venue.venueCity] || 300000

        // Catering estimate (per plate * guests)
        estimate += catering.perPlateCost * basics.guestCount

        // Decor estimate based on style
        const decorEstimates: Record<string, number> = {
            'minimal': 100000, 'moderate': 250000, 'grand': 500000, 'over_the_top': 800000
        }
        estimate += decorEstimates[themeDecor.decorStyle] || 200000

        // Entertainment
        const entertainmentEstimates: Record<string, number> = {
            'dj': 75000, 'live_band': 150000, 'cultural': 100000, 'none': 0
        }
        estimate += entertainmentEstimates[entertainment.entertainmentType] || 50000

        // Photography
        const photoEstimates: Record<string, number> = {
            'basic': 50000, 'premium': 125000, 'luxury': 250000, 'none': 0
        }
        estimate += photoEstimates[entertainment.photographyPackage] || 75000

        // Additional services
        estimate += (entertainment.additionalServices?.length || 0) * 40000

        return estimate
    }

    const roughEstimate = calculateEstimate()
    const estimateRange = {
        low: Math.round(roughEstimate * 0.8),
        high: Math.round(roughEstimate * 1.2)
    }

    // Create event and redirect to design dashboard
    const handleCreateEvent = () => {
        const newEventId = createEventFromWizard(eventPlan)
        router.push(`/planner/events/${newEventId}/design`)
    }

    // Save as draft (just go back to events list)
    const handleSaveDraft = () => {
        createEventFromWizard(eventPlan) // Still save it
        router.push('/planner/events')
    }

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 text-green-600 mb-2">
                    <CheckCircle2 className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Requirements Captured!</h2>
                <p className="text-sm text-gray-500">Here's a summary of what the client wants</p>
            </div>

            {/* Requirements Summary Grid */}
            <div className="grid grid-cols-3 gap-3">
                {/* Basics */}
                <Card className="p-3">
                    <div className="flex items-center gap-2 mb-2 text-indigo-600">
                        <Calendar className="w-4 h-4" />
                        <h3 className="font-semibold text-sm">Event Details</h3>
                    </div>
                    <div className="space-y-1 text-xs">
                        <div><span className="text-gray-500">Name:</span> <span className="font-medium">{basics.eventName || 'TBD'}</span></div>
                        <div><span className="text-gray-500">Type:</span> <span className="font-medium capitalize">{basics.eventType}</span></div>
                        <div><span className="text-gray-500">Guests:</span> <span className="font-medium">{basics.guestCount}</span></div>
                        <div><span className="text-gray-500">Budget:</span> <span className="font-medium">₹{(basics.budget / 100000).toFixed(1)}L</span></div>
                    </div>
                </Card>

                {/* Venue Preferences */}
                <Card className="p-3">
                    <div className="flex items-center gap-2 mb-2 text-blue-600">
                        <MapPin className="w-4 h-4" />
                        <h3 className="font-semibold text-sm">Venue</h3>
                    </div>
                    <div className="space-y-1 text-xs">
                        <div><span className="text-gray-500">Type:</span> <span className="font-medium capitalize">{venue.type || 'Any'}</span></div>
                        <div><span className="text-gray-500">City:</span> <span className="font-medium">{venue.venueCity || 'Flexible'}</span></div>
                        <div><span className="text-gray-500">Capacity:</span> <span className="font-medium">{venue.capacity || 'TBD'}</span></div>
                    </div>
                </Card>

                {/* Style Preferences */}
                <Card className="p-3">
                    <div className="flex items-center gap-2 mb-2 text-pink-600">
                        <Palette className="w-4 h-4" />
                        <h3 className="font-semibold text-sm">Style</h3>
                    </div>
                    <div className="space-y-1 text-xs">
                        <div><span className="text-gray-500">Style:</span> <span className="font-medium">{themeDecor.themeName || 'TBD'}</span></div>
                        <div><span className="text-gray-500">Decor:</span> <span className="font-medium capitalize">{themeDecor.decorStyle}</span></div>
                        <div className="flex items-center gap-1">
                            <span className="text-gray-500">Colors:</span>
                            {themeDecor.colorPalette?.slice(0, 3).map((color, i) => (
                                <div key={i} className="w-3 h-3 rounded-full border" style={{ backgroundColor: color }} />
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Food Preferences */}
                <Card className="p-3">
                    <div className="flex items-center gap-2 mb-2 text-amber-600">
                        <UtensilsCrossed className="w-4 h-4" />
                        <h3 className="font-semibold text-sm">Food</h3>
                    </div>
                    <div className="space-y-1 text-xs">
                        <div><span className="text-gray-500">Dietary:</span> <span className="font-medium">{catering.dietaryOptions?.join(', ') || 'TBD'}</span></div>
                        <div><span className="text-gray-500">Cuisines:</span> <span className="font-medium">{catering.cuisineTypes?.slice(0, 2).join(', ') || 'TBD'}</span></div>
                        <div><span className="text-gray-500">Style:</span> <span className="font-medium capitalize">{catering.menuStyle?.replace('_', ' ')}</span></div>
                    </div>
                </Card>

                {/* Entertainment */}
                <Card className="p-3 col-span-2">
                    <div className="flex items-center gap-2 mb-2 text-purple-600">
                        <Music className="w-4 h-4" />
                        <h3 className="font-semibold text-sm">Entertainment & Services</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                        <div><span className="text-gray-500">Music:</span> <span className="font-medium capitalize">{entertainment.entertainmentType}</span></div>
                        <div><span className="text-gray-500">Photo:</span> <span className="font-medium capitalize">{entertainment.photographyPackage}</span></div>
                        <div><span className="text-gray-500">Extra:</span> <span className="font-medium">{entertainment.additionalServices?.length || 0} services</span></div>
                    </div>
                </Card>
            </div>

            {/* Initial Estimate */}
            <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-green-800 flex items-center gap-2">
                            <IndianRupee className="w-4 h-4" /> Initial Rough Estimate
                        </h3>
                        <p className="text-xs text-green-600 mt-1">Based on preferences (actual quote after design)</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-green-700">
                            ₹{(estimateRange.low / 100000).toFixed(1)}L - ₹{(estimateRange.high / 100000).toFixed(1)}L
                        </div>
                    </div>
                </div>
            </Card>

            {/* Next Steps Message */}
            <Card className="p-4 bg-indigo-50 border-indigo-200">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-indigo-100 rounded-full">
                        <Clock className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-indigo-800">What Happens Next?</h3>
                        <p className="text-sm text-indigo-600 mt-1">
                            "Give us <strong>2-3 days</strong> and we'll design your complete event!
                            We'll select vendors, create mood boards, and share a detailed proposal."
                        </p>
                    </div>
                </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 h-11 gap-2" onClick={handleSaveDraft}>
                    <FileText className="w-4 h-4" /> Save as Draft
                </Button>
                <Button
                    className="flex-1 h-11 gap-2 bg-green-600 hover:bg-green-700"
                    onClick={handleCreateEvent}
                >
                    <Send className="w-4 h-4" /> Create Event & Start Planning
                    <ArrowRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    )
}
