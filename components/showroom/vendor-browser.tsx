'use client'

import { useState } from 'react'
import { Vendor } from "@/lib/types/vendor"
import { VendorCard } from "@/components/showroom/vendor-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Search, SlidersHorizontal } from "lucide-react"

interface VendorBrowserProps {
    initialVendors: Vendor[]
    categoryLabel: string
}

export function VendorBrowser({ initialVendors, categoryLabel }: VendorBrowserProps) {
    const [filterCity, setFilterCity] = useState<string>('All')
    const [searchQuery, setSearchQuery] = useState('')

    // Deduplicate vendors by ID (DB may contain duplicate records)
    const uniqueVendors = Array.from(
        new Map(initialVendors.filter(v => v.id).map(v => [v.id, v])).values()
    )

    // Extract unique cities (filter out empty/undefined)
    const cities = ['All', ...Array.from(new Set(uniqueVendors.map(v => v.city).filter(Boolean)))]

    // Filter logic
    const filteredVendors = uniqueVendors.filter(vendor => {
        const matchesCity = filterCity === 'All' || vendor.city === filterCity
        const matchesSearch = (vendor.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (vendor.description || '').toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCity && matchesSearch
    })

    return (
        <div className="space-y-6">
            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder={`Search ${categoryLabel}...`}
                        className="pl-9 bg-gray-50 border-gray-200"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                    <div className="flex items-center gap-1 text-sm text-gray-500 mr-2 whitespace-nowrap">
                        <MapPin className="w-4 h-4" />
                        <span className="hidden md:inline">Location:</span>
                    </div>
                    {cities.map((city, idx) => (
                        <button
                            key={`city-${idx}-${city}`}
                            onClick={() => setFilterCity(city)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filterCity === city
                                ? 'bg-gray-900 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {city}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results Info */}
            <div className="flex items-center justify-between text-sm text-gray-500 px-1">
                <p>Showing {filteredVendors.length} results</p>
                {filterCity !== 'All' && (
                    <p>Filtered by: <span className="font-semibold text-gray-900">{filterCity}</span></p>
                )}
            </div>

            {/* Grid */}
            {filteredVendors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredVendors.map((vendor, idx) => (
                        <VendorCard key={`vendor-${vendor.id || idx}`} vendor={vendor} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed">
                    <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Search className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No vendors found</h3>
                    <p className="text-gray-500 mt-1">Try adjusting your location filter or search terms</p>
                    <Button
                        variant="link"
                        onClick={() => { setFilterCity('All'); setSearchQuery('') }}
                        className="mt-2 text-indigo-600"
                    >
                        Clear all filters
                    </Button>
                </div>
            )}
        </div>
    )
}
