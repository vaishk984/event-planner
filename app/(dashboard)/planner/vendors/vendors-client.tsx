'use client'

import { useState } from 'react'
import { VendorData } from '@/src/backend/entities/Vendor'
import { AddVendorDialog } from './add-vendor-dialog'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, MapPin, Phone, Mail, Globe, ExternalLink, MoreHorizontal, Store } from 'lucide-react'

interface VendorsClientProps {
    vendors: VendorData[]
}

export function VendorsClient({ vendors }: VendorsClientProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('all')

    // Filter Logic
    const filteredVendors = vendors.filter(vendor => {
        const matchesSearch = vendor.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (vendor.contactName && vendor.contactName.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (vendor.location && vendor.location.toLowerCase().includes(searchQuery.toLowerCase()))

        const matchesCategory = categoryFilter === 'all' || vendor.category === categoryFilter

        return matchesSearch && matchesCategory
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Vendor Directory</h2>
                    <p className="text-muted-foreground">Manage your preferred vendors and contacts.</p>
                </div>
                <div className="flex gap-2">
                    <AddVendorDialog />
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center bg-white p-2 rounded-lg border shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search vendors..."
                        className="pl-9 border-0 focus-visible:ring-0"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="w-[200px] border-l pl-4">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="border-0 focus:ring-0">
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="venue">Venue</SelectItem>
                            <SelectItem value="catering">Catering</SelectItem>
                            <SelectItem value="photography">Photography</SelectItem>
                            <SelectItem value="videography">Videography</SelectItem>
                            <SelectItem value="decoration">Decoration</SelectItem>
                            <SelectItem value="music">Music/DJ</SelectItem>
                            <SelectItem value="makeup">Makeup Artist</SelectItem>
                            <SelectItem value="transportation">Transportation</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Grid */}
            {filteredVendors.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
                    <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No vendors found</h3>
                    <p className="text-gray-500">Try adjusting your filters or add a new vendor.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVendors.map((vendor) => (
                        <Card key={vendor.id} className="hover:shadow-md transition-shadow group">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <Badge variant="outline" className="mb-2 capitalize bg-indigo-50 text-indigo-700 border-indigo-100">
                                            {vendor.category}
                                        </Badge>
                                        <CardTitle className="text-xl">{vendor.companyName}</CardTitle>
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-gray-400">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                </div>
                                {vendor.contactName && (
                                    <p className="text-sm text-gray-500">Contact: {vendor.contactName}</p>
                                )}
                            </CardHeader>

                            <CardContent className="space-y-3 pb-3">
                                {vendor.location && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <span>{vendor.location}</span>
                                    </div>
                                )}
                                {vendor.phone && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <span>{vendor.phone}</span>
                                    </div>
                                )}
                                {vendor.email && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <a href={`mailto:${vendor.email}`} className="hover:text-indigo-600 truncate">
                                            {vendor.email}
                                        </a>
                                    </div>
                                )}
                                {vendor.website && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Globe className="w-4 h-4 text-gray-400" />
                                        <a href={vendor.website} target="_blank" rel="noreferrer" className="hover:text-indigo-600 truncate flex items-center gap-1">
                                            Visit Website <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                )}

                                {(vendor.priceRange.min > 0 || vendor.priceRange.max > 0) && (
                                    <div className="pt-2 border-t mt-2">
                                        <p className="text-xs font-semibold text-gray-500 uppercase">Price Range</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {vendor.priceRange.min > 0 ? `₹${vendor.priceRange.min}` : '0'}
                                            {' - '}
                                            {vendor.priceRange.max > 0 ? `₹${vendor.priceRange.max}` : 'Any'}
                                        </p>
                                    </div>
                                )}
                            </CardContent>

                            <CardFooter className="pt-0">
                                {/* <div className="text-xs text-gray-400 w-full text-right">
                                    Added {new Date(vendor.createdAt!).toLocaleDateString()}
                                 </div> */}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
