'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, X, Clock, Check, GripVertical, Calendar } from 'lucide-react'
import { EventPlan } from '@/lib/types/event-plan'

interface Step6Props {
    data: EventPlan['timeline']
    updateData: (data: Partial<EventPlan['timeline']>) => void
    eventDate: string
    eventTime: string
}

// Default schedule template
const DEFAULT_WEDDING_SCHEDULE = [
    { time: '16:00', activity: 'Vendor Setup Begins', responsible: 'All Vendors' },
    { time: '17:00', activity: 'Decor Final Check', responsible: 'Planner' },
    { time: '17:30', activity: 'Sound & Light Check', responsible: 'DJ/Entertainment' },
    { time: '18:00', activity: 'Guest Arrival', responsible: 'Valet/Ushers' },
    { time: '18:30', activity: 'Welcome Drinks', responsible: 'Caterers' },
    { time: '19:00', activity: 'Bride & Groom Entry', responsible: 'Planner' },
    { time: '19:30', activity: 'Ceremony Begins', responsible: 'Priest/Officiant' },
    { time: '20:30', activity: 'Photo Session', responsible: 'Photography' },
    { time: '21:00', activity: 'Dinner Service', responsible: 'Caterers' },
    { time: '22:00', activity: 'Entertainment/Dance', responsible: 'DJ' },
    { time: '23:30', activity: 'Cake Cutting', responsible: 'Planner' },
    { time: '00:00', activity: 'Event Ends', responsible: 'All' },
]

export function Step6Timeline({ data, updateData, eventDate, eventTime }: Step6Props) {
    const [newTime, setNewTime] = useState('')
    const [newActivity, setNewActivity] = useState('')
    const [newResponsible, setNewResponsible] = useState('')

    const schedule = data.eventDaySchedule || []

    const loadTemplate = () => {
        updateData({ eventDaySchedule: DEFAULT_WEDDING_SCHEDULE })
    }

    const addItem = () => {
        if (newTime && newActivity) {
            const newSchedule = [...schedule, {
                time: newTime,
                activity: newActivity,
                responsible: newResponsible || 'Planner'
            }].sort((a, b) => a.time.localeCompare(b.time))

            updateData({ eventDaySchedule: newSchedule })
            setNewTime('')
            setNewActivity('')
            setNewResponsible('')
        }
    }

    const removeItem = (index: number) => {
        updateData({
            eventDaySchedule: schedule.filter((_, i) => i !== index)
        })
    }

    const updateItem = (index: number, field: string, value: string) => {
        const updated = [...schedule]
        updated[index] = { ...updated[index], [field]: value }
        updateData({ eventDaySchedule: updated })
    }

    return (
        <div className="space-y-6">
            {/* Event Day Info */}
            <Card className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
                <div className="flex items-center gap-4">
                    <Calendar className="w-8 h-8 text-indigo-600" />
                    <div>
                        <div className="font-semibold text-gray-900">
                            {eventDate
                                ? new Date(eventDate).toLocaleDateString('en-IN', {
                                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                                })
                                : 'Date not set'
                            }
                        </div>
                        <div className="text-sm text-gray-500">Starting at {eventTime || '18:00'}</div>
                    </div>
                </div>
            </Card>

            {/* Quick Actions */}
            <div className="flex gap-3">
                <Button
                    variant="outline"
                    onClick={loadTemplate}
                    className="gap-2"
                >
                    📋 Load Wedding Template
                </Button>
                <Button
                    variant="outline"
                    onClick={() => updateData({ eventDaySchedule: [] })}
                    className="gap-2 text-red-600 hover:text-red-700"
                >
                    Clear All
                </Button>
            </div>

            {/* Add New Item */}
            <Card className="p-4">
                <Label className="text-sm font-medium mb-2 block">Add Schedule Item</Label>
                <div className="flex gap-2">
                    <Input
                        type="time"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        className="w-32"
                    />
                    <Input
                        placeholder="Activity..."
                        value={newActivity}
                        onChange={(e) => setNewActivity(e.target.value)}
                        className="flex-1"
                    />
                    <Input
                        placeholder="Responsible"
                        value={newResponsible}
                        onChange={(e) => setNewResponsible(e.target.value)}
                        className="w-40"
                    />
                    <Button onClick={addItem} size="icon">
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>
            </Card>

            {/* Timeline View */}
            <div className="space-y-1">
                <Label className="text-base font-semibold">Event Day Schedule</Label>
                <p className="text-sm text-gray-500 mb-4">
                    {schedule.length} items • Click to edit
                </p>

                {schedule.length === 0 ? (
                    <Card className="p-8 text-center text-gray-500">
                        <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No schedule items yet</p>
                        <p className="text-sm">Add items above or load a template</p>
                    </Card>
                ) : (
                    <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-[72px] top-0 bottom-0 w-0.5 bg-indigo-200" />

                        <div className="space-y-2">
                            {schedule.map((item, index) => (
                                <div key={index} className="flex items-center gap-3 group">
                                    {/* Time pill */}
                                    <div className="w-16 text-right">
                                        <Input
                                            type="time"
                                            value={item.time}
                                            onChange={(e) => updateItem(index, 'time', e.target.value)}
                                            className="h-8 text-xs text-center px-1"
                                        />
                                    </div>

                                    {/* Dot */}
                                    <div className="w-4 h-4 rounded-full bg-indigo-500 border-4 border-indigo-100 z-10 flex-shrink-0" />

                                    {/* Content */}
                                    <Card className="flex-1 p-3 flex items-center gap-2">
                                        <GripVertical className="w-4 h-4 text-gray-300 cursor-grab" />
                                        <Input
                                            value={item.activity}
                                            onChange={(e) => updateItem(index, 'activity', e.target.value)}
                                            className="flex-1 h-8 border-0 bg-transparent focus:bg-white"
                                        />
                                        <Input
                                            value={item.responsible}
                                            onChange={(e) => updateItem(index, 'responsible', e.target.value)}
                                            className="w-32 h-8 text-xs text-gray-500 border-0 bg-transparent focus:bg-white"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeItem(index)}
                                            className="opacity-0 group-hover:opacity-100 text-red-500 h-8 w-8"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Duration Info */}
            {schedule.length >= 2 && (
                <Card className="p-3 bg-green-50 border-green-200">
                    <div className="flex items-center gap-2 text-green-700">
                        <Check className="w-5 h-5" />
                        <span className="font-medium">
                            Event Duration: {
                                (() => {
                                    const first = schedule[0].time
                                    const last = schedule[schedule.length - 1].time
                                    const [h1, m1] = first.split(':').map(Number)
                                    const [h2, m2] = last.split(':').map(Number)
                                    let hours = h2 - h1
                                    if (hours < 0) hours += 24
                                    return `${hours} hours`
                                })()
                            }
                        </span>
                    </div>
                </Card>
            )}
        </div>
    )
}
