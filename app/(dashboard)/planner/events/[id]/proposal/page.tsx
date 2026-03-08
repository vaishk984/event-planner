'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    FileText, Send, Eye, Download, CheckCircle2, Clock,
    IndianRupee, Calendar, Sparkles, ArrowRight, Loader2,
    Link2, Copy, ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'sent':
            return <Badge className="bg-blue-100 text-blue-700">Sent</Badge>
        case 'viewed':
            return <Badge className="bg-purple-100 text-purple-700">Viewed</Badge>
        case 'approved':
            return <Badge className="bg-green-100 text-green-700">Approved</Badge>
        case 'changes_requested':
            return <Badge className="bg-amber-100 text-amber-700">Changes Requested</Badge>
        case 'final_sent':
            return <Badge className="bg-indigo-100 text-indigo-700">Final Sent</Badge>
        default:
            return <Badge className="bg-gray-100 text-gray-700">Draft</Badge>
    }
}

interface ProposalSnapshot {
    id: string
    version: number
    token: string
    status: string
    snapshot_data: any
    client_feedback: string | null
    created_at: string
}

export default function ProposalPage() {
    const params = useParams()
    const id = params.id as string

    const [loading, setLoading] = useState(true)
    const [event, setEvent] = useState<any>(null)
    const [snapshots, setSnapshots] = useState<ProposalSnapshot[]>([])

    useEffect(() => {
        fetchData()
    }, [id])

    const fetchData = async () => {
        const supabase = createClient()

        // Fetch event
        const { data: eventData } = await supabase
            .from('events')
            .select('id, name, public_token, final_proposal_token, proposal_status')
            .eq('id', id)
            .single()

        setEvent(eventData)

        // Fetch real proposal snapshots
        const { data: snapshotData } = await supabase
            .from('proposal_snapshots')
            .select('*')
            .eq('event_id', id)
            .order('version', { ascending: false })

        setSnapshots(snapshotData || [])
        setLoading(false)
    }

    const copyLink = (token: string) => {
        const url = `${window.location.origin}/proposal/${token}`
        navigator.clipboard.writeText(url)
        toast.success('Proposal link copied to clipboard!')
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        )
    }

    const sentCount = snapshots.filter(s => s.status !== 'draft').length
    const approvedCount = snapshots.filter(s => s.status === 'approved').length
    const hasPreliminaryLink = !!event?.public_token

    return (
        <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-blue-700">{snapshots.length}</p>
                            <p className="text-sm text-blue-600">Total Versions</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                            <Send className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-purple-700">{sentCount}</p>
                            <p className="text-sm text-purple-600">Sent to Client</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-700">{approvedCount}</p>
                            <p className="text-sm text-green-600">Approved</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Preliminary Proposal Link */}
            {hasPreliminaryLink && (
                <Card className="border-blue-200 bg-blue-50/50">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Link2 className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-medium text-blue-800">Preliminary Proposal (Live)</p>
                                <p className="text-sm text-blue-600">Auto-updates when you modify vendors</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => copyLink(event.public_token)}>
                                <Copy className="w-4 h-4 mr-1" /> Copy Link
                            </Button>
                            <Link href={`/proposal/${event.public_token}`} target="_blank">
                                <Button variant="outline" size="sm">
                                    <ExternalLink className="w-4 h-4 mr-1" /> Open
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Preview / Create CTA */}
            <Card className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 border-0 text-white overflow-hidden">
                <CardContent className="py-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                            <Sparkles className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Preview Proposal</h3>
                            <p className="text-white/80 text-sm">See how the client will view your proposal</p>
                        </div>
                    </div>
                    <Link href={`/planner/events/${id}/proposal/proposal_1`}>
                        <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90 font-bold shadow-lg">
                            Open Preview <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                </CardContent>
            </Card>

            {/* Final Proposal Snapshots */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Proposal Versions (Snapshots)</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    {snapshots.length === 0 ? (
                        <div className="text-center py-8">
                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="font-medium text-gray-600 mb-2">No final proposals sent yet</h3>
                            <p className="text-sm text-gray-500 mb-4">
                                Use the Client tab to send a final proposal snapshot to the client
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {snapshots.map((snapshot) => {
                                const totalAmount = snapshot.snapshot_data?.categories?.reduce(
                                    (sum: number, cat: any) => sum + (cat.price || 0), 0
                                ) || 0

                                return (
                                    <div
                                        key={snapshot.id}
                                        className="p-4 rounded-xl border-2 border-gray-200 hover:border-purple-300 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                                                    <FileText className="w-6 h-6 text-purple-600" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-medium">Version {snapshot.version}</h4>
                                                        {getStatusBadge(snapshot.status)}
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <IndianRupee className="w-3 h-3" />
                                                            ₹{(totalAmount / 100000).toFixed(1)}L
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {new Date(snapshot.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    {snapshot.client_feedback && (
                                                        <p className="text-sm text-amber-600 mt-1">
                                                            Client: "{snapshot.client_feedback}"
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => copyLink(snapshot.token)}
                                                >
                                                    <Copy className="w-4 h-4 mr-1" /> Copy Link
                                                </Button>
                                                <Link href={`/proposal/${snapshot.token}`} target="_blank">
                                                    <Button variant="outline" size="sm">
                                                        <ExternalLink className="w-4 h-4 mr-1" /> View
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
