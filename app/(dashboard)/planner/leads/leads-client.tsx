'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
    Phone, Mail, Calendar, IndianRupee,
    Search, Star, TrendingUp, PhoneCall, MessageSquare
} from 'lucide-react'
import type { Lead } from '@/actions/leads'

interface LeadsClientProps {
    leads: Lead[]
}

function getSourceIcon(source?: string) {
    switch (source) {
        case 'social_media': return '📸'
        case 'referral': return '🤝'
        case 'website': return '🌐'
        case 'advertisement': return '📺'
        case 'walk_in': return '🚶'
        default: return '📧'
    }
}

export function LeadsClient({ leads }: LeadsClientProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('')

    const filteredLeads = leads.filter(lead => {
        const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (lead.email && lead.email.toLowerCase().includes(searchQuery.toLowerCase()))
        const matchesStatus = !statusFilter || lead.status === statusFilter
        return matchesSearch && matchesStatus
    })

    // Sort by score (hot leads first)
    const sortedLeads = [...filteredLeads].sort((a, b) => (b.score || 0) - (a.score || 0))

    return (
        <>
            {/* Search & Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search leads..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                    <option value="">All Statuses</option>
                    <option value="prospect">Prospect</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            {/* Leads List */}
            {sortedLeads.length === 0 ? (
                <Card className="p-12 text-center">
                    <p className="text-gray-500 mb-4">No leads found</p>
                    <Link href="/planner/leads/new">
                        <Button>Add Your First Lead</Button>
                    </Link>
                </Card>
            ) : (
                <div className="space-y-3">
                    {sortedLeads.map((lead) => {
                        const score = lead.score || 0
                        const isHot = score >= 70

                        return (
                            <Card key={lead.id} className="p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        {/* Header */}
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold text-lg text-gray-900">{lead.name}</h3>
                                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 capitalize">
                                                {lead.status}
                                            </span>
                                            <span className="text-lg" title={`Source: ${lead.source || 'unknown'}`}>
                                                {getSourceIcon(lead.source)}
                                            </span>
                                            {isHot && (
                                                <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                                                    <Star className="w-3 h-3 fill-amber-500" /> Hot
                                                </span>
                                            )}
                                        </div>

                                        {/* Contact Info */}
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                                            {lead.email && (
                                                <span className="flex items-center gap-1">
                                                    <Mail className="w-4 h-4" /> {lead.email}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Phone className="w-4 h-4" /> {lead.phone}
                                            </span>
                                        </div>

                                        {/* Event Details */}
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                            {lead.event_type && (
                                                <span className="flex items-center gap-1 capitalize">
                                                    <Calendar className="w-4 h-4" /> {lead.event_type}
                                                    {lead.event_date && ` • ${new Date(lead.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                                                </span>
                                            )}
                                            {lead.budget_range && (
                                                <span className="flex items-center gap-1">
                                                    <IndianRupee className="w-4 h-4" /> {lead.budget_range}
                                                </span>
                                            )}
                                        </div>

                                        {/* Notes */}
                                        {lead.notes && (
                                            <p className="text-sm text-gray-600 mt-2 italic">"{lead.notes}"</p>
                                        )}
                                    </div>

                                    {/* Right Side - Score + Actions */}
                                    <div className="flex flex-col items-end gap-2">
                                        {/* Score */}
                                        <div className="flex items-center gap-1 text-sm">
                                            <TrendingUp className="w-4 h-4 text-indigo-500" />
                                            <span className="font-semibold">{score}</span>
                                            <span className="text-gray-400">score</span>
                                        </div>

                                        {/* Quick Actions */}
                                        <div className="flex gap-2 mt-2">
                                            <Button size="sm" variant="outline" className="gap-1" title="Call">
                                                <PhoneCall className="w-4 h-4" />
                                            </Button>
                                            <Button size="sm" variant="outline" className="gap-1" title="WhatsApp">
                                                <MessageSquare className="w-4 h-4" />
                                            </Button>
                                            <Link href={`/planner/leads/${lead.id}`}>
                                                <Button size="sm">View</Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            )}
        </>
    )
}
