'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
    Send, Copy, Check, MessageCircle, Mail, Download,
    Eye, Calendar, Loader2, ExternalLink, Share2, IndianRupee,
    CheckCircle2, Building2, UtensilsCrossed, Camera, Sparkles, Music, Brush
} from 'lucide-react'
import { toast } from 'sonner'
import { generateProposalToken } from '@/actions/client-portal'
import type { Event, EventVendor } from '@/types/domain'

interface SendPanelProps {
    event: Event
    packages: { silver: any[]; gold: any[]; platinum: any[] }
    design: { moodboard: string[]; colors: string[]; notes: string }
    vendors: EventVendor[]
}

export function SendPanel({ event, packages, design, vendors }: SendPanelProps) {
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(false)
    const [linkGenerated, setLinkGenerated] = useState(false)
    const [proposalLink, setProposalLink] = useState('')

    const [options, setOptions] = useState({
        validityDays: 7,
        personalMessage: `Dear ${event.clientName?.split(' ')[0] || 'Client'},

We're excited to share this custom proposal for your special day. Each vendor has been carefully selected to match your style and budget.

Please review and let us know if you'd like any adjustments.

Best regards,
Your Event Planner`
    })

    const generateLink = async () => {
        setSending(true)

        try {
            const result = await generateProposalToken(event.id)

            if (result.error || !result.token) {
                toast.error(result.error || 'Failed to generate link')
                return
            }

            const token = result.token
            // In production, this link should point to the real Client Portal
            const link = `${window.location.origin}/client/proposal/${token}`

            setProposalLink(link)
            setLinkGenerated(true)
            toast.success('Proposal link generated and saved!')
        } catch (error) {
            console.error('Error generating link:', error)
            toast.error('Something went wrong')
        } finally {
            setSending(false)
        }
    }

    const copyLink = () => {
        navigator.clipboard.writeText(proposalLink)
        toast.success('Link copied to clipboard!')
    }

    const sendViaWhatsApp = () => {
        const message = encodeURIComponent(
            `${options.personalMessage}\n\nView your proposal here: ${proposalLink}`
        )
        window.open(`https://wa.me/${event.clientPhone?.replace(/\D/g, '')}?text=${message}`, '_blank')
    }

    const sendViaEmail = () => {
        const subject = encodeURIComponent(`Event Proposal - ${event.name}`)
        const body = encodeURIComponent(
            `${options.personalMessage}\n\nView your proposal here: ${proposalLink}`
        )
        window.open(`mailto:${event.clientEmail}?subject=${subject}&body=${body}`, '_blank')
    }

    // Calculate totals from passed vendors
    const categories = vendors.map(v => ({
        name: v.vendorCategory || 'Service',
        vendor: v.vendorName || 'Selected Vendor',
        price: v.agreedAmount || 0,
        // Use a default icon or map dynamically if needed, avoiding complex imports for now
        icon: Sparkles
    }))

    const totalAmount = categories.reduce((sum, cat) => sum + cat.price, 0)
    const platformFee = Math.round(totalAmount * 0.02)
    const grandTotal = totalAmount + platformFee

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Review & Send</h2>
                    <p className="text-sm text-gray-500">Finalize your proposal and share with the client</p>
                </div>
                {sent && (
                    <Badge className="bg-green-100 text-green-700 gap-1">
                        <Check className="w-3 h-3" /> Proposal Sent
                    </Badge>
                )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column - Proposal Summary */}
                <div className="space-y-6">
                    {/* Proposal Summary */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Proposal Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {categories.length === 0 ? (
                                <p className="text-sm text-gray-500 py-4 text-center">No vendors assigned yet.</p>
                            ) : (
                                categories.map((cat, index) => {
                                    const Icon = cat.icon
                                    return (
                                        <div key={`${cat.name}-${index}`} className="flex items-center justify-between py-2 border-b last:border-0">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                                                    <Icon className="w-4 h-4 text-orange-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{cat.name}</p>
                                                    <p className="text-xs text-gray-500">{cat.vendor}</p>
                                                </div>
                                            </div>
                                            <span className="font-medium text-sm">₹{(cat.price / 1000).toFixed(0)}K</span>
                                        </div>
                                    )
                                })
                            )}

                            {/* Totals */}
                            <div className="pt-3 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span>₹{(totalAmount / 100000).toFixed(2)}L</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Platform Fee (2%)</span>
                                    <span>₹{(platformFee / 1000).toFixed(0)}K</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                    <span>Grand Total</span>
                                    <span className="text-green-600">₹{(grandTotal / 100000).toFixed(2)}L</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Validity */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> Proposal Validity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <Input
                                    type="number"
                                    value={options.validityDays}
                                    onChange={e => setOptions({ ...options, validityDays: Number(e.target.value) })}
                                    className="w-20"
                                    min={1}
                                    max={30}
                                />
                                <span className="text-gray-600">days from today</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                                Expires on: {new Date(Date.now() + options.validityDays * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                                })}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Personal Message */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Personal Message</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={options.personalMessage}
                                onChange={e => setOptions({ ...options, personalMessage: e.target.value })}
                                className="min-h-[150px]"
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Actions */}
                <div className="space-y-6">
                    {/* Preview Card */}
                    <Card className="bg-gradient-to-br from-orange-50 to-rose-50 border-orange-200">
                        <CardContent className="py-8 text-center">
                            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                                <Eye className="w-8 h-8 text-orange-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Preview Proposal</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                See how your proposal will look to the client
                            </p>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => {
                                    const previewUrl = `/planner/events/${event.id}/proposal/preview`
                                    window.open(previewUrl, '_blank')
                                    toast.success('Preview opened in new tab')
                                }}
                            >
                                <Eye className="w-4 h-4 mr-2" /> Open Preview
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Generate Link */}
                    {!linkGenerated ? (
                        <Card>
                            <CardContent className="py-8 text-center">
                                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                                    <Share2 className="w-8 h-8 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Generate Proposal Link</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Create a unique link for your client to view and approve
                                </p>
                                <Button
                                    className="w-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600"
                                    onClick={generateLink}
                                    disabled={sending}
                                >
                                    {sending ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                                    ) : (
                                        <><Share2 className="w-4 h-4 mr-2" /> Generate Link</>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="bg-green-50 border-green-200">
                            <CardContent className="py-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                    <span className="font-medium text-green-700">Link Generated</span>
                                </div>
                                <div className="flex items-center gap-2 mb-4">
                                    <Input
                                        value={proposalLink}
                                        readOnly
                                        className="bg-white"
                                    />
                                    <Button variant="outline" size="icon" onClick={copyLink}>
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        className="bg-green-600 hover:bg-green-700"
                                        onClick={sendViaWhatsApp}
                                    >
                                        <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={sendViaEmail}
                                    >
                                        <Mail className="w-4 h-4 mr-2" /> Email
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Download Options */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Export Options</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full justify-start">
                                <Download className="w-4 h-4 mr-2" /> Download as PDF
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                <ExternalLink className="w-4 h-4 mr-2" /> Open in New Tab
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
