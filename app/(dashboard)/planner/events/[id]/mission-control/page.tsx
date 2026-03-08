'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Clock, CheckCircle2, AlertTriangle, Phone,
    Camera, MapPin, Users, ArrowLeft, RefreshCw
} from 'lucide-react'
import Link from 'next/link'

// Mock event data
const MOCK_EVENT = {
    id: 'e1',
    name: 'Mehta Sangeet Night',
    date: '2025-01-15',
    venue: 'Grand Hyatt Ballroom',
    startTime: '18:00',
    endTime: '23:00',
}

// Mock timeline tasks
const MOCK_TIMELINE = [
    { id: 't1', time: '14:00', task: 'Venue Setup Begins', status: 'completed', vendor: 'Venue Team' },
    { id: 't2', time: '15:30', task: 'Decor Installation', status: 'completed', vendor: 'Bloom Florals' },
    { id: 't3', time: '16:00', task: 'Sound Check', status: 'in_progress', vendor: 'DJ Aman' },
    { id: 't4', time: '17:00', task: 'Catering Setup', status: 'pending', vendor: 'Royal Caterers' },
    { id: 't5', time: '17:30', task: 'Photography Team Arrives', status: 'pending', vendor: 'Click Studios' },
    { id: 't6', time: '18:00', task: 'Guest Arrival Begins', status: 'pending', vendor: 'Planner' },
    { id: 't7', time: '19:00', task: 'Sangeet Performances', status: 'pending', vendor: 'Choreographer' },
    { id: 't8', time: '21:00', task: 'Dinner Service', status: 'pending', vendor: 'Royal Caterers' },
    { id: 't9', time: '22:30', task: 'Event Wrap Up', status: 'pending', vendor: 'All Teams' },
]

type TaskStatus = 'completed' | 'in_progress' | 'pending' | 'delayed'

function getStatusColor(status: TaskStatus) {
    switch (status) {
        case 'completed': return 'bg-green-500'
        case 'in_progress': return 'bg-blue-500 animate-pulse'
        case 'delayed': return 'bg-red-500'
        default: return 'bg-gray-300'
    }
}

function getStatusIcon(status: TaskStatus) {
    switch (status) {
        case 'completed': return <CheckCircle2 className="w-5 h-5 text-green-600" />
        case 'in_progress': return <Clock className="w-5 h-5 text-blue-600" />
        case 'delayed': return <AlertTriangle className="w-5 h-5 text-red-600" />
        default: return <Clock className="w-5 h-5 text-gray-400" />
    }
}

export default function MissionControlPage() {
    const [tasks, setTasks] = useState(MOCK_TIMELINE)
    const [lastRefresh, setLastRefresh] = useState(new Date())

    const completedCount = tasks.filter(t => t.status === 'completed').length
    const inProgressCount = tasks.filter(t => t.status === 'in_progress').length
    const delayedCount = tasks.filter(t => t.status === 'delayed').length

    function markComplete(taskId: string) {
        setTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, status: 'completed' as TaskStatus } : t
        ))
    }

    function markDelayed(taskId: string) {
        setTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, status: 'delayed' as TaskStatus } : t
        ))
    }

    function refresh() {
        setLastRefresh(new Date())
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/planner/events">
                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold">{MOCK_EVENT.name}</h1>
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <MapPin className="w-4 h-4" />
                                    {MOCK_EVENT.venue}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="sm" onClick={refresh} className="gap-2 border-gray-600 text-gray-300">
                                <RefreshCw className="w-4 h-4" />
                                Refresh
                            </Button>
                            <Button size="sm" className="gap-2 bg-red-600 hover:bg-red-700">
                                <Phone className="w-4 h-4" />
                                SOS
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Quick Stats */}
            <div className="container mx-auto px-4 py-4">
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <Card className="bg-gray-800 border-gray-700 p-4 text-center">
                        <div className="text-3xl font-bold text-green-500">{completedCount}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wide">Completed</div>
                    </Card>
                    <Card className="bg-gray-800 border-gray-700 p-4 text-center">
                        <div className="text-3xl font-bold text-blue-500">{inProgressCount}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wide">In Progress</div>
                    </Card>
                    <Card className="bg-gray-800 border-gray-700 p-4 text-center">
                        <div className="text-3xl font-bold text-red-500">{delayedCount}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wide">Delayed</div>
                    </Card>
                    <Card className="bg-gray-800 border-gray-700 p-4 text-center">
                        <div className="text-3xl font-bold text-purple-500">{tasks.length - completedCount}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wide">Remaining</div>
                    </Card>
                </div>

                {/* Timeline */}
                <Card className="bg-gray-800 border-gray-700">
                    <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Clock className="w-5 h-5 text-indigo-400" />
                            Event Timeline
                        </h2>
                        <span className="text-xs text-gray-500">
                            Last updated: {lastRefresh.toLocaleTimeString()}
                        </span>
                    </div>

                    <div className="divide-y divide-gray-700">
                        {tasks.map((task, index) => (
                            <div
                                key={task.id}
                                className={`p-4 flex items-center gap-4 ${task.status === 'in_progress' ? 'bg-blue-900/20' : ''
                                    }`}
                            >
                                {/* Time */}
                                <div className="w-16 text-center">
                                    <div className="text-lg font-mono font-bold text-gray-300">{task.time}</div>
                                </div>

                                {/* Status Indicator */}
                                <div className="relative">
                                    <div className={`w-4 h-4 rounded-full ${getStatusColor(task.status as TaskStatus)}`} />
                                    {index < tasks.length - 1 && (
                                        <div className="absolute top-4 left-1.5 w-1 h-8 bg-gray-700" />
                                    )}
                                </div>

                                {/* Task Details */}
                                <div className="flex-1">
                                    <div className="font-medium text-white">{task.task}</div>
                                    <div className="text-sm text-gray-400 flex items-center gap-2">
                                        <Users className="w-3 h-3" />
                                        {task.vendor}
                                    </div>
                                </div>

                                {/* Status Icon */}
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(task.status as TaskStatus)}
                                </div>

                                {/* Actions */}
                                {task.status !== 'completed' && (
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => markComplete(task.id)}
                                            className="border-green-600 text-green-500 hover:bg-green-900/30"
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => markDelayed(task.id)}
                                            className="border-red-600 text-red-500 hover:bg-red-900/30"
                                        >
                                            <AlertTriangle className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="border-gray-600 text-gray-400 hover:bg-gray-700"
                                        >
                                            <Camera className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    )
}
