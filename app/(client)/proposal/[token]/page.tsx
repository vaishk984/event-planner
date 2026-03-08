'use client'

import { use, useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
    Building2, UtensilsCrossed, Camera, Sparkles, Music, Brush, Car,
    Calendar, Users, MapPin, Check, IndianRupee, Star, Phone, Mail,
    MessageCircle, Download, CheckCircle2, Heart, Clock, Shield, Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { getPublicProposalDetails, updateProposalStatus, getFinalProposal, updateFinalProposalStatus } from '@/actions/client-portal'

// Helper functions for icons/colors
const getCategoryIcon = (iconName: string) => {
    const icons: Record<string, any> = {
        Building2, UtensilsCrossed, Camera, Sparkles, Music, Brush, Car
    }
    return icons[iconName] || Sparkles
}

const getTimelineIcon = (category: string) => {
    switch (category) {
        case 'ceremony': return <Sparkles className="w-4 h-4" />
        case 'dining': return <UtensilsCrossed className="w-4 h-4" />
        case 'entertainment': return <Music className="w-4 h-4" />
        case 'ritual': return <Heart className="w-4 h-4" />
        default: return <Clock className="w-4 h-4" />
    }
}

const getTimelineColor = (category: string) => {
    switch (category) {
        case 'ceremony': return 'bg-purple-500'
        case 'dining': return 'bg-amber-500'
        case 'entertainment': return 'bg-pink-500'
        case 'ritual': return 'bg-rose-500'
        default: return 'bg-gray-500'
    }
}

export default function ClientProposalPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params)
    const [proposal, setProposal] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showFeedback, setShowFeedback] = useState(false)
    const [feedback, setFeedback] = useState('')
    const [approving, setApproving] = useState(false)
    const [approved, setApproved] = useState(false)

    const [isFinal, setIsFinal] = useState(false)

    useEffect(() => {
        async function loadProposal() {
            try {
                const isFinalToken = token.startsWith('final_')
                setIsFinal(isFinalToken)

                if (isFinalToken) {
                    const result = await getFinalProposal(token)
                    if ('error' in result) {
                        setError(result.error || 'Final proposal not found')
                    } else {
                        setProposal(result.proposal)
                        setApproved(result.status === 'approved')
                    }
                } else {
                    const result = await getPublicProposalDetails(token)
                    if (result.error || !result.proposal) {
                        setError(result.error || 'Failed to load proposal')
                    } else {
                        setProposal(result.proposal)
                        setApproved(result.proposal.status === 'approved')
                    }
                }
            } catch (err) {
                console.error(err)
                setError('Something went wrong')
            } finally {
                setLoading(false)
            }
        }
        loadProposal()
    }, [token])

    const totalAmount = proposal?.categories.reduce((sum: number, cat: any) => sum + (cat.price || 0), 0) || 0

    const handleApprove = async () => {
        setApproving(true)
        try {
            const updateFn = isFinal ? updateFinalProposalStatus : updateProposalStatus
            const result = await updateFn(token, 'approved')
            if (result.success) {
                setApproved(true)
                toast.success(isFinal
                    ? 'Final proposal approved! Your planner will begin execution.'
                    : 'Proposal approved! Your planner will contact you shortly.'
                )
            } else {
                toast.error('Failed to approve proposal')
            }
        } catch (error) {
            toast.error('Something went wrong')
        } finally {
            setApproving(false)
        }
    }

    const handleRequestChanges = async () => {
        if (!feedback.trim()) {
            toast.error('Please describe the changes you need')
            return
        }

        try {
            const updateFn = isFinal ? updateFinalProposalStatus : updateProposalStatus
            const result = await updateFn(token, 'changes_requested', feedback)
            if (result.success) {
                toast.success('Your feedback has been sent to the planner!')
                setShowFeedback(false)
                setFeedback('')
                // reload proposal
                window.location.reload()
            } else {
                toast.error('Failed to submit feedback')
            }
        } catch (error) {
            toast.error('Something went wrong')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        )
    }

    if (error || !proposal) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="max-w-md w-full text-center p-8 bg-red-50 border-red-100">
                    <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Proposal</h2>
                    <p className="text-red-600">{error || 'Proposal not found'}</p>
                </Card>
            </div>
        )
    }

    if (approved) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full text-center">
                    <CardContent className="py-12">
                        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Proposal Approved!</h2>
                        <p className="text-gray-600 mb-6">
                            Thank you for approving the proposal for {proposal.eventName}.
                            Your planner will contact you shortly with next steps.
                        </p>
                        <div className="flex items-center justify-center gap-4">
                            <Button variant="outline" className="gap-2">
                                <Phone className="w-4 h-4" /> Call Planner
                            </Button>
                            <Button variant="outline" className="gap-2">
                                <Mail className="w-4 h-4" /> Email
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-rose-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center">
                            <Heart className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-900">{proposal.plannerName}</h1>
                            <p className="text-xs text-gray-500">Event Proposal</p>
                        </div>
                    </div>
                    <Badge className="bg-amber-100 text-amber-700">
                        <Clock className="w-3 h-3 mr-1" /> Valid until {proposal.validUntil}
                    </Badge>
                </div>
            </header>

            {/* Hero */}
            <div className="bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 text-white">
                <div className="max-w-5xl mx-auto px-4 py-16 text-center">
                    <p className="text-white/70 uppercase tracking-wider text-sm mb-2">Your Event Proposal</p>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">{proposal.eventName}</h1>
                    <div className="flex items-center justify-center gap-8 text-white/90 flex-wrap">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            <span>{new Date(proposal.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            <span>{proposal.guestCount} Guests</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            <span>{proposal.city}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-4 py-12">
                {/* Personal Message */}
                <Card className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                    <CardContent className="py-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                <Heart className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="font-medium text-amber-800 mb-2">A Note from Your Planner</p>
                                <p className="text-amber-700 whitespace-pre-line text-sm">{proposal.personalMessage}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Category Cards */}
                <h2 className="text-xl font-bold text-gray-900 mb-4">What's Included</h2>
                <div className="space-y-4 mb-8">
                    {proposal.categories.length === 0 ? (
                        <Card className="text-center py-8 text-gray-500">
                            <p>No vendors or services confirmed yet.</p>
                        </Card>
                    ) : (
                        proposal.categories.map((category: any, idx: number) => {
                            const Icon = getCategoryIcon(category.icon)
                            return (
                                <Card key={`${category.id}-${idx}`} className="overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="flex">
                                        <div className="w-16 bg-gradient-to-b from-orange-500 to-rose-500 flex items-center justify-center">
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1 p-5">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900">{category.name}</h3>
                                                    <p className="text-orange-600 font-medium">{category.vendor.name}</p>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                                        <span className="text-sm text-gray-600">{category.vendor.rating}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-gray-900">
                                                        ₹{(category.price / 100000).toFixed(2)}L
                                                    </p>
                                                    {category.perPlatePrice && category.guestCount && (
                                                        <p className="text-xs font-medium text-gray-500 mt-0.5">
                                                            ₹{category.perPlatePrice.toLocaleString('en-IN')}/plate × {category.guestCount} guests
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {category.items.map((item: string, i: number) => (
                                                    <span key={i} className="inline-flex items-center gap-1 text-sm bg-green-50 text-green-700 px-3 py-1 rounded-full">
                                                        <Check className="w-3 h-3" /> {item}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            )
                        })
                    )}
                </div>

                {/* Event Timeline / Runsheet */}
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    Event Schedule
                </h2>
                <Card className="mb-8 overflow-hidden">
                    <CardContent className="p-0">
                        <div className="relative">
                            {proposal.timeline.map((item: any, idx: number) => (
                                <div key={item.id} className="flex border-b last:border-b-0">
                                    {/* Time Column */}
                                    <div className="w-24 flex-shrink-0 p-4 bg-gray-50 flex flex-col items-center justify-center border-r">
                                        <span className="text-lg font-bold text-gray-900">{item.time}</span>
                                        {item.duration && (
                                            <span className="text-xs text-gray-500">{item.duration}</span>
                                        )}
                                    </div>
                                    {/* Icon */}
                                    <div className="w-14 flex-shrink-0 flex items-center justify-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${getTimelineColor(item.category)}`}>
                                            {getTimelineIcon(item.category)}
                                        </div>
                                    </div>
                                    {/* Content */}
                                    <div className="flex-1 p-4">
                                        <h4 className="font-semibold text-gray-900">{item.title}</h4>
                                        {item.description && (
                                            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Post Approval Note */}
                {proposal.postApprovalNote && (
                    <Card className="mb-8 bg-blue-50 border-blue-200">
                        <CardContent className="py-4">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    <MessageCircle className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-blue-800">What Happens After Approval?</p>
                                    <p className="text-sm text-blue-700 mt-1">{proposal.postApprovalNote}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}


                {/* Total */}
                <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white mb-8">
                    <CardContent className="py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Estimated Total</p>
                                <p className="text-4xl font-bold">
                                    ₹{(totalAmount / 100000).toFixed(2)}L
                                </p>
                                {totalAmount === 0 && (
                                    <p className="text-gray-400 text-sm mt-1">Vendor quotes pending</p>
                                )}
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-2 mb-2">
                                    <Shield className="w-5 h-5 text-green-400" />
                                    <span className="text-sm text-gray-300">Preliminary Estimate</span>
                                </div>
                                <p className="text-xs text-gray-500">Final pricing after approval</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t -mx-4 px-4 py-4">
                    <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
                        <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => setShowFeedback(!showFeedback)}
                        >
                            <MessageCircle className="w-4 h-4" /> Request Changes
                        </Button>
                        <div className="flex gap-3">
                            <Button variant="outline" className="gap-2" onClick={() => window.print()}>
                                <Download className="w-4 h-4" /> Download PDF
                            </Button>
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 gap-2 px-8"
                                onClick={handleApprove}
                                disabled={approving}
                            >
                                {approving ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Approving...</>
                                ) : (
                                    <><Check className="w-5 h-5" /> Approve Proposal</>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Feedback Form */}
                {showFeedback && (
                    <Card className="mt-6 border-amber-200 bg-amber-50">
                        <CardHeader>
                            <CardTitle className="text-lg">Request Changes</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea
                                placeholder="Describe what changes you'd like..."
                                value={feedback}
                                onChange={e => setFeedback(e.target.value)}
                                rows={4}
                            />
                            <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setShowFeedback(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleRequestChanges}>
                                    Send Feedback
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Contact Planner */}
                <div className="mt-12 text-center">
                    <p className="text-gray-500 mb-4">Questions about this proposal?</p>
                    <div className="flex items-center justify-center gap-4">
                        <Button variant="outline" className="gap-2">
                            <Phone className="w-4 h-4" /> {proposal.plannerPhone}
                        </Button>
                        <Button variant="outline" className="gap-2">
                            <Mail className="w-4 h-4" /> Email Planner
                        </Button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t bg-white/50 py-6">
                <div className="max-w-5xl mx-auto px-4 text-center text-sm text-gray-400">
                    <p>This proposal is valid until {proposal.validUntil} • Prices subject to change after validity period</p>
                </div>
            </footer>
        </div>
    )
}
