export type TaskStatus = 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed' | 'verified'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Task {
    id: string
    eventId: string
    eventName: string // Denormalized for display
    title: string
    description?: string
    status: TaskStatus
    priority: TaskPriority
    dueDate?: string
    assignee?: string // "Planner", "Client", or specific vendor name
    assigneeType?: 'planner' | 'client' | 'vendor' // To differentiate assignee types
    vendorId?: string // If assigned to a vendor
    tags?: string[]
}

export interface TaskColumn {
    id: TaskStatus
    title: string
    color?: string
    tasks: Task[]
}

// Mock Data removed as we are using real data
export const MOCK_TASKS: Task[] = []
