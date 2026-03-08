'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Plus, Calendar, MapPin, Users, IndianRupee, Clock,
    Trash2, Edit, Check, X, Sparkles, Music, Heart, PartyPopper,
    GlassWater, Sun, UtensilsCrossed, ChevronDown, ChevronUp, ListChecks, User
} from 'lucide-react'
import { toast } from 'sonner'
import type { Event, EventFunction, FunctionType } from '@/types/domain'
import {
    getFunctionsForEvent,
    createFunction,
    updateFunction,
    deleteFunction,
    FUNCTION_TEMPLATES
} from '@/lib/stores/event-functions'
import { TimelinePanel } from './timeline-panel'
import { VendorAssignmentPanel } from './vendor-assignment-panel'

interface FunctionsPanelProps {
    event: Event
}

const FUNCTION_ICONS: Record<FunctionType, React.ReactNode> = {
    mehendi: <Sparkles className="w-5 h-5 text-green-600" />,
    haldi: <Sun className="w-5 h-5 text-yellow-500" />,
    sangeet: <Music className="w-5 h-5 text-purple-600" />,
    wedding: <Heart className="w-5 h-5 text-red-500" />,
    reception: <PartyPopper className="w-5 h-5 text-pink-500" />,
    cocktail: <GlassWater className="w-5 h-5 text-blue-500" />,
    after_party: <Music className="w-5 h-5 text-indigo-500" />,
    brunch: <UtensilsCrossed className="w-5 h-5 text-orange-500" />,
    custom: <Calendar className="w-5 h-5 text-gray-500" />,
}

const FUNCTION_COLORS: Record<FunctionType, string> = {
    mehendi: 'bg-green-50 border-green-200',
    haldi: 'bg-yellow-50 border-yellow-200',
    sangeet: 'bg-purple-50 border-purple-200',
    wedding: 'bg-red-50 border-red-200',
    reception: 'bg-pink-50 border-pink-200',
    cocktail: 'bg-blue-50 border-blue-200',
    after_party: 'bg-indigo-50 border-indigo-200',
    brunch: 'bg-orange-50 border-orange-200',
    custom: 'bg-gray-50 border-gray-200',
}

export function FunctionsPanel({ event }: FunctionsPanelProps) {
    const [functions, setFunctions] = useState<EventFunction[]>([])
    const [showAddForm, setShowAddForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [expandedView, setExpandedView] = useState<Record<string, 'timeline' | 'vendors' | null>>({})

    const toggleView = (id: string, view: 'timeline' | 'vendors') => {
        setExpandedView(prev => ({
            ...prev,
            [id]: prev[id] === view ? null : view
        }))
    }

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        type: 'wedding' as FunctionType,
        day: 1,
        date: event.date || '',
        startTime: '',
        endTime: '',
        venueName: '',
        guestCount: 0,
        budget: 0,
        notes: '',
    })

    // Load functions
    useEffect(() => {
        setFunctions(getFunctionsForEvent(event.id))
    }, [event.id])

    const handleQuickAdd = (type: FunctionType) => {
        const template = FUNCTION_TEMPLATES[type]
        const day = functions.length + 1

        const newFunction = createFunction({
            eventId: event.id,
            name: template.name,
            type,
            day,
            date: event.date || '',
            guestCount: template.defaultGuests,
            budget: 0,
            status: 'planning',
        })

        setFunctions([...functions, newFunction])
        toast.success(`Added ${template.name}`)
    }

    const handleAddFunction = () => {
        if (!formData.name) {
            toast.error('Please enter a function name')
            return
        }

        const newFunction = createFunction({
            eventId: event.id,
            name: formData.name,
            type: formData.type,
            day: formData.day,
            date: formData.date,
            startTime: formData.startTime,
            endTime: formData.endTime,
            venueName: formData.venueName,
            guestCount: formData.guestCount,
            budget: formData.budget,
            notes: formData.notes,
            status: 'planning',
        })

        setFunctions([...functions, newFunction])
        setShowAddForm(false)
        resetForm()
        toast.success('Function added successfully')
    }

    const handleDelete = (id: string) => {
        deleteFunction(id)
        setFunctions(functions.filter(f => f.id !== id))
        toast.success('Function deleted')
    }

    const resetForm = () => {
        setFormData({
            name: '',
            type: 'wedding',
            day: functions.length + 1,
            date: event.date || '',
            startTime: '',
            endTime: '',
            venueName: '',
            guestCount: 0,
            budget: 0,
            notes: '',
        })
    }

    const totalBudget = functions.reduce((sum, f) => sum + f.budget, 0)
    const maxGuests = functions.length > 0 ? Math.max(...functions.map(f => f.guestCount)) : 0

    return (
        <div className="space-y-6">
            {/* Header with Stats */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Wedding Functions</h3>
                    <p className="text-sm text-gray-500">
                        {functions.length} functions • Max {maxGuests} guests • ₹{(totalBudget / 100000).toFixed(1)}L total budget
                    </p>
                </div>
                <Button onClick={() => setShowAddForm(true)} className="bg-orange-500 hover:bg-orange-600">
                    <Plus className="w-4 h-4 mr-2" /> Add Function
                </Button>
            </div>

            {/* Quick Add Templates */}
            {functions.length === 0 && (
                <Card className="border-dashed border-2">
                    <CardContent className="py-6">
                        <p className="text-center text-gray-500 mb-4">Quick add common wedding functions:</p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {(['mehendi', 'haldi', 'sangeet', 'wedding', 'reception'] as FunctionType[]).map(type => (
                                <Button
                                    key={type}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleQuickAdd(type)}
                                    className="gap-2"
                                >
                                    {FUNCTION_ICONS[type]}
                                    {FUNCTION_TEMPLATES[type].name.split(' ')[0]}
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Functions List */}
            <div className="space-y-4">
                {functions.map(func => (
                    <Card key={func.id} className={`${FUNCTION_COLORS[func.type]} border`}>
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                                        {FUNCTION_ICONS[func.type]}
                                    </div>
                                    <div>
                                        <CardTitle className="text-base">{func.name}</CardTitle>
                                        <Badge variant="outline" className="mt-1">Day {func.day}</Badge>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <Edit className="w-4 h-4 text-gray-400" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleDelete(func.id)}
                                    >
                                        <Trash2 className="w-4 h-4 text-red-400" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-4">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Calendar className="w-4 h-4" />
                                    {func.date || 'TBD'}
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Clock className="w-4 h-4" />
                                    {func.startTime || 'TBD'} - {func.endTime || 'TBD'}
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Users className="w-4 h-4" />
                                    {func.guestCount} guests
                                </div>
                                <div className="flex items-center gap-2 text-green-600 font-medium">
                                    <IndianRupee className="w-4 h-4" />
                                    ₹{(func.budget / 1000).toFixed(0)}K
                                </div>
                                {func.venueName && (
                                    <div className="flex items-center gap-2 text-gray-600 col-span-2">
                                        <MapPin className="w-4 h-4" />
                                        {func.venueName}
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <Button
                                    variant={expandedView[func.id] === 'timeline' ? 'default' : 'outline'}
                                    size="sm"
                                    className={expandedView[func.id] === 'timeline' ? 'bg-orange-500 hover:bg-orange-600' : ''}
                                    onClick={() => toggleView(func.id, 'timeline')}
                                >
                                    <ListChecks className="w-4 h-4 mr-2" />
                                    Run Sheet
                                </Button>
                                <Button
                                    variant={expandedView[func.id] === 'vendors' ? 'default' : 'outline'}
                                    size="sm"
                                    className={expandedView[func.id] === 'vendors' ? 'bg-blue-500 hover:bg-blue-600' : ''}
                                    onClick={() => toggleView(func.id, 'vendors')}
                                >
                                    <User className="w-4 h-4 mr-2" />
                                    Vendors
                                </Button>
                            </div>

                            {/* Expanded Timeline */}
                            {expandedView[func.id] === 'timeline' && (
                                <div className="pt-4 border-t">
                                    <TimelinePanel eventFunction={func} />
                                </div>
                            )}

                            {/* Expanded Vendors */}
                            {expandedView[func.id] === 'vendors' && (
                                <div className="pt-4 border-t">
                                    <VendorAssignmentPanel eventFunction={func} event={event} />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Add Function Form */}
            {showAddForm && (
                <Card className="border-orange-200 bg-orange-50/50">
                    <CardHeader>
                        <CardTitle className="text-base">Add New Function</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label>Function Name</Label>
                                <Input
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Mehendi Ceremony"
                                />
                            </div>
                            <div>
                                <Label>Function Type</Label>
                                <select
                                    className="w-full h-10 px-3 border rounded-md"
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value as FunctionType })}
                                >
                                    {Object.entries(FUNCTION_TEMPLATES).map(([type, template]) => (
                                        <option key={type} value={type}>{template.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label>Day</Label>
                                <Input
                                    type="number"
                                    value={formData.day}
                                    onChange={e => setFormData({ ...formData, day: parseInt(e.target.value) })}
                                    min={1}
                                />
                            </div>
                            <div>
                                <Label>Date</Label>
                                <Input
                                    type="date"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Guest Count</Label>
                                <Input
                                    type="number"
                                    value={formData.guestCount}
                                    onChange={e => setFormData({ ...formData, guestCount: parseInt(e.target.value) })}
                                />
                            </div>
                            <div>
                                <Label>Budget (₹)</Label>
                                <Input
                                    type="number"
                                    value={formData.budget}
                                    onChange={e => setFormData({ ...formData, budget: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Label>Venue Name</Label>
                                <Input
                                    value={formData.venueName}
                                    onChange={e => setFormData({ ...formData, venueName: e.target.value })}
                                    placeholder="e.g., Royal Heritage Palace"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => { setShowAddForm(false); resetForm(); }}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddFunction} className="bg-orange-500 hover:bg-orange-600">
                                <Plus className="w-4 h-4 mr-2" /> Add Function
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
