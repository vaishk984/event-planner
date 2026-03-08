'use client'

import { useState } from 'react'
import { useClientIntake, getBudgetFromSlider } from '@/components/providers/client-intake-provider'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BudgetWidget } from '@/components/client-portal/budget-widget'
import { SignaturePad } from '@/components/ui/signature-pad'
import {
    CheckCircle2, Calendar, Users, MapPin, Palette, Heart,
    Phone, Mail, Clock, Calculator, PenTool
} from 'lucide-react'
import { MOCK_VENDORS } from '@/lib/mock-data/vendors'

export function Tab5Done() {
    const { data, submitIntake, goToTab } = useClientIntake()
    const [signature, setSignature] = useState<{ data: string; timestamp: string } | null>(null)
    const [showSignature, setShowSignature] = useState(false)

    const budgetInfo = getBudgetFromSlider(data.budgetRange)
    const likedVendorNames = MOCK_VENDORS
        .filter(v => data.likedVendors.includes(v.id))
        .map(v => v.name)

    const handleSubmit = () => {
        submitIntake()
    }

    const handleSignature = (signatureData: string, timestamp: string) => {
        setSignature({ data: signatureData, timestamp })
        setShowSignature(false)
    }

    if (data.isComplete) {
        // Success state
        return (
            <Card className="p-8 bg-white/80 backdrop-blur shadow-xl border-0 text-center">
                <div className="max-w-md mx-auto space-y-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 mx-auto">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        You're All Set! 🎉
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Thank you for sharing your event details with us, {data.clientName.split(' ')[0]}!
                    </p>

                    <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100 text-left space-y-4">
                        <h3 className="font-semibold text-indigo-800 flex items-center gap-2">
                            <Clock className="w-5 h-5" /> What happens next?
                        </h3>
                        <ol className="space-y-3 text-sm text-indigo-700">
                            <li className="flex gap-3">
                                <span className="w-6 h-6 rounded-full bg-indigo-200 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                                <span>Our planner reviews your requirements (24-48 hours)</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="w-6 h-6 rounded-full bg-indigo-200 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                                <span>We design your event with perfect vendor matches</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="w-6 h-6 rounded-full bg-indigo-200 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                                <span>You receive a detailed proposal for approval</span>
                            </li>
                        </ol>
                    </div>

                    <div className="flex gap-3 justify-center">
                        <Button variant="outline" className="gap-2">
                            <Phone className="w-4 h-4" /> Call Us
                        </Button>
                        <Button variant="outline" className="gap-2">
                            <Mail className="w-4 h-4" /> Email Support
                        </Button>
                    </div>

                    <p className="text-sm text-gray-400">
                        Submitted at {new Date(data.submittedAt!).toLocaleString()}
                    </p>
                </div>
            </Card>
        )
    }

    // Summary before submit
    return (
        <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
                <Card className="p-8 bg-white/80 backdrop-blur shadow-xl border-0">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 text-white mb-4">
                            <CheckCircle2 className="w-7 h-7" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Review & Submit
                        </h1>
                        <p className="text-gray-500">
                            Almost there! Let's make sure everything looks right.
                        </p>
                    </div>

                    <div className="max-w-lg mx-auto space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Client Info */}
                            <Card className="p-4 bg-gray-50">
                                <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Your Info</h3>
                                <p className="font-medium">{data.clientName}</p>
                                <p className="text-sm text-gray-600">{data.phone}</p>
                                {data.email && <p className="text-sm text-gray-600">{data.email}</p>}
                            </Card>

                            {/* Event */}
                            <Card className="p-4 bg-gray-50">
                                <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Event</h3>
                                <p className="font-medium capitalize">{data.eventType}</p>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar className="w-3 h-3" />
                                    {data.eventDate || 'Date flexible'}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Users className="w-3 h-3" />
                                    {data.guestCount} guests
                                </div>
                            </Card>

                            {/* Location */}
                            <Card className="p-4 bg-gray-50">
                                <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Location</h3>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">{data.city}</span>
                                </div>
                                <Badge variant="secondary" className="mt-2 text-xs">
                                    {data.venueType === 'personal' ? '🏠 Own venue' : '🔍 Need venue'}
                                </Badge>
                                {data.venueType === 'personal' && data.personalVenue.name && (
                                    <p className="text-sm text-gray-600 mt-1">{data.personalVenue.name}</p>
                                )}
                            </Card>

                            {/* Style & Budget */}
                            <Card className="p-4 bg-gray-50">
                                <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Style & Budget</h3>
                                <div className="flex items-center gap-2">
                                    <Palette className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium capitalize">{data.stylePreference || 'Any'}</span>
                                </div>
                                <Badge className="mt-2 bg-green-100 text-green-700">{budgetInfo.label}</Badge>
                            </Card>
                        </div>

                        {/* Liked Vendors */}
                        {data.likedVendors.length > 0 && (
                            <Card className="p-4 bg-pink-50 border-pink-200">
                                <h3 className="text-xs font-medium text-pink-600 uppercase mb-2 flex items-center gap-1">
                                    <Heart className="w-3 h-3 fill-pink-500" /> Vendors You Liked
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {likedVendorNames.slice(0, 5).map((name, i) => (
                                        <Badge key={i} variant="secondary" className="bg-white">
                                            {name}
                                        </Badge>
                                    ))}
                                    {likedVendorNames.length > 5 && (
                                        <Badge variant="secondary">+{likedVendorNames.length - 5} more</Badge>
                                    )}
                                </div>
                            </Card>
                        )}

                        {/* Special Requests */}
                        {data.specialRequests && (
                            <Card className="p-4 bg-amber-50 border-amber-200">
                                <h3 className="text-xs font-medium text-amber-600 uppercase mb-2">Special Requests</h3>
                                <p className="text-sm text-amber-800 italic">"{data.specialRequests}"</p>
                            </Card>
                        )}

                        {/* Digital Signature - B4 Feature */}
                        {!signature ? (
                            <Card className="p-4 bg-indigo-50 border-indigo-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium text-indigo-800 flex items-center gap-2">
                                            <PenTool className="w-4 h-4" /> Digital Signature (Optional)
                                        </h3>
                                        <p className="text-sm text-indigo-600">Sign to confirm requirements</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowSignature(true)}
                                        className="border-indigo-300 text-indigo-700"
                                    >
                                        Add Signature
                                    </Button>
                                </div>
                            </Card>
                        ) : (
                            <Card className="p-4 bg-green-50 border-green-200">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                    <div className="flex-1">
                                        <h3 className="font-medium text-green-800">Signed</h3>
                                        <p className="text-xs text-green-600">{new Date(signature.timestamp).toLocaleString()}</p>
                                    </div>
                                    <img src={signature.data} alt="Signature" className="h-12 border rounded" />
                                </div>
                            </Card>
                        )}

                        {/* Signature Modal */}
                        {showSignature && (
                            <SignaturePad
                                onSave={handleSignature}
                                onCancel={() => setShowSignature(false)}
                                clientName={data.clientName}
                            />
                        )}

                        {/* Navigation */}
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => goToTab(data.currentTab - 1)}
                                className="h-14 px-6 gap-2"
                            >
                                ← Back
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                className="flex-1 h-14 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 gap-2"
                            >
                                <CheckCircle2 className="w-5 h-5" /> Submit My Requirements
                            </Button>
                        </div>

                        <p className="text-center text-sm text-gray-400">
                            By submitting, you'll receive a call from our team within 24-48 hours
                        </p>
                    </div>
                </Card>
            </div>

            {/* Budget Widget Sidebar - E1 Feature */}
            <div className="lg:col-span-1">
                <BudgetWidget />
            </div>
        </div>
    )
}

