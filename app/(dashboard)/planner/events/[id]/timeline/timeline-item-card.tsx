'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MapPin, User, Clock, GripVertical, CheckCircle2, Pencil, Trash2, X, Save, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { updateTimelineItem, deleteTimelineItem } from '@/actions/timeline'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface TimelineItemProps {
    item: {
        id: string
        title: string
        description?: string
        start_time: string
        end_time?: string
        location?: string
        status: string
        event_id?: string
        vendors?: {
            company_name: string
        }
    }
    eventId: string
}

export function TimelineItemCard({ item, eventId }: TimelineItemProps) {
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)

    // Editable fields
    const [title, setTitle] = useState(item.title)
    const [description, setDescription] = useState(item.description || '')
    const [startTime, setStartTime] = useState(item.start_time?.substring(0, 5) || '')
    const [endTime, setEndTime] = useState(item.end_time?.substring(0, 5) || '')
    const [location, setLocation] = useState(item.location || '')
    const [status, setStatus] = useState(item.status)

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: item.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    const formatTime = (time: string) => {
        if (!time) return ''
        const [h, m] = time.split(':')
        const hours = parseInt(h)
        const date = new Date()
        date.setHours(hours)
        date.setMinutes(parseInt(m))
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const handleSave = async () => {
        setSaving(true)
        const formData = new FormData()
        formData.set('id', item.id)
        formData.set('eventId', eventId)
        formData.set('title', title)
        formData.set('description', description)
        formData.set('startTime', startTime)
        formData.set('endTime', endTime)
        formData.set('location', location)
        formData.set('status', status)

        const result = await updateTimelineItem(formData)
        if (result.success) {
            toast.success('Timeline item updated')
            setIsEditing(false)
            router.refresh()
        } else {
            toast.error(result.error || 'Failed to update')
        }
        setSaving(false)
    }

    const handleDelete = async () => {
        if (!confirm('Delete this timeline item?')) return
        setDeleting(true)
        const result = await deleteTimelineItem(item.id, eventId)
        if (result.success) {
            toast.success('Item deleted')
            router.refresh()
        } else {
            toast.error(result.error || 'Failed to delete')
        }
        setDeleting(false)
    }

    const handleCancel = () => {
        setTitle(item.title)
        setDescription(item.description || '')
        setStartTime(item.start_time?.substring(0, 5) || '')
        setEndTime(item.end_time?.substring(0, 5) || '')
        setLocation(item.location || '')
        setStatus(item.status)
        setIsEditing(false)
    }

    // Editing Mode
    if (isEditing) {
        return (
            <div ref={setNodeRef} style={style} className="mb-3">
                <Card className="border-2 border-indigo-300 shadow-md">
                    <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-center">
                            <h4 className="text-sm font-medium text-indigo-600">Editing Timeline Item</h4>
                            <div className="flex gap-2">
                                <Button size="sm" variant="ghost" onClick={handleCancel} disabled={saving}>
                                    <X className="w-4 h-4 mr-1" /> Cancel
                                </Button>
                                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={handleSave} disabled={saving}>
                                    {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                                    Save
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Title</label>
                                <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-9" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Description</label>
                                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description..." className="h-9" />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 mb-1 block">Start Time</label>
                                    <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="h-9" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 mb-1 block">End Time</label>
                                    <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="h-9" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 mb-1 block">Status</label>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                        <option value="delayed">Delayed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Location</label>
                                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location..." className="h-9" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Display Mode
    return (
        <div ref={setNodeRef} style={style} className={cn("mb-3", isDragging && "opacity-50 z-50")}>
            <Card className="hover:shadow-md transition-shadow cursor-default group">
                <CardContent className="p-4 flex gap-4 items-start">
                    {/* Drag Handle */}
                    <div
                        {...attributes}
                        {...listeners}
                        className="mt-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                    >
                        <GripVertical className="w-5 h-5" />
                    </div>

                    {/* Time Column */}
                    <div className="min-w-[80px] text-sm font-medium text-gray-600 flex flex-col items-center border-r pr-4">
                        <span className="text-indigo-600 font-bold">{formatTime(item.start_time)}</span>
                        {item.end_time && (
                            <span className="text-gray-400 text-xs mt-1">{formatTime(item.end_time)}</span>
                        )}
                        <div className="h-full w-px bg-gray-100 flex-1 my-2" />
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-gray-900 leading-none">{item.title}</h4>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className={cn(
                                    "text-xs capitalize",
                                    item.status === 'completed' ? "bg-green-50 text-green-700 border-green-200" :
                                        item.status === 'in_progress' ? "bg-blue-50 text-blue-700 border-blue-200" :
                                            item.status === 'delayed' ? "bg-amber-50 text-amber-700 border-amber-200" :
                                                "bg-gray-50 text-gray-500 border-gray-200"
                                )}>
                                    {item.status.replace('_', ' ')}
                                </Badge>
                                {/* Edit & Delete buttons - visible on hover */}
                                <div className="hidden group-hover:flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-gray-400 hover:text-indigo-600"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-gray-400 hover:text-red-600"
                                        onClick={handleDelete}
                                        disabled={deleting}
                                    >
                                        {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {item.description && (
                            <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                        )}

                        <div className="flex gap-4 pt-2 mt-1">
                            {item.location && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <MapPin className="w-3 h-3" />
                                    <span>{item.location}</span>
                                </div>
                            )}
                            {item.vendors && (
                                <div className="flex items-center gap-1 text-xs text-indigo-600 font-medium">
                                    <User className="w-3 h-3" />
                                    <span>{item.vendors.company_name}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
