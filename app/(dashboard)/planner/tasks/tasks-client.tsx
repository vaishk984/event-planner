'use client'

import { useState, useEffect } from 'react'
import { KanbanBoard } from "@/components/tasks/kanban-board"
import { Task, TaskStatus } from "@/lib/types/task"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Filter, X, Loader2 } from "lucide-react"
import { createTask, updateTask, Task as ServerTask } from "@/actions/tasks"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

interface TasksClientProps {
    initialTasks: ServerTask[]
}

export function TasksClient({ initialTasks }: TasksClientProps) {
    // Map Server Tasks to UI Tasks
    const mapServerTaskToUITask = (t: ServerTask): Task => ({
        id: t.id,
        eventId: t.event_id,
        eventName: t.events?.name || 'Untitled Event',
        title: t.title,
        description: t.description || undefined,
        status: t.status as TaskStatus,
        priority: t.priority,
        dueDate: t.due_date || undefined,
        assignee: t.vendors?.company_name || 'Planner',
        assigneeType: t.vendor_id ? 'vendor' : 'planner',
        vendorId: t.vendor_id || undefined,
        tags: []
    })

    const [tasks, setTasks] = useState<Task[]>(initialTasks.map(mapServerTaskToUITask))
    const [showCreateDialog, setShowCreateDialog] = useState(false)

    const handleTaskMove = async (taskId: string, newStatus: TaskStatus) => {
        setTasks(prev => prev.map(task =>
            task.id === taskId ? { ...task, status: newStatus } : task
        ))

        const formData = new FormData()
        formData.append('id', taskId)
        formData.append('status', newStatus)

        const result = await updateTask(formData)
        if (result.error) {
            toast.error("Failed to update task")
        } else {
            toast.success("Task moved")
        }
    }

    const handleTaskCreated = (newTask: Task) => {
        setTasks(prev => [...prev, newTask])
        setShowCreateDialog(false)
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Task Board</h1>
                    <p className="text-gray-500">{tasks.length} tasks across your events</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                        onClick={() => setShowCreateDialog(true)}
                    >
                        <Plus className="w-4 h-4" />
                        New Task
                    </Button>
                </div>
            </div>

            {/* Create Task Dialog */}
            {showCreateDialog && (
                <CreateTaskDialog
                    onClose={() => setShowCreateDialog(false)}
                    onCreated={handleTaskCreated}
                />
            )}

            {/* Board */}
            <KanbanBoard tasks={tasks} onTaskMove={handleTaskMove} />
        </div>
    )
}

// ============================================================================
// CREATE TASK DIALOG
// ============================================================================

function CreateTaskDialog({
    onClose,
    onCreated
}: {
    onClose: () => void
    onCreated: (task: Task) => void
}) {
    const [events, setEvents] = useState<any[]>([])
    const [vendors, setVendors] = useState<any[]>([])
    const [selectedEventId, setSelectedEventId] = useState('')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [priority, setPriority] = useState('medium')
    const [dueDate, setDueDate] = useState('')
    const [vendorId, setVendorId] = useState('')
    const [loading, setLoading] = useState(true)
    const [creating, setCreating] = useState(false)

    useEffect(() => {
        loadEvents()
    }, [])

    useEffect(() => {
        if (selectedEventId) {
            loadVendors(selectedEventId)
        }
    }, [selectedEventId])

    const loadEvents = async () => {
        const supabase = createClient()
        const { data } = await supabase.from('events').select('id, name').order('created_at', { ascending: false })
        setEvents(data || [])
        if (data && data.length > 0) {
            setSelectedEventId(data[0].id)
        }
        setLoading(false)
    }

    const loadVendors = async (eventId: string) => {
        const supabase = createClient()
        const { data: bookings } = await supabase
            .from('booking_requests')
            .select('vendor_id, vendors(id, company_name)')
            .eq('event_id', eventId)
            .in('status', ['accepted', 'confirmed'])

        const vendorList = (bookings || [])
            .filter((b: any) => b.vendors)
            .map((b: any) => ({
                id: b.vendors.id,
                name: b.vendors.company_name
            }))

        setVendors(vendorList)
    }

    const handleSubmit = async () => {
        if (!selectedEventId || !title.trim()) {
            toast.error('Event and title are required')
            return
        }

        setCreating(true)

        const formData = new FormData()
        formData.append('eventId', selectedEventId)
        formData.append('title', title.trim())
        formData.append('description', description.trim())
        formData.append('priority', priority)
        if (dueDate) formData.append('dueDate', dueDate)
        if (vendorId) formData.append('vendorId', vendorId)

        const result = await createTask(formData)

        if (result.error) {
            toast.error(result.error)
        } else if (result.data) {
            toast.success('Task created!')
            const eventName = events.find(e => e.id === selectedEventId)?.name || 'Event'
            const vendorName = vendors.find(v => v.id === vendorId)?.name || 'Planner'
            onCreated({
                id: result.data.id,
                eventId: selectedEventId,
                eventName,
                title: title.trim(),
                description: description.trim() || undefined,
                status: 'pending' as TaskStatus,
                priority: priority as any,
                dueDate: dueDate || undefined,
                assignee: vendorName,
                assigneeType: vendorId ? 'vendor' : 'planner',
                vendorId: vendorId || undefined,
                tags: []
            })
        }

        setCreating(false)
    }

    if (loading) {
        return (
            <Card className="mb-6 border-indigo-200">
                <CardContent className="p-6 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="mb-6 border-indigo-200 shadow-lg">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Create New Task</CardTitle>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="w-4 h-4" />
                </Button>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    {/* Event selector */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Event *</label>
                        <select
                            className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                            value={selectedEventId}
                            onChange={e => setSelectedEventId(e.target.value)}
                        >
                            {events.map(evt => (
                                <option key={evt.id} value={evt.id}>{evt.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Title *</label>
                        <Input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g. Confirm decor theme"
                        />
                    </div>

                    {/* Priority */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Priority</label>
                        <select
                            className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                            value={priority}
                            onChange={e => setPriority(e.target.value)}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>

                    {/* Due Date */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Due Date</label>
                        <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                    </div>

                    {/* Assign to Vendor */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Assign to Vendor</label>
                        <select
                            className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                            value={vendorId}
                            onChange={e => setVendorId(e.target.value)}
                        >
                            <option value="">Planner (self)</option>
                            {vendors.map(v => (
                                <option key={v.id} value={v.id}>{v.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                        <Input
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Optional details..."
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button
                        className="bg-indigo-600 hover:bg-indigo-700"
                        onClick={handleSubmit}
                        disabled={creating || !title.trim() || !selectedEventId}
                    >
                        {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Task'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
