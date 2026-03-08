'use client'

import { useState } from 'react'
import { Check, Copy, ExternalLink, RefreshCw, Smartphone, Laptop, Send, FileCheck, History, Globe, MessageSquare, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { generateClientToken, getClientAccessDetails } from '@/actions/client-management'
import { sendFinalProposal, getOrCreateClientToken, sendPlannerMessage, getClientMessages } from '@/actions/client-portal'
import { useEffect } from 'react'

export default function ClientManagementPage({ params }: { params: Promise<{ id: string }> }) {
    const [event, setEvent] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [sendingFinal, setSendingFinal] = useState(false)
    const [portalToken, setPortalToken] = useState<string | null>(null)
    const [generatingPortal, setGeneratingPortal] = useState(false)
    const [clientMessages, setClientMessages] = useState<any[]>([])
    const [replyMessage, setReplyMessage] = useState('')
    const [sendingReply, setSendingReply] = useState(false)
    const { toast } = useToast()
    const [id, setId] = useState<string>('')

    useEffect(() => {
        params.then(p => {
            setId(p.id)
            loadDetails(p.id)
        })
    }, [params])

    async function loadDetails(eventId: string) {
        setLoading(true)
        const { data, error } = await getClientAccessDetails(eventId)
        if (error) {
            toast({ title: 'Error', description: 'Failed to load client details', variant: 'destructive' })
        } else {
            setEvent(data)
        }

        // Load portal token
        const tokenResult = await getOrCreateClientToken(eventId)
        if (tokenResult.token) {
            setPortalToken(tokenResult.token)
            // Load messages
            const msgResult = await getClientMessages(tokenResult.token)
            setClientMessages(msgResult.data || [])
        }

        setLoading(false)
    }

    async function onGenerateToken() {
        setLoading(true)
        const result = await generateClientToken(id)
        if (result.error) {
            toast({ title: 'Error', description: result.error, variant: 'destructive' })
        } else {
            toast({ title: 'Success', description: 'Client access link generated' })
            loadDetails(id)
        }
        setLoading(false)
    }

    async function onGeneratePortalLink() {
        setGeneratingPortal(true)
        const result = await getOrCreateClientToken(id)
        if (result.error) {
            toast({ title: 'Error', description: result.error, variant: 'destructive' })
        } else {
            setPortalToken(result.token || null)
            toast({ title: 'Success', description: 'Client portal link ready!' })
        }
        setGeneratingPortal(false)
    }

    async function onSendFinalProposal() {
        setSendingFinal(true)
        try {
            const result = await sendFinalProposal(id)
            if ('error' in result) {
                toast({ title: 'Error', description: result.error, variant: 'destructive' })
            } else {
                toast({
                    title: '🎉 Final Proposal Sent!',
                    description: `Version ${result.version} has been frozen and is ready to share.`,
                })
                loadDetails(id)
            }
        } catch (e) {
            toast({ title: 'Error', description: 'Failed to send final proposal', variant: 'destructive' })
        }
        setSendingFinal(false)
    }

    async function onSendReply() {
        if (!replyMessage.trim()) return
        setSendingReply(true)
        const result = await sendPlannerMessage(id, replyMessage.trim())
        if (result.error) {
            toast({ title: 'Error', description: result.error, variant: 'destructive' })
        } else {
            toast({ title: 'Sent', description: 'Reply sent to client' })
            setReplyMessage('')
            // Refresh messages
            if (portalToken) {
                const msgResult = await getClientMessages(portalToken)
                setClientMessages(msgResult.data || [])
            }
        }
        setSendingReply(false)
    }

    const publicUrl = event?.public_token
        ? `${window.location.origin}/proposal/${event.public_token}`
        : ''

    const finalUrl = event?.final_proposal_token
        ? `${window.location.origin}/proposal/${event.final_proposal_token}`
        : ''

    const portalUrl = portalToken
        ? `${window.location.origin}/portal/${portalToken}`
        : ''

    const copyToClipboard = (url: string, label: string = 'Link') => {
        if (!url) return
        navigator.clipboard.writeText(url)
        toast({ title: 'Copied', description: `${label} copied to clipboard` })
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Client Portal</h2>
                <p className="text-muted-foreground">Manage client access and proposal status.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Preliminary (Draft) Proposal */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <History className="w-5 h-5 text-orange-500" />
                                Draft Proposal
                            </CardTitle>
                            <Badge variant="secondary" className="text-xs">Live / Dynamic</Badge>
                        </div>
                        <CardDescription>
                            Share this draft link for client feedback. Data updates in real-time as you make changes.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>Access Status</Label>
                            <div className="flex items-center gap-2">
                                <Badge variant={event?.public_token ? 'default' : 'secondary'}>
                                    {event?.public_token ? 'Active' : 'Not Generated'}
                                </Badge>
                                {event?.proposal_status && (
                                    <Badge variant="outline" className="capitalize">
                                        {event.proposal_status}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {event?.public_token ? (
                            <div className="space-y-2">
                                <Label>Draft Link</Label>
                                <div className="flex gap-2">
                                    <Input value={publicUrl} readOnly className="bg-muted text-xs" />
                                    <Button size="icon" variant="outline" onClick={() => copyToClipboard(publicUrl, 'Draft link')}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="outline" asChild>
                                        <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Button onClick={onGenerateToken} disabled={loading}>
                                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                Generate Draft Link
                            </Button>
                        )}

                        {event?.public_token && (
                            <Button variant="ghost" size="sm" onClick={onGenerateToken} className="text-xs text-muted-foreground">
                                Regenerate Link (Revoke old access)
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* Final Proposal (Snapshot) */}
                <Card className="border-green-200 bg-green-50/30">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <FileCheck className="w-5 h-5 text-green-600" />
                                Final Proposal
                            </CardTitle>
                            <Badge className="bg-green-100 text-green-800 text-xs border-green-300">Frozen Snapshot</Badge>
                        </div>
                        <CardDescription>
                            Send a frozen proposal that won&apos;t change even if you edit vendors or budgets. The client sees exactly what you intended.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {!event?.public_token ? (
                            <p className="text-sm text-muted-foreground">Generate a draft proposal first.</p>
                        ) : !event?.final_proposal_token ? (
                            <div className="space-y-3">
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                                    ⚠️ Make sure all vendors, prices, and timeline are finalized before sending.
                                </div>
                                <Button
                                    onClick={onSendFinalProposal}
                                    disabled={sendingFinal}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                                >
                                    {sendingFinal ? (
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="mr-2 h-4 w-4" />
                                    )}
                                    Send Final Proposal
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-green-600 text-white">Sent</Badge>
                                </div>
                                <div className="space-y-2">
                                    <Label>Final Proposal Link</Label>
                                    <div className="flex gap-2">
                                        <Input value={finalUrl} readOnly className="bg-muted text-xs" />
                                        <Button size="icon" variant="outline" onClick={() => copyToClipboard(finalUrl, 'Final proposal link')}>
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="outline" asChild>
                                            <a href={finalUrl} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                                <Button
                                    onClick={onSendFinalProposal}
                                    disabled={sendingFinal}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs"
                                >
                                    {sendingFinal ? (
                                        <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                                    ) : (
                                        <RefreshCw className="mr-2 h-3 w-3" />
                                    )}
                                    Re-send (New Version)
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Client Portal Dashboard Link */}
            <Card className="border-orange-200 bg-orange-50/20">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="w-5 h-5 text-orange-600" />
                            Client Dashboard Portal
                        </CardTitle>
                        <Badge className="bg-orange-100 text-orange-800 text-xs border-orange-300">Client View</Badge>
                    </div>
                    <CardDescription>
                        A dedicated dashboard where your client can track event progress, view D-day live updates, and contact you — all without seeing vendor details.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {portalToken ? (
                        <div className="space-y-2">
                            <Label>Client Portal Link</Label>
                            <div className="flex gap-2">
                                <Input value={portalUrl} readOnly className="bg-muted text-xs" />
                                <Button size="icon" variant="outline" onClick={() => copyToClipboard(portalUrl, 'Portal link')}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="outline" asChild>
                                    <a href={portalUrl} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                </Button>
                            </div>
                            <p className="text-xs text-gray-500">Share this link with your client. Vendor details are hidden.</p>
                        </div>
                    ) : (
                        <Button onClick={onGeneratePortalLink} disabled={generatingPortal} className="bg-orange-600 hover:bg-orange-700">
                            {generatingPortal ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Globe className="mr-2 h-4 w-4" />
                            )}
                            Generate Client Portal Link
                        </Button>
                    )}
                </CardContent>
            </Card>

            {/* Client Messages */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-blue-500" />
                        Client Messages
                        {clientMessages.length > 0 && (
                            <Badge variant="outline" className="ml-auto">{clientMessages.length}</Badge>
                        )}
                    </CardTitle>
                    <CardDescription>Messages from your client via the portal</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {clientMessages.length === 0 ? (
                        <div className="text-center py-6 text-gray-400">
                            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No messages yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                            {clientMessages.map((msg: any) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender_type === 'planner' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[75%] rounded-xl px-4 py-2 ${msg.sender_type === 'planner'
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        <p className="text-sm">{msg.message}</p>
                                        <p className={`text-xs mt-1 ${msg.sender_type === 'planner' ? 'text-blue-200' : 'text-gray-400'
                                            }`}>
                                            {msg.sender_type === 'planner' ? 'You' : 'Client'} •{' '}
                                            {new Date(msg.created_at).toLocaleString('en-IN', {
                                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Reply */}
                    <div className="flex gap-2 pt-2 border-t">
                        <Input
                            value={replyMessage}
                            onChange={e => setReplyMessage(e.target.value)}
                            placeholder="Reply to client..."
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    onSendReply()
                                }
                            }}
                        />
                        <Button
                            onClick={onSendReply}
                            disabled={sendingReply || !replyMessage.trim()}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {sendingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Client feedback section */}
            {event?.client_feedback && (
                <Card className="border-blue-200">
                    <CardHeader>
                        <CardTitle className="text-lg">Client Feedback</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm bg-blue-50 p-4 rounded-lg italic">&ldquo;{event.client_feedback}&rdquo;</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

