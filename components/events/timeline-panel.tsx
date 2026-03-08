'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Plus, Clock, User, MapPin, Check, Play, AlertTriangle,
    Trash2, Edit, ChevronDown, ChevronUp, Wand2, X
} from 'lucide-react'
import { toast } from 'sonner'
import type { EventFunction, TimelineItem, FunctionType } from '@/types/domain'
import {
    getTimelineForFunction,
    createTimelineItem,
    updateTimelineStatus,
    deleteTimelineItem,
    applyTemplateToFunction,
    getTimelineStats,
    TIMELINE_TEMPLATES
} from '@/lib/stores/timeline-store'

interface TimelinePanelProps {
    eventFunction: EventFunction
}

const STATUS_CONFIG = {
    pending: { icon: Clock, color: 'text-gray-400', bg: 'bg-gray-100', label: 'Pending' },
    in_progress: { icon: Play, color: 'text-blue-600', bg: 'bg-blue-100', label: 'In Progress' },
    completed: { icon: Check, color: 'text-green-600', bg: 'bg-green-100', label: 'Done' },
    delayed: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Delayed' },
    cancelled: { icon: X, color: 'text-red-600', bg: 'bg-red-100', label: 'Cancelled' },
}

export function TimelinePanel({ eventFunction }: TimelinePanelProps) {
    const [items, setItems] = useState<TimelineItem[]>([])
    const [showAddForm, setShowAddForm] = useState(false)
    const [formData, setFormData] = useState({
        startTime: '',
        endTime: '',
        title: '',
        owner: '',
        location: '',
    })

    // Load timeline items
    useEffect(() => {
        setItems(getTimelineForFunction(eventFunction.id))
    }, [eventFunction.id])

    const stats = getTimelineStats(eventFunction.id)

    const handleApplyTemplate = () => {
        const newItems = applyTemplateToFunction(
            eventFunction.id,
            eventFunction.eventId,
            eventFunction.type
        )
        setItems([...items, ...newItems])
        toast.success(`Applied ${eventFunction.type} template with ${newItems.length} items`)
    }

    const handleAddItem = () => {
        if (!formData.title || !formData.startTime) {
            toast.error('Please enter title and start time')
            return
        }

        const newItem = createTimelineItem({
            functionId: eventFunction.id,
            eventId: eventFunction.eventId,
            startTime: formData.startTime,
            endTime: formData.endTime,
            title: formData.title,
            owner: formData.owner,
            location: formData.location,
            status: 'pending',
            order: items.length + 1,
        })

        setItems([...items, newItem])
        setShowAddForm(false)
        setFormData({ startTime: '', endTime: '', title: '', owner: '', location: '' })
        toast.success('Activity added')
    }

    const handleStatusChange = (id: string, status: 'pending' | 'in_progress' | 'completed' | 'delayed') => {
        updateTimelineStatus(id, status)
        setItems(items.map(item =>
            item.id === id ? { ...item, status } : item
        ))
    }

    const handleDelete = (id: string) => {
        deleteTimelineItem(id)
        setItems(items.filter(item => item.id !== id))
        toast.success('Activity removed')
    }

    return (
        <div className="space-y-4">
            {/* Header with Stats */}
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="font-medium text-gray-900">Run Sheet</h4>
                    <p className="text-sm text-gray-500">
                        {stats.total} activities • {stats.completed} done • {stats.delayed} delayed
                    </p>
                </div>
                <div className="flex gap-2">
                    {items.length === 0 && TIMELINE_TEMPLATES[eventFunction.type]?.length > 0 && (
                        <Button variant="outline" size="sm" onClick={handleApplyTemplate}>
                            <Wand2 className="w-4 h-4 mr-2" /> Use Template
                        </Button>
                    )}
                    <Button size="sm" onClick={() => setShowAddForm(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Add Activity
                    </Button>
                </div>
            </div>

            {/* Progress Bar */}
            {stats.total > 0 && (
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-green-500 transition-all"
                        style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                    />
                </div>
            )}

            {/* Add Form */}
            {showAddForm && (
                <Card className="border-orange-200 bg-orange-50/50">
                    <CardContent className="pt-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="text-xs">Start Time</Label>
                                <Input
                                    type="time"
                                    value={formData.startTime}
                                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label className="text-xs">End Time (optional)</Label>
                                <Input
                                    type="time"
                                    value={formData.endTime}
                                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <Label className="text-xs">Activity</Label>
                            <Input
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g., Decor setup begins"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="text-xs">Owner</Label>
                                <Input
                                    value={formData.owner}
                                    onChange={e => setFormData({ ...formData, owner: e.target.value })}
                                    placeholder="e.g., Decorator"
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Location (optional)</Label>
                                <Input
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="e.g., Main Hall"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                                Cancel
                            </Button>
                            <Button size="sm" onClick={handleAddItem}>
                                Add
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Timeline Items */}
            <div className="space-y-2">
                {items.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No activities yet</p>
                        <p className="text-sm">Add activities or use a template</p>
                    </div>
                ) : (
                    items.map((item, index) => {
                        const statusConfig = STATUS_CONFIG[item.status]
                        const StatusIcon = statusConfig.icon

                        return (
                            <div
                                key={item.id}
                                className={`flex items-center gap-3 p-3 rounded-lg border ${statusConfig.bg} border-opacity-50`}
                            >
                                {/* Time */}
                                <div className="w-20 text-center">
                                    <p className="font-mono font-bold text-gray-900">{item.startTime}</p>
                                    {item.endTime && (
                                        <p className="text-xs text-gray-500">to {item.endTime}</p>
                                    )}
                                </div>

                                {/* Status Icon */}
                                <button
                                    onClick={() => {
                                        const nextStatus = {
                                            pending: 'in_progress',
                                            in_progress: 'completed',
                                            completed: 'pending',
                                            delayed: 'in_progress',
                                            cancelled: 'pending',
                                        } as const
                                        handleStatusChange(item.id, nextStatus[item.status])
                                    }}
                                    className={`w-8 h-8 rounded-full ${statusConfig.bg} flex items-center justify-center hover:scale-110 transition-transform`}
                                >
                                    <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                                </button>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <p className={`font-medium ${item.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                                        {item.title}
                                    </p>
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        {item.owner && (
                                            <span className="flex items-center gap-1">
                                                <User className="w-3 h-3" /> {item.owner}
                                            </span>
                                        )}
                                        {item.location && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" /> {item.location}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <Badge className={`${statusConfig.bg} ${statusConfig.color} text-xs`}>
                                    {statusConfig.label}
                                </Badge>

                                {/* Actions */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleDelete(item.id)}
                                >
                                    <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                                </Button>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
