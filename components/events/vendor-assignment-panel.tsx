'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Plus, User, Phone, IndianRupee, Clock, Check, X, AlertTriangle,
    MapPin, CheckCircle2, ListTodo, Camera, Trash2, UserPlus, LogIn
} from 'lucide-react'
import { toast } from 'sonner'
import type { Event, EventFunction, VendorAssignment, VendorTask, BudgetCategoryType } from '@/types/domain'
import {
    getAssignmentsForFunction,
    createAssignment,
    updateAssignmentStatus,
    addTask,
    updateTaskStatus,
    markArrival,
    deleteAssignment
} from '@/lib/stores/vendor-assignment-store'

interface VendorAssignmentPanelProps {
    eventFunction: EventFunction
    event: Event
}

const STATUS_CONFIG = {
    requested: { color: 'bg-amber-100 text-amber-700', label: 'Requested' },
    confirmed: { color: 'bg-green-100 text-green-700', label: 'Confirmed' },
    declined: { color: 'bg-red-100 text-red-700', label: 'Declined' },
    completed: { color: 'bg-blue-100 text-blue-700', label: 'Completed' },
    cancelled: { color: 'bg-gray-100 text-gray-700', label: 'Cancelled' },
}

const BUDGET_CATEGORIES: { value: BudgetCategoryType; label: string }[] = [
    { value: 'venue', label: 'Venue' },
    { value: 'food', label: 'Food & Catering' },
    { value: 'decor', label: 'Decoration' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'photography', label: 'Photography' },
    { value: 'bridal', label: 'Bridal/Groom' },
    { value: 'logistics', label: 'Logistics' },
    { value: 'guest', label: 'Guest Experience' },
    { value: 'misc', label: 'Other' },
]

export function VendorAssignmentPanel({ eventFunction, event }: VendorAssignmentPanelProps) {
    const [assignments, setAssignments] = useState<VendorAssignment[]>([])
    const [showAddForm, setShowAddForm] = useState(false)
    const [expandedAssignment, setExpandedAssignment] = useState<string | null>(null)
    const [newTaskTitle, setNewTaskTitle] = useState('')

    // Form state
    const [formData, setFormData] = useState({
        vendorName: '',
        vendorCategory: '',
        vendorPhone: '',
        budgetCategory: 'misc' as BudgetCategoryType,
        agreedAmount: 0,
        arrivalTime: '',
    })

    // Load assignments
    useEffect(() => {
        setAssignments(getAssignmentsForFunction(eventFunction.id))
    }, [eventFunction.id])

    const handleAddAssignment = () => {
        if (!formData.vendorName || !formData.vendorCategory) {
            toast.error('Please enter vendor name and category')
            return
        }

        const newAssignment = createAssignment({
            eventId: event.id,
            functionId: eventFunction.id,
            vendorId: `vendor_${Date.now()}`,
            vendorName: formData.vendorName,
            vendorCategory: formData.vendorCategory,
            vendorPhone: formData.vendorPhone,
            budgetCategory: formData.budgetCategory,
            agreedAmount: formData.agreedAmount,
            arrivalTime: formData.arrivalTime,
        })

        setAssignments([...assignments, newAssignment])
        setShowAddForm(false)
        setFormData({
            vendorName: '',
            vendorCategory: '',
            vendorPhone: '',
            budgetCategory: 'misc',
            agreedAmount: 0,
            arrivalTime: '',
        })
        toast.success('Vendor assigned')
    }

    const handleStatusChange = (id: string, status: VendorAssignment['status']) => {
        updateAssignmentStatus(id, status)
        setAssignments(assignments.map(a =>
            a.id === id ? { ...a, status } : a
        ))
        toast.success(`Status updated to ${status}`)
    }

    const handleMarkArrival = (id: string) => {
        const updated = markArrival(id)
        if (updated) {
            setAssignments(assignments.map(a => a.id === id ? updated : a))
            toast.success('Vendor arrival marked')
        }
    }

    const handleAddTask = (assignmentId: string) => {
        if (!newTaskTitle.trim()) return

        const updated = addTask(assignmentId, { title: newTaskTitle })
        if (updated) {
            setAssignments(assignments.map(a => a.id === assignmentId ? updated : a))
            setNewTaskTitle('')
            toast.success('Task added')
        }
    }

    const handleTaskStatus = (assignmentId: string, taskId: string, status: VendorTask['status']) => {
        const updated = updateTaskStatus(assignmentId, taskId, status)
        if (updated) {
            setAssignments(assignments.map(a => a.id === assignmentId ? updated : a))
        }
    }

    const handleDelete = (id: string) => {
        deleteAssignment(id)
        setAssignments(assignments.filter(a => a.id !== id))
        toast.success('Assignment removed')
    }

    const confirmedCount = assignments.filter(a => a.status === 'confirmed').length
    const totalAmount = assignments.reduce((sum, a) => sum + a.agreedAmount, 0)

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="font-medium text-gray-900">Assigned Vendors</h4>
                    <p className="text-sm text-gray-500">
                        {assignments.length} vendors • {confirmedCount} confirmed • ₹{(totalAmount / 1000).toFixed(0)}K total
                    </p>
                </div>
                <Button size="sm" onClick={() => setShowAddForm(true)}>
                    <UserPlus className="w-4 h-4 mr-2" /> Assign Vendor
                </Button>
            </div>

            {/* Add Form */}
            {showAddForm && (
                <Card className="border-blue-200 bg-blue-50/50">
                    <CardContent className="pt-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="text-xs">Vendor Name</Label>
                                <Input
                                    value={formData.vendorName}
                                    onChange={e => setFormData({ ...formData, vendorName: e.target.value })}
                                    placeholder="e.g., Sharma Studios"
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Vendor Type</Label>
                                <Input
                                    value={formData.vendorCategory}
                                    onChange={e => setFormData({ ...formData, vendorCategory: e.target.value })}
                                    placeholder="e.g., Photographer"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <Label className="text-xs">Phone</Label>
                                <Input
                                    value={formData.vendorPhone}
                                    onChange={e => setFormData({ ...formData, vendorPhone: e.target.value })}
                                    placeholder="+91..."
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Budget Category</Label>
                                <select
                                    className="w-full h-10 px-3 border rounded-md text-sm"
                                    value={formData.budgetCategory}
                                    onChange={e => setFormData({ ...formData, budgetCategory: e.target.value as BudgetCategoryType })}
                                >
                                    {BUDGET_CATEGORIES.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label className="text-xs">Agreed Amount (₹)</Label>
                                <Input
                                    type="number"
                                    value={formData.agreedAmount}
                                    onChange={e => setFormData({ ...formData, agreedAmount: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                                Cancel
                            </Button>
                            <Button size="sm" onClick={handleAddAssignment}>
                                <Plus className="w-4 h-4 mr-1" /> Assign
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Vendors List */}
            {assignments.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                    <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No vendors assigned yet</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {assignments.map(assignment => {
                        const isExpanded = expandedAssignment === assignment.id
                        const statusConfig = STATUS_CONFIG[assignment.status]
                        const completedTasks = assignment.tasks.filter(t => t.status === 'completed').length

                        return (
                            <Card key={assignment.id} className="overflow-hidden">
                                <CardContent className="p-4">
                                    {/* Main row */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                                <User className="w-5 h-5 text-gray-500" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{assignment.vendorName}</p>
                                                <p className="text-sm text-gray-500">{assignment.vendorCategory}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                                            <span className="text-sm font-medium text-green-600">
                                                ₹{(assignment.agreedAmount / 1000).toFixed(0)}K
                                            </span>
                                        </div>
                                    </div>

                                    {/* Details row */}
                                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                                        {assignment.vendorPhone && (
                                            <span className="flex items-center gap-1">
                                                <Phone className="w-3 h-3" /> {assignment.vendorPhone}
                                            </span>
                                        )}
                                        {assignment.arrivalTime && (
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> Arrives: {assignment.arrivalTime}
                                            </span>
                                        )}
                                        {assignment.arrivedAt && (
                                            <Badge className="bg-green-100 text-green-700 text-xs">
                                                <CheckCircle2 className="w-3 h-3 mr-1" /> Arrived
                                            </Badge>
                                        )}
                                        {assignment.tasks.length > 0 && (
                                            <span className="flex items-center gap-1">
                                                <ListTodo className="w-3 h-3" />
                                                {completedTasks}/{assignment.tasks.length} tasks
                                            </span>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 mt-3">
                                        {assignment.status === 'requested' && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700"
                                                    onClick={() => handleStatusChange(assignment.id, 'confirmed')}
                                                >
                                                    <Check className="w-3 h-3 mr-1" /> Confirm
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600"
                                                    onClick={() => handleStatusChange(assignment.id, 'declined')}
                                                >
                                                    <X className="w-3 h-3 mr-1" /> Decline
                                                </Button>
                                            </>
                                        )}
                                        {assignment.status === 'confirmed' && !assignment.arrivedAt && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleMarkArrival(assignment.id)}
                                            >
                                                <LogIn className="w-3 h-3 mr-1" /> Mark Arrival
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setExpandedAssignment(isExpanded ? null : assignment.id)}
                                        >
                                            <ListTodo className="w-3 h-3 mr-1" /> Tasks
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="ml-auto h-8 w-8"
                                            onClick={() => handleDelete(assignment.id)}
                                        >
                                            <Trash2 className="w-4 h-4 text-red-400" />
                                        </Button>
                                    </div>

                                    {/* Expanded Tasks */}
                                    {isExpanded && (
                                        <div className="mt-4 pt-4 border-t space-y-2">
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="Add task..."
                                                    value={newTaskTitle}
                                                    onChange={e => setNewTaskTitle(e.target.value)}
                                                    className="h-8"
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter') handleAddTask(assignment.id)
                                                    }}
                                                />
                                                <Button size="sm" onClick={() => handleAddTask(assignment.id)}>
                                                    <Plus className="w-4 h-4" />
                                                </Button>
                                            </div>

                                            {assignment.tasks.map(task => (
                                                <div
                                                    key={task.id}
                                                    className="flex items-center gap-2 p-2 rounded bg-gray-50"
                                                >
                                                    <button
                                                        onClick={() => handleTaskStatus(
                                                            assignment.id,
                                                            task.id,
                                                            task.status === 'completed' ? 'pending' : 'completed'
                                                        )}
                                                        className={`w-5 h-5 rounded border flex items-center justify-center ${task.status === 'completed'
                                                                ? 'bg-green-500 border-green-500 text-white'
                                                                : 'border-gray-300'
                                                            }`}
                                                    >
                                                        {task.status === 'completed' && <Check className="w-3 h-3" />}
                                                    </button>
                                                    <span className={task.status === 'completed' ? 'line-through text-gray-400' : ''}>
                                                        {task.title}
                                                    </span>
                                                    {task.proofUrl && (
                                                        <Camera className="w-4 h-4 text-blue-500 ml-auto" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
