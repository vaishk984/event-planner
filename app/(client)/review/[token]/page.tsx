'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
    Check, X, IndianRupee, Calendar, MapPin,
    Users, MessageSquare, ThumbsUp, Clock,
    ChevronDown, ChevronUp
} from 'lucide-react'

// Mock proposal data (would be fetched based on token)
const MOCK_PROPOSAL = {
    id: 'prop-001',
    token: 'abc123xyz',
    plannerName: 'Elite Events by Sharma',
    plannerLogo: null,
    eventName: 'Kapoor Wedding Reception',
    eventDate: '2025-02-14',
    venue: 'JW Marriott, Mumbai',
    guestCount: 800,
    version: 2,
    expiresAt: '2025-01-15',
    items: [
        {
            id: '1',
            category: 'Venue',
            vendorName: 'JW Marriott Grand Ballroom',
            description: 'Premium ballroom with 1000 capacity, includes basic AV setup',
            price: 500000,
            images: ['/placeholder-venue.jpg']
        },
        {
            id: '2',
            category: 'Decor',
            vendorName: 'Bloom Florals',
            description: 'Luxury floral arrangements - Stage, mandap, entrance, table centerpieces',
            price: 250000,
            images: []
        },
        {
            id: '3',
            category: 'Catering',
            vendorName: 'Royal Caterers',
            description: 'Multi-cuisine buffet for 800 guests - Veg & Non-veg options',
            price: 1200000,
            images: []
        },
        {
            id: '4',
            category: 'Photography',
            vendorName: 'Click Studios',
            description: 'Pre-wedding + Wedding day coverage - 2 photographers, 1 videographer',
            price: 175000,
            images: []
        },
        {
            id: '5',
            category: 'Entertainment',
            vendorName: 'DJ Aman',
            description: 'Full night DJ + sound system + lighting',
            price: 85000,
            images: []
        },
    ],
    subtotal: 2210000,
    platformFee: 44200,
    total: 2254200,
}

export default function ClientReviewPage() {
    const [proposal] = useState(MOCK_PROPOSAL)
    const [feedback, setFeedback] = useState('')
    const [expandedItems, setExpandedItems] = useState<string[]>([])
    const [status, setStatus] = useState<'pending' | 'approved' | 'revision'>('pending')

    const toggleItem = (id: string) => {
        setExpandedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const handleApprove = () => {
        setStatus('approved')
    }

    const handleRequestRevision = () => {
        if (!feedback.trim()) {
            alert('Please provide feedback for requested changes')
            return
        }
        setStatus('revision')
    }

    if (status === 'approved') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-6">
                <Card className="max-w-md text-center p-8">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Proposal Approved! 🎉</h1>
                    <p className="text-gray-600 mb-4">
                        Thank you for approving the proposal for <strong>{proposal.eventName}</strong>.
                    </p>
                    <p className="text-sm text-gray-500">
                        {proposal.plannerName} will contact you shortly to proceed with bookings.
                    </p>
                </Card>
            </div>
        )
    }

    if (status === 'revision') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center p-6">
                <Card className="max-w-md text-center p-8">
                    <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MessageSquare className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Revision Requested</h1>
                    <p className="text-gray-600 mb-4">
                        Your feedback has been sent to <strong>{proposal.plannerName}</strong>.
                    </p>
                    <p className="text-sm text-gray-500">
                        They will update the proposal and send you a new version soon.
                    </p>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-500">Proposal from</div>
                            <div className="font-semibold text-gray-900">{proposal.plannerName}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-gray-400">Version {proposal.version}</div>
                            <div className="text-xs text-orange-600 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Expires {new Date(proposal.expiresAt).toLocaleDateString('en-IN')}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Event Overview */}
                <Card className="mb-6 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
                        <h1 className="text-2xl font-bold mb-4">{proposal.eventName}</h1>
                        <div className="grid grid-cols-3 gap-4 text-indigo-100">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                <span>{new Date(proposal.eventDate).toLocaleDateString('en-IN', {
                                    day: 'numeric', month: 'long', year: 'numeric'
                                })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                <span>{proposal.venue}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                <span>{proposal.guestCount} guests</span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Line Items */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Proposal Details</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {proposal.items.map((item) => (
                                <div key={item.id} className="p-4">
                                    <div
                                        className="flex items-center justify-between cursor-pointer"
                                        onClick={() => toggleItem(item.id)}
                                    >
                                        <div>
                                            <div className="text-xs text-indigo-600 font-medium uppercase tracking-wide">
                                                {item.category}
                                            </div>
                                            <div className="font-semibold text-gray-900">{item.vendorName}</div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold flex items-center">
                                                <IndianRupee className="w-4 h-4" />
                                                {item.price.toLocaleString('en-IN')}
                                            </span>
                                            {expandedItems.includes(item.id) ? (
                                                <ChevronUp className="w-5 h-5 text-gray-400" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>
                                    </div>
                                    {expandedItems.includes(item.id) && (
                                        <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                                            {item.description}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Total */}
                <Card className="mb-6">
                    <CardContent className="p-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span className="flex items-center">
                                    <IndianRupee className="w-4 h-4" />
                                    {proposal.subtotal.toLocaleString('en-IN')}
                                </span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Platform Fee (2%)</span>
                                <span className="flex items-center">
                                    <IndianRupee className="w-4 h-4" />
                                    {proposal.platformFee.toLocaleString('en-IN')}
                                </span>
                            </div>
                            <div className="flex justify-between text-xl font-bold pt-3 border-t">
                                <span>Total</span>
                                <span className="flex items-center text-indigo-600">
                                    <IndianRupee className="w-5 h-5" />
                                    {proposal.total.toLocaleString('en-IN')}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Feedback Section */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-gray-400" />
                            Your Feedback (Optional)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            placeholder="Any changes you'd like? Suggestions or concerns?"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            rows={3}
                        />
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <Button
                        variant="outline"
                        className="flex-1 h-14 gap-2 border-orange-300 text-orange-700 hover:bg-orange-50"
                        onClick={handleRequestRevision}
                    >
                        <X className="w-5 h-5" />
                        Request Changes
                    </Button>
                    <Button
                        className="flex-1 h-14 gap-2 bg-green-600 hover:bg-green-700"
                        onClick={handleApprove}
                    >
                        <ThumbsUp className="w-5 h-5" />
                        Approve Proposal
                    </Button>
                </div>
            </main>
        </div>
    )
}
