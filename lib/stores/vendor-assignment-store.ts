// Vendor Assignment Store
// Manages vendor assignments to functions with tasks and tracking

import type {
    VendorAssignment,
    VendorTask,
    VendorAssignmentStatus,
    BudgetCategoryType
} from '@/types/domain'

// In-memory store
let vendorAssignments: VendorAssignment[] = []

// Get all assignments for an event
export function getAssignmentsForEvent(eventId: string): VendorAssignment[] {
    return vendorAssignments.filter(a => a.eventId === eventId)
}

// Get assignments for a specific function
export function getAssignmentsForFunction(functionId: string): VendorAssignment[] {
    return vendorAssignments.filter(a => a.functionId === functionId)
}

// Get assignment by vendor and function
export function getAssignment(vendorId: string, functionId: string): VendorAssignment | undefined {
    return vendorAssignments.find(a => a.vendorId === vendorId && a.functionId === functionId)
}

// Create a new vendor assignment
export function createAssignment(data: {
    eventId: string;
    functionId: string;
    vendorId: string;
    vendorName: string;
    vendorCategory: string;
    vendorPhone?: string;
    budgetCategory: BudgetCategoryType;
    agreedAmount: number;
    arrivalTime?: string;
    notes?: string;
}): VendorAssignment {
    const assignment: VendorAssignment = {
        id: `assign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...data,
        paidAmount: 0,
        status: 'requested',
        tasks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }

    vendorAssignments.push(assignment)
    return assignment
}

// Update assignment status
export function updateAssignmentStatus(
    assignmentId: string,
    status: VendorAssignmentStatus
): VendorAssignment | null {
    const index = vendorAssignments.findIndex(a => a.id === assignmentId)
    if (index === -1) return null

    vendorAssignments[index] = {
        ...vendorAssignments[index],
        status,
        updatedAt: new Date().toISOString(),
    }

    return vendorAssignments[index]
}

// Update payment
export function updatePayment(
    assignmentId: string,
    paidAmount: number
): VendorAssignment | null {
    const index = vendorAssignments.findIndex(a => a.id === assignmentId)
    if (index === -1) return null

    vendorAssignments[index] = {
        ...vendorAssignments[index],
        paidAmount,
        updatedAt: new Date().toISOString(),
    }

    return vendorAssignments[index]
}

// Mark vendor arrival
export function markArrival(assignmentId: string): VendorAssignment | null {
    const index = vendorAssignments.findIndex(a => a.id === assignmentId)
    if (index === -1) return null

    vendorAssignments[index] = {
        ...vendorAssignments[index],
        arrivedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }

    return vendorAssignments[index]
}

// Mark vendor departure
export function markDeparture(assignmentId: string): VendorAssignment | null {
    const index = vendorAssignments.findIndex(a => a.id === assignmentId)
    if (index === -1) return null

    vendorAssignments[index] = {
        ...vendorAssignments[index],
        departedAt: new Date().toISOString(),
        status: 'completed',
        updatedAt: new Date().toISOString(),
    }

    return vendorAssignments[index]
}

// Add task to vendor
export function addTask(
    assignmentId: string,
    task: Omit<VendorTask, 'id' | 'status'>
): VendorAssignment | null {
    const index = vendorAssignments.findIndex(a => a.id === assignmentId)
    if (index === -1) return null

    const newTask: VendorTask = {
        id: `task_${Date.now()}`,
        ...task,
        status: 'pending',
    }

    vendorAssignments[index] = {
        ...vendorAssignments[index],
        tasks: [...vendorAssignments[index].tasks, newTask],
        updatedAt: new Date().toISOString(),
    }

    return vendorAssignments[index]
}

// Update task status
export function updateTaskStatus(
    assignmentId: string,
    taskId: string,
    status: VendorTask['status'],
    proofUrl?: string
): VendorAssignment | null {
    const index = vendorAssignments.findIndex(a => a.id === assignmentId)
    if (index === -1) return null

    const assignment = vendorAssignments[index]
    const taskIndex = assignment.tasks.findIndex(t => t.id === taskId)
    if (taskIndex === -1) return null

    const updatedTasks = [...assignment.tasks]
    updatedTasks[taskIndex] = {
        ...updatedTasks[taskIndex],
        status,
        proofUrl,
        completedAt: status === 'completed' ? new Date().toISOString() : undefined,
    }

    vendorAssignments[index] = {
        ...assignment,
        tasks: updatedTasks,
        updatedAt: new Date().toISOString(),
    }

    return vendorAssignments[index]
}

// Set backup vendor
export function setBackupVendor(
    assignmentId: string,
    backupVendorId: string,
    backupVendorName: string
): VendorAssignment | null {
    const index = vendorAssignments.findIndex(a => a.id === assignmentId)
    if (index === -1) return null

    vendorAssignments[index] = {
        ...vendorAssignments[index],
        backupVendorId,
        backupVendorName,
        updatedAt: new Date().toISOString(),
    }

    return vendorAssignments[index]
}

// Delete assignment
export function deleteAssignment(assignmentId: string): boolean {
    const index = vendorAssignments.findIndex(a => a.id === assignmentId)
    if (index === -1) return false

    vendorAssignments.splice(index, 1)
    return true
}

// Get summary stats
export function getAssignmentSummary(eventId: string) {
    const assignments = getAssignmentsForEvent(eventId)

    return {
        total: assignments.length,
        confirmed: assignments.filter(a => a.status === 'confirmed').length,
        pending: assignments.filter(a => a.status === 'requested').length,
        completed: assignments.filter(a => a.status === 'completed').length,
        totalAgreed: assignments.reduce((sum, a) => sum + a.agreedAmount, 0),
        totalPaid: assignments.reduce((sum, a) => sum + a.paidAmount, 0),
        arrived: assignments.filter(a => a.arrivedAt).length,
    }
}

// Get vendors by budget category
export function getVendorsByCategory(eventId: string, category: BudgetCategoryType): VendorAssignment[] {
    return vendorAssignments.filter(a => a.eventId === eventId && a.budgetCategory === category)
}

// Calculate total spent by category
export function getSpentByCategory(eventId: string, category: BudgetCategoryType): number {
    return getVendorsByCategory(eventId, category)
        .reduce((sum, a) => sum + a.paidAmount, 0)
}

// Calculate total committed by category
export function getCommittedByCategory(eventId: string, category: BudgetCategoryType): number {
    return getVendorsByCategory(eventId, category)
        .filter(a => a.status === 'confirmed' || a.status === 'completed')
        .reduce((sum, a) => sum + a.agreedAmount, 0)
}
