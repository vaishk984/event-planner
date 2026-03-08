'use client'

import {
    DndContext,
    DragOverlay,
    useSensors,
    useSensor,
    PointerSensor,
    DragStartEvent,
    DragEndEvent,
    closestCorners
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Task, TaskStatus } from "@/lib/types/task"
import { TaskCard } from "./task-card"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useDroppable } from '@dnd-kit/core'
import { SortableTask } from './sortable-task'

interface KanbanBoardProps {
    tasks: Task[]
    onTaskMove: (taskId: string, newStatus: TaskStatus) => void
}

const COLUMNS: { id: TaskStatus; title: string, color: string, headerColor: string }[] = [
    { id: 'pending', title: 'Pending', color: 'bg-gray-50/50', headerColor: 'border-t-4 border-gray-400' },
    { id: 'accepted', title: 'Accepted', color: 'bg-blue-50/30', headerColor: 'border-t-4 border-blue-400' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-purple-50/30', headerColor: 'border-t-4 border-purple-400' },
    { id: 'completed', title: 'Completed', color: 'bg-green-50/30', headerColor: 'border-t-4 border-green-400' }
]

function ColumnContainer({ column, tasks }: { column: typeof COLUMNS[0], tasks: Task[] }) {
    const { setNodeRef } = useDroppable({
        id: column.id,
    })

    return (
        <div ref={setNodeRef} className={`flex-shrink-0 w-80 rounded-xl flex flex-col ${column.color} border border-gray-100 shadow-sm transition-colors hover:bg-gray-50`}>
            {/* Column Header */}
            <div className={`p-4 flex items-center justify-between bg-white rounded-t-xl border-b border-gray-100 ${column.headerColor}`}>
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-800 tracking-tight">{column.title}</h3>
                    <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs font-semibold text-gray-600 border border-gray-200">
                        {tasks.length}
                    </span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-gray-600">
                    <Plus className="w-4 h-4" />
                </Button>
            </div>

            {/* Task List */}
            <div className="p-3 pt-3 flex-1 overflow-y-auto no-scrollbar space-y-3 min-h-[100px]">
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map((task) => (
                        <SortableTask key={task.id} task={task} />
                    ))}
                </SortableContext>

                {tasks.length === 0 && (
                    <div className="h-full flex items-center justify-center opacity-40">
                        <span className="text-sm">Drop here</span>
                    </div>
                )}
            </div>
        </div>
    )
}

export function KanbanBoard({ tasks, onTaskMove }: KanbanBoardProps) {
    const [activeTask, setActiveTask] = useState<Task | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    )

    // Group tasks by status
    const tasksByStatus = tasks.reduce((acc, task) => {
        // Map 'verified' to 'completed' column for display simplicity
        const status = task.status === 'verified' ? 'completed' : task.status
        // Map 'rejected' to 'pending'
        const displayStatus = status === 'rejected' ? 'pending' : status

        // Only add if column exists
        if (COLUMNS.some(c => c.id === displayStatus)) {
            if (!acc[displayStatus]) acc[displayStatus] = []
            acc[displayStatus].push(task)
        }
        return acc
    }, {} as Record<TaskStatus, Task[]>)

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event
        const task = tasks.find(t => t.id === active.id)
        if (task) setActiveTask(task)
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (!over) {
            setActiveTask(null)
            return
        }

        const activeId = active.id as string
        const overId = over.id as string

        const task = tasks.find(t => t.id === activeId)
        if (!task) return

        if (COLUMNS.some(col => col.id === overId)) {
            if (task.status !== overId) {
                onTaskMove(activeId, overId as TaskStatus)
            }
        }
        else {
            const overTask = tasks.find(t => t.id === overId)
            if (overTask && overTask.status !== task.status) {
                onTaskMove(activeId, overTask.status)
            }
        }

        setActiveTask(null)
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-[calc(100vh-140px)] gap-6 overflow-x-auto pb-4 px-1">
                {COLUMNS.map((col) => (
                    <ColumnContainer
                        key={col.id}
                        column={col}
                        tasks={tasksByStatus[col.id] || []}
                    />
                ))}
            </div>

            {typeof document !== 'undefined' && createPortal(
                <DragOverlay>
                    {activeTask ? (
                        <div className="opacity-80 rotate-2 scale-105 cursor-grabbing">
                            <TaskCard task={activeTask} />
                        </div>
                    ) : null}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    )
}
