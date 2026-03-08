'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
    Search, MoreVertical, CheckCircle2, XCircle, Eye,
    Mail, Phone, Calendar, Star
} from 'lucide-react'

const MOCK_PLANNERS = [
    {
        id: 1,
        name: 'Dream Events Co.',
        email: 'contact@dreamevents.in',
        phone: '+91 98765 43210',
        status: 'active',
        events: 45,
        revenue: 5600000,
        rating: 4.8,
        joinedAt: '2024-01-15'
    },
    {
        id: 2,
        name: 'EventCraft Studio',
        email: 'hello@eventcraft.in',
        phone: '+91 98765 43211',
        status: 'active',
        events: 38,
        revenue: 4200000,
        rating: 4.6,
        joinedAt: '2024-02-20'
    },
    {
        id: 3,
        name: 'Celebrations Plus',
        email: 'info@celebrationsplus.in',
        phone: '+91 98765 43212',
        status: 'pending',
        events: 0,
        revenue: 0,
        rating: 0,
        joinedAt: '2025-01-01'
    },
    {
        id: 4,
        name: 'Royal Occasions',
        email: 'book@royaloccasions.in',
        phone: '+91 98765 43213',
        status: 'active',
        events: 28,
        revenue: 3200000,
        rating: 4.5,
        joinedAt: '2024-03-10'
    },
    {
        id: 5,
        name: 'Moments & Memories',
        email: 'hello@moments.in',
        phone: '+91 98765 43214',
        status: 'suspended',
        events: 12,
        revenue: 800000,
        rating: 3.2,
        joinedAt: '2024-06-15'
    },
]

export default function PlannersPage() {
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'suspended'>('all')

    const filteredPlanners = MOCK_PLANNERS.filter(p => {
        if (filter !== 'all' && p.status !== filter) return false
        if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
        return true
    })

    const formatCurrency = (amount: number) => {
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
        return `₹${amount.toLocaleString()}`
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Planners</h1>
                    <p className="text-gray-500">Manage event planners on the platform</p>
                </div>
                <Button className="bg-red-500 hover:bg-red-600">
                    + Invite Planner
                </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                        placeholder="Search planners..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2">
                    {(['all', 'active', 'pending', 'suspended'] as const).map(status => (
                        <Button
                            key={status}
                            variant={filter === status ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilter(status)}
                            className={filter === status ? 'bg-slate-900' : ''}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <Card>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left p-4 font-medium text-gray-600">Planner</th>
                                <th className="text-left p-4 font-medium text-gray-600">Contact</th>
                                <th className="text-left p-4 font-medium text-gray-600">Events</th>
                                <th className="text-left p-4 font-medium text-gray-600">Revenue</th>
                                <th className="text-left p-4 font-medium text-gray-600">Rating</th>
                                <th className="text-left p-4 font-medium text-gray-600">Status</th>
                                <th className="text-left p-4 font-medium text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPlanners.map(planner => (
                                <tr key={planner.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                                                {planner.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium">{planner.name}</p>
                                                <p className="text-xs text-gray-400">Since {planner.joinedAt}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm">
                                            <p className="flex items-center gap-1 text-gray-600">
                                                <Mail className="w-3 h-3" /> {planner.email}
                                            </p>
                                            <p className="flex items-center gap-1 text-gray-400">
                                                <Phone className="w-3 h-3" /> {planner.phone}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-semibold">{planner.events}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-semibold text-green-600">
                                            {formatCurrency(planner.revenue)}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {planner.rating > 0 ? (
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                                <span className="font-medium">{planner.rating}</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <Badge className={
                                            planner.status === 'active' ? 'bg-green-100 text-green-700' :
                                                planner.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-red-100 text-red-700'
                                        }>
                                            {planner.status}
                                        </Badge>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon">
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            {planner.status === 'pending' && (
                                                <>
                                                    <Button variant="ghost" size="icon" className="text-green-600">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-red-600">
                                                        <XCircle className="w-4 h-4" />
                                                    </Button>
                                                </>
                                            )}
                                            <Button variant="ghost" size="icon">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    )
}
