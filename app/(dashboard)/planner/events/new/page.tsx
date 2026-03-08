'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
    ArrowLeft, Link2, Copy, CheckCircle2, Send, ExternalLink,
    Sparkles, Users, QrCode, Mail, MessageSquare
} from 'lucide-react'
import { createPendingSubmission } from '@/lib/client-submissions'

export default function NewEventPage() {
    const [clientName, setClientName] = useState('')
    const [clientPhone, setClientPhone] = useState('')
    const [linkGenerated, setLinkGenerated] = useState(false)
    const [copied, setCopied] = useState(false)

    // Generate a unique token for the client portal
    const [token] = useState(() => `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`)
    const portalUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/client/${token}`

    const generateLink = () => {
        if (clientName.trim()) {
            // Create pending submission in shared store
            createPendingSubmission(token, clientName, clientPhone)
            setLinkGenerated(true)
        }
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(portalUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="max-w-2xl mx-auto py-8 space-y-6">
            {/* Header */}
            <div>
                <Link
                    href="/planner/events"
                    className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Events
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">New Event</h1>
                <p className="text-gray-500 mt-1">
                    Generate a Client Portal link to capture requirements
                </p>
            </div>

            {/* Info Banner */}
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                <CardContent className="p-4 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-amber-800">How it works</h3>
                        <ol className="text-sm text-amber-700 mt-2 space-y-1">
                            <li>1. Enter client details below</li>
                            <li>2. Generate a unique portal link</li>
                            <li>3. Share link with client via WhatsApp/SMS/Email</li>
                            <li>4. Client fills their requirements in the portal</li>
                            <li>5. Submission appears in your Events list automatically</li>
                        </ol>
                    </div>
                </CardContent>
            </Card>

            {/* Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="w-5 h-5 text-orange-500" /> Client Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="clientName">Client Name *</Label>
                            <Input
                                id="clientName"
                                placeholder="e.g., Priya Sharma"
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="clientPhone">Phone Number</Label>
                            <Input
                                id="clientPhone"
                                placeholder="e.g., +91 98765 43210"
                                value={clientPhone}
                                onChange={(e) => setClientPhone(e.target.value)}
                            />
                        </div>
                    </div>

                    {!linkGenerated ? (
                        <Button
                            onClick={generateLink}
                            disabled={!clientName.trim()}
                            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 gap-2"
                        >
                            <Link2 className="w-4 h-4" /> Generate Portal Link
                        </Button>
                    ) : (
                        <div className="space-y-4">
                            {/* Success Banner */}
                            <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                                <CheckCircle2 className="w-6 h-6 text-green-500" />
                                <div>
                                    <p className="font-medium text-green-800">Link Generated!</p>
                                    <p className="text-sm text-green-600">Share this with {clientName}</p>
                                </div>
                            </div>

                            {/* Link Display */}
                            <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                                <Label className="text-xs text-gray-500 uppercase">Client Portal Link</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={portalUrl}
                                        readOnly
                                        className="bg-white font-mono text-sm"
                                    />
                                    <Button
                                        onClick={copyToClipboard}
                                        variant="outline"
                                        className="gap-2"
                                    >
                                        {copied ? (
                                            <><CheckCircle2 className="w-4 h-4 text-green-500" /> Copied!</>
                                        ) : (
                                            <><Copy className="w-4 h-4" /> Copy</>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Share Options */}
                            <div className="grid grid-cols-3 gap-3">
                                <Button variant="outline" className="gap-2 flex-col h-auto py-4">
                                    <MessageSquare className="w-5 h-5 text-green-600" />
                                    <span className="text-xs">WhatsApp</span>
                                </Button>
                                <Button variant="outline" className="gap-2 flex-col h-auto py-4">
                                    <Mail className="w-5 h-5 text-blue-600" />
                                    <span className="text-xs">Email</span>
                                </Button>
                                <Button variant="outline" className="gap-2 flex-col h-auto py-4">
                                    <Send className="w-5 h-5 text-purple-600" />
                                    <span className="text-xs">SMS</span>
                                </Button>
                            </div>

                            {/* Preview Link */}
                            <Link href={`/client/${token}`} target="_blank">
                                <Button variant="outline" className="w-full gap-2">
                                    <ExternalLink className="w-4 h-4" /> Preview Client Portal
                                </Button>
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Existing Events Info */}
            <Card className="bg-gray-50 border-gray-200">
                <CardContent className="p-4 flex items-center gap-4">
                    <Badge variant="outline" className="text-gray-500">Tip</Badge>
                    <p className="text-sm text-gray-600">
                        Once the client submits their requirements, the event will appear in your
                        <Link href="/planner/events" className="text-orange-600 font-medium"> Events list</Link> for you to manage.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
