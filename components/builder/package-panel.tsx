'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
    Building2, UtensilsCrossed, Camera, Sparkles, Music, Brush, Car,
    ChevronRight, IndianRupee, Check, Star, Plus, Minus, Edit2
} from 'lucide-react'
import type { Event, Vendor } from '@/types/domain'

interface PackagePanelProps {
    event: Event
    shortlist: { confirmed: Vendor[]; maybe: Vendor[] }
    packages: { silver: any[]; gold: any[]; platinum: any[] }
    onUpdatePackages: (packages: { silver: any[]; gold: any[]; platinum: any[] }) => void
    onNext: () => void
}

// Helper to get category icon and color
const getCategoryDetails = (category: string) => {
    const details: Record<string, { name: string; icon: any; color: string }> = {
        venue: { name: 'Venue', icon: Building2, color: 'blue' },
        catering: { name: 'Catering', icon: UtensilsCrossed, color: 'amber' },
        decor: { name: 'Decor & Flowers', icon: Sparkles, color: 'pink' },
        photography: { name: 'Photography', icon: Camera, color: 'purple' },
        entertainment: { name: 'Entertainment', icon: Music, color: 'indigo' },
        makeup: { name: 'Makeup', icon: Brush, color: 'rose' },
        other: { name: 'Other Services', icon: Check, color: 'gray' }
    }
    return details[category] || details.other
}

const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; light: string }> = {
        blue: { bg: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-50' },
        amber: { bg: 'bg-amber-500', text: 'text-amber-600', light: 'bg-amber-50' },
        pink: { bg: 'bg-pink-500', text: 'text-pink-600', light: 'bg-pink-50' },
        purple: { bg: 'bg-purple-500', text: 'text-purple-600', light: 'bg-purple-50' },
        indigo: { bg: 'bg-indigo-500', text: 'text-indigo-600', light: 'bg-indigo-50' },
        rose: { bg: 'bg-rose-500', text: 'text-rose-600', light: 'bg-rose-50' },
        gray: { bg: 'bg-gray-500', text: 'text-gray-600', light: 'bg-gray-50' },
    }
    return colors[color] || colors.blue
}

interface CategoryVendor {
    id: string
    name: string
    price: number
    rating: number
    selected: boolean
    perPlate: number
}

interface Category {
    id: string
    name: string
    icon: any
    color: string
    vendors: CategoryVendor[]
}

export function PackagePanel({ event, shortlist, packages, onUpdatePackages, onNext }: PackagePanelProps) {
    // Derive categories from confirmed and maybe vendors
    const allVendors = [...shortlist.confirmed, ...shortlist.maybe]

    // Group vendors by category
    const groupedVendors: Record<string, Vendor[]> = {}
    allVendors.forEach((v: Vendor) => {
        const cat = v.category || 'other'
        if (!groupedVendors[cat]) groupedVendors[cat] = []
        groupedVendors[cat].push(v)
    })

    // Create dynamic categories array
    const dynamicCategories: Category[] = Object.keys(groupedVendors).map(catId => {
        const details = getCategoryDetails(catId)
        return {
            id: catId,
            name: details.name,
            icon: details.icon,
            color: details.color,
            vendors: groupedVendors[catId].map((v: Vendor) => ({
                id: v.id,
                name: v.name,
                price: v.basePrice || 0,
                rating: v.rating || 0,
                selected: shortlist.confirmed.some((cv: Vendor) => cv.id === v.id), // Confirmed are selected by default
                perPlate: 0
            }))
        }
    })

    const [categories, setCategories] = useState<Category[]>(dynamicCategories)
    const [plannerNotes, setPlannerNotes] = useState('')

    const guestCount = event.guestCount || 350
    const budget = event.budgetMax || 1500000

    const handleSelectVendor = (categoryId: string, vendorId: string) => {
        setCategories(prev => prev.map(cat => {
            if (cat.id === categoryId) {
                return {
                    ...cat,
                    vendors: cat.vendors.map(v => ({
                        ...v,
                        selected: v.id === vendorId
                    }))
                }
            }
            return cat
        }))
    }

    const getSelectedVendor = (category: Category) => {
        return category.vendors.find(v => v.selected)
    }

    const totalAmount = categories.reduce((sum, cat) => {
        const selected = getSelectedVendor(cat)
        return sum + (selected?.price || 0)
    }, 0)

    const budgetDiff = budget - totalAmount
    const budgetStatus = budgetDiff >= 0 ? 'under' : 'over'

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Build Your Proposal</h2>
                    <p className="text-sm text-gray-500">Select one vendor per category to create a custom proposal</p>
                </div>
                <Button onClick={onNext} className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600">
                    Continue to Review <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
            </div>

            {/* Budget Summary Bar */}
            <Card className="mb-6">
                <CardContent className="py-4">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <span className="text-sm text-gray-500">Proposal Total</span>
                            <p className="text-2xl font-bold">₹{(totalAmount / 100000).toFixed(2)}L</p>
                        </div>
                        <div className="text-right">
                            <span className="text-sm text-gray-500">Client Budget</span>
                            <p className="text-xl font-semibold text-gray-700">₹{(budget / 100000).toFixed(1)}L</p>
                        </div>
                        <div className={`px-4 py-2 rounded-lg ${budgetStatus === 'under' ? 'bg-green-100' : 'bg-red-100'}`}>
                            <p className={`text-sm font-medium ${budgetStatus === 'under' ? 'text-green-700' : 'text-red-700'}`}>
                                {budgetStatus === 'under' ? '✓' : '!'} ₹{Math.abs(budgetDiff / 100000).toFixed(2)}L {budgetStatus === 'under' ? 'under' : 'over'}
                            </p>
                        </div>
                    </div>
                    {/* Progress bar */}
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all ${budgetStatus === 'under' ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(100, (totalAmount / budget) * 100)}%` }}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Category Cards */}
            <div className="space-y-4">
                {categories.map(category => {
                    const Icon = category.icon
                    const colors = getColorClasses(category.color)
                    const selectedVendor = getSelectedVendor(category)

                    return (
                        <Card key={category.id} className="overflow-hidden">
                            <div className="flex">
                                {/* Category Icon */}
                                <div className={`w-16 ${colors.bg} flex items-center justify-center`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-semibold text-gray-900">{category.name}</h3>
                                        {selectedVendor && (
                                            <div className="text-right">
                                                <p className="font-bold text-gray-900">₹{(selectedVendor.price / 100000).toFixed(2)}L</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Vendor Options */}
                                    <div className="flex gap-2 flex-wrap">
                                        {category.vendors.map(vendor => (
                                            <button
                                                key={vendor.id}
                                                onClick={() => handleSelectVendor(category.id, vendor.id)}
                                                className={`px-3 py-2 rounded-lg border-2 transition-all text-left ${vendor.selected
                                                    ? `border-orange-400 ${colors.light}`
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {vendor.selected && (
                                                        <Check className="w-4 h-4 text-orange-500" />
                                                    )}
                                                    <span className={`font-medium text-sm ${vendor.selected ? 'text-orange-700' : 'text-gray-700'}`}>
                                                        {vendor.name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                                    <span className="text-xs text-gray-500">{vendor.rating}</span>
                                                    <span className="text-xs font-medium text-green-600">
                                                        ₹{(vendor.price / 1000).toFixed(0)}K
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )
                })}
            </div>

            {/* Planner Notes */}
            <Card className="mt-6">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        <Edit2 className="w-4 h-4" /> Note for Client
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea
                        placeholder="Add a personal note to accompany this proposal..."
                        value={plannerNotes}
                        onChange={(e) => setPlannerNotes(e.target.value)}
                        rows={3}
                        className="resize-none"
                    />
                </CardContent>
            </Card>
        </div>
    )
}
