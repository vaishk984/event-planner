'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
    Search, MoreVertical, CheckCircle2, XCircle, Eye,
    Mail, Phone, Star, MapPin
} from 'lucide-react'

const MOCK_VENDORS = [
    {
        id: 1,
        name: 'Royal Decorators',
        category: 'Decoration',
        email: 'info@royaldecor.in',
        phone: '+91 98765 43210',
        city: 'Mumbai',
        status: 'active',
        bookings: 89,
        revenue: 2800000,
        rating: 4.9,
        joinedAt: '2024-01-15'
    },
    {
        id: 2,
        name: 'Capture Studios',
        category: 'Photography',
        email: 'hello@capture.in',
        phone: '+91 98765 43211',
        city: 'Delhi',
        status: 'active',
        bookings: 124,
        revenue: 4500000,
        rating: 4.7,
        joinedAt: '2024-02-20'
    },
    {
        id: 3,
        name: 'Melody Musicians',
        category: 'Entertainment',
        email: 'book@melody.in',
        phone: '+91 98765 43212',
        city: 'Bangalore',
        status: 'pending',
        bookings: 0,
        revenue: 0,
        rating: 0,
        joinedAt: '2025-01-01'
    },
    {
        id: 4,
        name: 'Grand Caterers',
        category: 'Catering',
        email: 'orders@grandcaterers.in',
        phone: '+91 98765 43213',
        city: 'Mumbai',
        status: 'active',
        bookings: 156,
        revenue: 8500000,
        rating: 4.6,
        joinedAt: '2024-03-10'
    },
    {
        id: 5,
        name: 'Floral Dreams',
        category: 'Floristry',
        email: 'hello@floraldreams.in',
        phone: '+91 98765 43214',
        city: 'Pune',
        status: 'suspended',
        bookings: 23,
        revenue: 340000,
        rating: 3.1,
        joinedAt: '2024-06-15'
    },
]

const CATEGORIES = ['All', 'Photography', 'Decoration', 'Catering', 'Entertainment', 'Floristry', 'Makeup', 'Venue']

export default function VendorsPage() {
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'suspended'>('all')
    const [category, setCategory] = useState('All')

    const filteredVendors = MOCK_VENDORS.filter(v => {
        if (filter !== 'all' && v.status !== filter) return false
        if (category !== 'All' && v.category !== category) return false
        if (search && !v.name.toLowerCase().includes(search.toLowerCase())) return false
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
                    <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
                    <p className="text-gray-500">Manage vendors on the platform</p>
                </div>
                <Button className="bg-red-500 hover:bg-red-600">
                    + Invite Vendor
                </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 flex-wrap">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                        placeholder="Search vendors..."
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

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {CATEGORIES.map(cat => (
                    <Button
                        key={cat}
                        variant={category === cat ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCategory(cat)}
                        className={category === cat ? 'bg-purple-500 hover:bg-purple-600' : ''}
                    >
                        {cat}
                    </Button>
                ))}
            </div>

            {/* Table */}
            <Card>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left p-4 font-medium text-gray-600">Vendor</th>
                                <th className="text-left p-4 font-medium text-gray-600">Category</th>
                                <th className="text-left p-4 font-medium text-gray-600">Location</th>
                                <th className="text-left p-4 font-medium text-gray-600">Bookings</th>
                                <th className="text-left p-4 font-medium text-gray-600">Revenue</th>
                                <th className="text-left p-4 font-medium text-gray-600">Rating</th>
                                <th className="text-left p-4 font-medium text-gray-600">Status</th>
                                <th className="text-left p-4 font-medium text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVendors.map(vendor => (
                                <tr key={vendor.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
                                                {vendor.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium">{vendor.name}</p>
                                                <p className="text-xs text-gray-400">{vendor.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <Badge variant="outline">{vendor.category}</Badge>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-1 text-gray-600">
                                            <MapPin className="w-3 h-3" /> {vendor.city}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-semibold">{vendor.bookings}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-semibold text-green-600">
                                            {formatCurrency(vendor.revenue)}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {vendor.rating > 0 ? (
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                                <span className="font-medium">{vendor.rating}</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <Badge className={
                                            vendor.status === 'active' ? 'bg-green-100 text-green-700' :
                                                vendor.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-red-100 text-red-700'
                                        }>
                                            {vendor.status}
                                        </Badge>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon">
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            {vendor.status === 'pending' && (
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
