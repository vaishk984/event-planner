'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Building2, UtensilsCrossed, Camera, Sparkles, Music, Brush, Car,
    Plus, Trash2, Save, ChevronDown, ChevronUp, Users, Clock,
    Flower2, Armchair, Gift, Shield, Hotel, FileText, Heart,
    Wine, Loader2, Search, ChevronRight, ChevronsUpDown, Info,
    CheckCircle2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getSpecsForEventType, type CategorySpec, type SpecItem } from '@/lib/templates/event-specs-templates'
import { getEventSpecs, saveEventSpecs, type CategorySpecData } from '@/actions/event-specs'
import type { Event } from '@/types/domain'
import { toast } from 'sonner'
import { getEvent } from '@/lib/actions/event-actions'

const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; light: string; border: string }> = {
        blue: { bg: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-50', border: 'border-blue-200' },
        amber: { bg: 'bg-amber-500', text: 'text-amber-600', light: 'bg-amber-50', border: 'border-amber-200' },
        pink: { bg: 'bg-pink-500', text: 'text-pink-600', light: 'bg-pink-50', border: 'border-pink-200' },
        purple: { bg: 'bg-purple-500', text: 'text-purple-600', light: 'bg-purple-50', border: 'border-purple-200' },
        indigo: { bg: 'bg-indigo-500', text: 'text-indigo-600', light: 'bg-indigo-50', border: 'border-indigo-200' },
        rose: { bg: 'bg-rose-500', text: 'text-rose-600', light: 'bg-rose-50', border: 'border-rose-200' },
        red: { bg: 'bg-red-500', text: 'text-red-600', light: 'bg-red-50', border: 'border-red-200' },
        emerald: { bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50', border: 'border-emerald-200' },
        cyan: { bg: 'bg-cyan-500', text: 'text-cyan-600', light: 'bg-cyan-50', border: 'border-cyan-200' },
        orange: { bg: 'bg-orange-500', text: 'text-orange-600', light: 'bg-orange-50', border: 'border-orange-200' },
        yellow: { bg: 'bg-yellow-500', text: 'text-yellow-600', light: 'bg-yellow-50', border: 'border-yellow-200' },
        gray: { bg: 'bg-gray-500', text: 'text-gray-600', light: 'bg-gray-50', border: 'border-gray-200' },
        slate: { bg: 'bg-slate-500', text: 'text-slate-600', light: 'bg-slate-50', border: 'border-slate-200' },
        fuchsia: { bg: 'bg-fuchsia-500', text: 'text-fuchsia-600', light: 'bg-fuchsia-50', border: 'border-fuchsia-200' },
    }
    return colors[color] || colors.blue
}

// Map category id to icon
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    venue: Building2, catering: UtensilsCrossed, bar: Wine, decor: Sparkles,
    mandap: Heart, photography: Camera, entertainment: Music, transport: Car,
    staff: Shield, accommodation: Hotel, mehendi: Brush, gifts: Gift,
    branding: FileText, furniture: Armchair, av: Music, stationery: FileText,
}

export default function SpecificationsPage() {
    const params = useParams()
    const eventId = params.id as string

    const [event, setEvent] = useState<Event | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const [savedFromDb, setSavedFromDb] = useState(false)
    const [specs, setSpecs] = useState<CategorySpec[]>([])
    const [expandedCategories, setExpandedCategories] = useState<string[]>(['venue', 'catering'])
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        const loadEvent = async () => {
            const supabase = createClient()
            const eventData = await getEvent(eventId)

            setEvent(eventData)

            if (!eventData) {
                setSpecs([])
                setLoading(false)
                return
            }

            // Try loading saved specs from DB
            const savedResult = await getEventSpecs(eventId)

            if (savedResult.data && savedResult.data.length > 0) {
                // Convert DB data back to CategorySpec format
                const savedSpecs: CategorySpec[] = savedResult.data.map(cat => ({
                    id: cat.category_id,
                    name: cat.category_name,
                    icon: ICON_MAP[cat.category_id] || Sparkles,
                    color: cat.category_color,
                    vendor: cat.vendor_name,
                    items: cat.items,
                }))
                setSpecs(savedSpecs)
                setSavedFromDb(true)
            } else {
                // Fall back to template
                let template: CategorySpec[]
                if (eventData.type) {
                    template = getSpecsForEventType(eventData.type)
                } else {
                    template = getSpecsForEventType('wedding')
                }

                // Overlay vendor names from assignments
                try {
                    const { data: assignments } = await supabase
                        .from('vendor_assignments')
                        .select('vendor_category, vendor_id, vendors:vendor_id(company_name)')
                        .eq('event_id', eventId)

                    if (assignments && assignments.length > 0) {
                        const vendorNameMap: Record<string, string> = {}
                        for (const a of assignments) {
                            const vendors = a.vendors as { company_name?: string } | null
                            const vendorName = vendors?.company_name
                            if (vendorName && a.vendor_category) {
                                vendorNameMap[a.vendor_category] = vendorName
                            }
                        }
                        template = template.map(cat => ({
                            ...cat,
                            vendor: vendorNameMap[cat.id] || cat.vendor,
                        }))
                    }
                } catch (e) {
                    console.error('Failed to fetch vendor names for specs:', e)
                }

                setSpecs(template)
                setSavedFromDb(false)
            }

            setLoading(false)
        }
        loadEvent()
    }, [eventId])

    // Mark unsaved changes on any spec modification
    const updateSpecs = (updater: (prev: CategorySpec[]) => CategorySpec[]) => {
        setSpecs(prev => {
            const next = updater(prev)
            setHasUnsavedChanges(true)
            return next
        })
    }

    const handleSave = async () => {
        setSaving(true)
        const categories: CategorySpecData[] = specs.map(cat => ({
            category_id: cat.id,
            category_name: cat.name,
            category_color: cat.color,
            vendor_name: cat.vendor,
            items: cat.items.map(item => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                unit: item.unit,
                unitPrice: item.unitPrice,
                notes: item.notes,
            })),
        }))

        const result = await saveEventSpecs(eventId, categories)
        if (result.success) {
            toast.success('Specifications saved successfully!')
            setHasUnsavedChanges(false)
            setSavedFromDb(true)
        } else {
            toast.error(`Failed to save: ${result.error}`)
        }
        setSaving(false)
    }

    const toggleCategory = (categoryId: string) => {
        setExpandedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        )
    }

    const expandAll = () => setExpandedCategories(specs.map(s => s.id))
    const collapseAll = () => setExpandedCategories([])

    const updateItemQuantity = (categoryId: string, itemId: string, quantity: number) => {
        updateSpecs(prev => prev.map(cat => {
            if (cat.id === categoryId) {
                return {
                    ...cat,
                    items: cat.items.map(item =>
                        item.id === itemId ? { ...item, quantity } : item
                    )
                }
            }
            return cat
        }))
    }

    const updateItemNotes = (categoryId: string, itemId: string, notes: string) => {
        updateSpecs(prev => prev.map(cat => {
            if (cat.id === categoryId) {
                return {
                    ...cat,
                    items: cat.items.map(item =>
                        item.id === itemId ? { ...item, notes } : item
                    )
                }
            }
            return cat
        }))
    }

    const addItem = (categoryId: string) => {
        const newItem: SpecItem = {
            id: `new_${Date.now()}`,
            name: 'New Item',
            quantity: 1,
            unit: 'units',
            unitPrice: 0,
        }
        updateSpecs(prev => prev.map(cat => {
            if (cat.id === categoryId) {
                return { ...cat, items: [...cat.items, newItem] }
            }
            return cat
        }))
    }

    const removeItem = (categoryId: string, itemId: string) => {
        updateSpecs(prev => prev.map(cat => {
            if (cat.id === categoryId) {
                return { ...cat, items: cat.items.filter(item => item.id !== itemId) }
            }
            return cat
        }))
    }

    const calculateCategoryTotal = (items: SpecItem[]) => {
        return items.reduce((sum, item) => sum + (item.quantity * (item.unitPrice || 0)), 0)
    }

    const totalBudget = specs.reduce((sum, cat) => sum + calculateCategoryTotal(cat.items), 0)
    const totalItems = specs.reduce((sum, cat) => sum + cat.items.length, 0)

    const filteredSpecs = searchQuery
        ? specs.filter(cat =>
            cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cat.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        : specs

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header with Summary */}
            <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-xl font-bold text-gray-900">Event Specifications</h2>
                        <Badge variant="outline" className="capitalize">
                            {event?.type || 'Wedding'} Template
                        </Badge>
                        {savedFromDb && (
                            <Badge className="bg-green-100 text-green-700 border-green-300">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Saved
                            </Badge>
                        )}
                        {hasUnsavedChanges && (
                            <Badge className="bg-amber-100 text-amber-700 border-amber-300">
                                Unsaved Changes
                            </Badge>
                        )}
                    </div>
                    <p className="text-sm text-gray-500">
                        Detailed line items across {specs.length} categories for your {event?.type || 'wedding'} event
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center gap-4">
                    <div className="text-center px-4">
                        <p className="text-2xl font-bold text-gray-900">{specs.length}</p>
                        <p className="text-xs text-gray-500">Categories</p>
                    </div>
                    <div className="text-center px-4 border-l">
                        <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
                        <p className="text-xs text-gray-500">Line Items</p>
                    </div>
                    <div className="text-center px-4 border-l">
                        <p className="text-2xl font-bold text-green-600">₹{(totalBudget / 100000).toFixed(2)}L</p>
                        <p className="text-xs text-gray-500">Total Est.</p>
                    </div>
                    <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                        ) : (
                            <><Save className="w-4 h-4 mr-2" /> Save</>
                        )}
                    </Button>
                </div>
            </div>

            {/* Search and Controls */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search categories or items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button variant="outline" size="sm" onClick={expandAll}>
                    <ChevronsUpDown className="w-4 h-4 mr-2" /> Expand All
                </Button>
                <Button variant="outline" size="sm" onClick={collapseAll}>
                    Collapse All
                </Button>
            </div>

            {/* Category Summary Bar */}
            <div className="bg-white rounded-xl border p-4 overflow-x-auto">
                <div className="flex gap-2 min-w-max">
                    {specs.map(cat => {
                        const colors = getColorClasses(cat.color)
                        const total = calculateCategoryTotal(cat.items)
                        return (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    if (!expandedCategories.includes(cat.id)) {
                                        setExpandedCategories([...expandedCategories, cat.id])
                                    }
                                    document.getElementById(`cat-${cat.id}`)?.scrollIntoView({ behavior: 'smooth' })
                                }}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm hover:shadow transition-all ${colors.light} ${colors.border}`}
                            >
                                <span className="font-medium">{cat.name}</span>
                                <Badge variant="secondary" className="text-xs">₹{(total / 1000).toFixed(0)}K</Badge>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Category Cards */}
            <div className="space-y-4">
                {filteredSpecs.map(category => {
                    const Icon = ICON_MAP[category.id] || category.icon || Sparkles
                    const colors = getColorClasses(category.color)
                    const isExpanded = expandedCategories.includes(category.id)
                    const categoryTotal = calculateCategoryTotal(category.items)

                    return (
                        <Card key={category.id} id={`cat-${category.id}`} className={`overflow-hidden ${colors.border}`}>
                            {/* Header */}
                            <div
                                className={`flex items-center justify-between p-4 cursor-pointer ${colors.light}`}
                                onClick={() => toggleCategory(category.id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
                                        <Icon className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{category.name}</h3>
                                        <p className="text-sm text-gray-500">{category.vendor} • {category.items.length} items</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <p className="font-bold text-lg">₹{(categoryTotal / 100000).toFixed(2)}L</p>
                                    {isExpanded ? (
                                        <ChevronUp className="w-5 h-5 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-gray-400" />
                                    )}
                                </div>
                            </div>

                            {/* Expanded Content */}
                            {isExpanded && (
                                <CardContent className="p-4 pt-0">
                                    <div className="border rounded-lg overflow-hidden mt-4">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="text-left p-3 font-medium text-gray-600">Item</th>
                                                    <th className="text-center p-3 font-medium text-gray-600 w-24">Qty</th>
                                                    <th className="text-left p-3 font-medium text-gray-600 w-24">Unit</th>
                                                    <th className="text-right p-3 font-medium text-gray-600 w-28">Unit Price</th>
                                                    <th className="text-right p-3 font-medium text-gray-600 w-28">Total</th>
                                                    <th className="text-left p-3 font-medium text-gray-600">Notes</th>
                                                    <th className="w-10"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {category.items.map((item, idx) => (
                                                    <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                                        <td className="p-3">
                                                            <Input
                                                                value={item.name}
                                                                className="h-8 text-sm"
                                                                onChange={(e) => {
                                                                    updateSpecs(prev => prev.map(cat => {
                                                                        if (cat.id === category.id) {
                                                                            return {
                                                                                ...cat,
                                                                                items: cat.items.map(i =>
                                                                                    i.id === item.id ? { ...i, name: e.target.value } : i
                                                                                )
                                                                            }
                                                                        }
                                                                        return cat
                                                                    }))
                                                                }}
                                                            />
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            <Input
                                                                type="number"
                                                                value={item.quantity}
                                                                onChange={(e) => updateItemQuantity(category.id, item.id, Number(e.target.value))}
                                                                className="h-8 text-sm text-center w-20"
                                                                min={0}
                                                            />
                                                        </td>
                                                        <td className="p-3 text-gray-500">{item.unit}</td>
                                                        <td className="p-3 text-right">
                                                            <Input
                                                                type="number"
                                                                value={item.unitPrice || 0}
                                                                onChange={(e) => {
                                                                    updateSpecs(prev => prev.map(cat => {
                                                                        if (cat.id === category.id) {
                                                                            return {
                                                                                ...cat,
                                                                                items: cat.items.map(i =>
                                                                                    i.id === item.id ? { ...i, unitPrice: Number(e.target.value) } : i
                                                                                )
                                                                            }
                                                                        }
                                                                        return cat
                                                                    }))
                                                                }}
                                                                className="h-8 text-sm text-right w-24"
                                                                min={0}
                                                            />
                                                        </td>
                                                        <td className="p-3 text-right font-medium">
                                                            {item.unitPrice !== undefined
                                                                ? `₹${(item.quantity * item.unitPrice).toLocaleString()}`
                                                                : '-'
                                                            }
                                                        </td>
                                                        <td className="p-3">
                                                            <Input
                                                                value={item.notes || ''}
                                                                placeholder="Add notes..."
                                                                onChange={(e) => updateItemNotes(category.id, item.id, e.target.value)}
                                                                className="h-8 text-sm"
                                                            />
                                                        </td>
                                                        <td className="p-3">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                onClick={() => removeItem(category.id, item.id)}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Add Item Button */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-3"
                                        onClick={() => addItem(category.id)}
                                    >
                                        <Plus className="w-4 h-4 mr-2" /> Add Item
                                    </Button>
                                </CardContent>
                            )}
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
