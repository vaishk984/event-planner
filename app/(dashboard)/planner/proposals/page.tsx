'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    FileText, Clock, Check, Send, History,
    IndianRupee, Search, Calendar, Users, MapPin,
    Loader2, ExternalLink, Copy, Eye
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface ProposalRow {
    id: string
    event_id: string
    version: number
    token: string
    status: string
    snapshot_data: any
    client_feedback: string | null
    created_at: string
    // joined from events
    event_name?: string
    client_name?: string
    event_date?: string
    guest_count?: number
    city?: string
}

function getStatusColor(status: string) {
    switch (status) {
        case 'sent': return 'bg-blue-100 text-blue-700'
        case 'viewed': return 'bg-purple-100 text-purple-700'
        case 'approved': return 'bg-green-100 text-green-700'
        case 'changes_requested': return 'bg-orange-100 text-orange-700'
        default: return 'bg-gray-100 text-gray-700'
    }
}

function getStatusLabel(status: string) {
    switch (status) {
        case 'sent': return 'Sent'
        case 'viewed': return 'Viewed'
        case 'approved': return 'Approved ✓'
        case 'changes_requested': return 'Changes Requested'
        default: return 'Draft'
    }
}

export default function ProposalsPage() {
    const [proposals, setProposals] = useState<ProposalRow[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedProposal, setSelectedProposal] = useState<ProposalRow | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetchProposals()
    }, [])

    const fetchProposals = async () => {
        const supabase = createClient()

        // Fetch all proposal snapshots with event info
        const { data, error } = await supabase
            .from('proposal_snapshots')
            .select('*, events!inner(name, client_name, date, guest_count, city)')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching proposals:', error)
            // Fallback: fetch without join
            const { data: fallbackData } = await supabase
                .from('proposal_snapshots')
                .select('*')
                .order('created_at', { ascending: false })

            const mapped = (fallbackData || []).map((p: any) => ({
                ...p,
                event_name: p.snapshot_data?.eventName || 'Unknown Event',
                client_name: p.snapshot_data?.clientName || 'Unknown Client',
                event_date: p.snapshot_data?.date || '',
                guest_count: p.snapshot_data?.guestCount || 0,
                city: p.snapshot_data?.city || '',
            }))
            setProposals(mapped)
        } else {
            const mapped = (data || []).map((p: any) => ({
                ...p,
                event_name: p.events?.name || p.snapshot_data?.eventName || 'Unknown Event',
                client_name: p.events?.client_name || p.snapshot_data?.clientName || 'Unknown Client',
                event_date: p.events?.date || p.snapshot_data?.date || '',
                guest_count: p.events?.guest_count || p.snapshot_data?.guestCount || 0,
                city: p.events?.city || p.snapshot_data?.city || '',
            }))
            setProposals(mapped)
        }

        setLoading(false)
    }

    const copyLink = (token: string) => {
        const url = `${window.location.origin}/proposal/${token}`
        navigator.clipboard.writeText(url)
        toast.success('Proposal link copied!')
    }

    // Stats
    const totalProposals = proposals.length
    const pendingProposals = proposals.filter(p => p.status === 'sent' || p.status === 'viewed' || p.status === 'changes_requested').length
    const approvedProposals = proposals.filter(p => p.status === 'approved').length
    const totalRevenue = proposals
        .filter(p => p.status === 'approved')
        .reduce((sum, p) => {
            const cats = p.snapshot_data?.categories || []
            return sum + cats.reduce((s: number, c: any) => s + (c.price || 0), 0)
        }, 0)

    const filteredProposals = proposals.filter(p =>
        (p.event_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.client_name || '').toLowerCase().includes(searchQuery.toLowerCase())
    )

    const selectedTotal = selectedProposal
        ? (selectedProposal.snapshot_data?.categories || []).reduce((sum: number, c: any) => sum + (c.price || 0), 0)
        : 0

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Proposals</h1>
                    <p className="text-gray-500">All proposal snapshots across your events</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-blue-700">{totalProposals}</p>
                                <p className="text-sm text-blue-600">Total</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-orange-700">{pendingProposals}</p>
                                <p className="text-sm text-orange-600">Pending</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                <Check className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-700">{approvedProposals}</p>
                                <p className="text-sm text-green-600">Approved</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                <IndianRupee className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-purple-700">₹{(totalRevenue / 100000).toFixed(1)}L</p>
                                <p className="text-sm text-purple-600">Revenue</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                    placeholder="Search by event or client name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Proposals List */}
                <div className="lg:col-span-1 space-y-3">
                    <h2 className="font-semibold text-gray-700">All Proposals</h2>
                    {filteredProposals.length === 0 ? (
                        <Card className="p-8 text-center">
                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No proposals found</p>
                            <p className="text-sm text-gray-400 mt-1">Send a final proposal from an event's Client tab</p>
                        </Card>
                    ) : (
                        filteredProposals.map((proposal) => (
                            <Card
                                key={proposal.id}
                                className={`cursor-pointer transition-all hover:shadow-md hover:border-indigo-300 ${selectedProposal?.id === proposal.id ? 'ring-2 ring-indigo-500 border-indigo-400' : ''}`}
                                onClick={() => setSelectedProposal(proposal)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{proposal.event_name}</h3>
                                            <p className="text-sm text-gray-500">{proposal.client_name}</p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(proposal.status)}`}>
                                            {getStatusLabel(proposal.status)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        {proposal.event_date && (
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(proposal.event_date).toLocaleDateString()}
                                            </span>
                                        )}
                                        {proposal.guest_count ? (
                                            <span className="flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                {proposal.guest_count}
                                            </span>
                                        ) : null}
                                    </div>
                                    <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t">
                                        <div className="flex items-center gap-1 text-gray-500">
                                            <History className="w-4 h-4" />
                                            v{proposal.version}
                                        </div>
                                        <div className="text-gray-500">
                                            {new Date(proposal.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* Proposal Detail */}
                <div className="lg:col-span-2">
                    {selectedProposal ? (
                        <Card>
                            <CardHeader className="border-b">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            {selectedProposal.event_name}
                                            <Badge className={getStatusColor(selectedProposal.status)}>
                                                {getStatusLabel(selectedProposal.status)}
                                            </Badge>
                                        </CardTitle>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Users className="w-4 h-4" />
                                                {selectedProposal.client_name}
                                            </span>
                                            {selectedProposal.city && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" />
                                                    {selectedProposal.city}
                                                </span>
                                            )}
                                            {selectedProposal.event_date && (
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(selectedProposal.event_date).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => copyLink(selectedProposal.token)}>
                                            <Copy className="w-4 h-4 mr-1" /> Copy Link
                                        </Button>
                                        <Link href={`/proposal/${selectedProposal.token}`} target="_blank">
                                            <Button size="sm" className="gap-1 bg-indigo-600 hover:bg-indigo-700">
                                                <ExternalLink className="w-4 h-4" /> Open
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                {/* Vendor Items from snapshot */}
                                <div className="space-y-2 mb-6">
                                    {(selectedProposal.snapshot_data?.categories || []).map((cat: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <div className="font-medium text-gray-900">{cat.vendor?.name || 'Vendor TBD'}</div>
                                                <div className="text-sm text-gray-500">{cat.name || 'Service'}</div>
                                            </div>
                                            <div className="font-semibold flex items-center">
                                                <IndianRupee className="w-4 h-4" />
                                                {(cat.price || 0).toLocaleString('en-IN')}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Total */}
                                <div className="pt-4 border-t flex items-center justify-between">
                                    <span className="text-lg font-semibold">Total</span>
                                    <span className="text-2xl font-bold text-indigo-600 flex items-center">
                                        <IndianRupee className="w-5 h-5" />
                                        {selectedTotal.toLocaleString('en-IN')}
                                    </span>
                                </div>

                                {/* Client Feedback */}
                                {selectedProposal.client_feedback && (
                                    <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                        <p className="font-medium text-amber-800 mb-1">Client Feedback</p>
                                        <p className="text-sm text-amber-700">{selectedProposal.client_feedback}</p>
                                    </div>
                                )}

                                {/* Timeline */}
                                {selectedProposal.snapshot_data?.timeline?.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                            <Clock className="w-4 h-4" /> Event Timeline
                                        </h3>
                                        <div className="space-y-2">
                                            {selectedProposal.snapshot_data.timeline.map((item: any, idx: number) => (
                                                <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                                                    <span className="font-bold text-indigo-600 w-16 flex-shrink-0">{item.time}</span>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{item.title}</p>
                                                        {item.description && <p className="text-sm text-gray-500">{item.description}</p>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Link to event */}
                                <div className="mt-6 pt-4 border-t">
                                    <Link href={`/planner/events/${selectedProposal.event_id}/proposal`}>
                                        <Button variant="outline" className="w-full">
                                            <Eye className="w-4 h-4 mr-2" /> View in Event
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="h-full flex items-center justify-center min-h-[400px]">
                            <div className="text-center text-gray-500">
                                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>Select a proposal to view details</p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
