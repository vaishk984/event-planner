import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Task } from "@/lib/types/task"
import { Clock, MoreHorizontal, User, Building2, UserCheck } from "lucide-react"

interface TaskCardProps {
    task: Task
}

const PRIORITY_COLORS = {
    low: "bg-blue-100 text-blue-700",
    medium: "bg-yellow-100 text-yellow-700",
    high: "bg-orange-100 text-orange-700",
    urgent: "bg-red-100 text-red-700"
}

const ASSIGNEE_COLORS = {
    planner: "bg-indigo-100 text-indigo-700 border-indigo-200",
    client: "bg-purple-100 text-purple-700 border-purple-200",
    vendor: "bg-emerald-100 text-emerald-700 border-emerald-200",
}

const ASSIGNEE_ICONS = {
    planner: UserCheck,
    client: User,
    vendor: Building2,
}

export function TaskCard({ task }: TaskCardProps) {
    const assigneeType = task.assigneeType || 'planner'
    const AssigneeIcon = ASSIGNEE_ICONS[assigneeType]

    // Calculate if task is overdue
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() &&
        (task.status !== 'completed' && task.status !== 'verified')

    return (
        <Card className={`p-3 mb-3 cursor-grab hover:shadow-md transition-shadow bg-white border-l-4 ${isOverdue ? 'border-l-red-500' : task.priority === 'urgent' ? 'border-l-orange-500' : 'border-l-transparent'
            }`}>
            <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize ${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium}`}>
                    {task.priority}
                </span>
                <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="w-4 h-4" />
                </button>
            </div>

            <h4 className="text-sm font-semibold text-gray-900 mb-1 leading-tight">{task.title}</h4>
            <p className="text-xs text-gray-500 mb-3">{task.eventName}</p>

            {/* Assignee Badge */}
            {task.assignee && (
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border mb-2 ${ASSIGNEE_COLORS[assigneeType]}`}>
                    <AssigneeIcon className="w-3 h-3" />
                    <span className="truncate max-w-[150px]">{task.assignee}</span>
                </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                <div className="flex items-center gap-2">
                    {task.dueDate && (
                        <span className={`flex items-center gap-1 text-[10px] ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-400'
                            }`}>
                            <Clock className="w-3 h-3" />
                            {isOverdue && '⚠️ '}
                            {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                    )}
                </div>

                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                    <div className="flex gap-1">
                        {task.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </Card>
    )
}
