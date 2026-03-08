'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createTaskSchema = z.object({
    eventId: z.string().uuid('Invalid event ID'),
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    vendorId: z.string().uuid('Invalid vendor ID').optional().or(z.literal('')),
    priority: z.enum(['low', 'medium', 'high', 'urgent']),
    dueDate: z.string().optional(),
    notes: z.string().optional(),
})

const updateTaskSchema = createTaskSchema.partial().extend({
    id: z.string().uuid('Invalid task ID'),
    status: z.enum(['pending', 'accepted', 'rejected', 'in_progress', 'completed', 'verified']).optional(),
})

// ============================================================================
// TYPES
// ============================================================================

export interface Task {
    id: string;
    event_id: string;
    vendor_id?: string;
    title: string;
    description?: string;
    status: 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed' | 'verified';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    due_date?: string;
    completed_at?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    // Joined data
    events?: { name: string };
    vendors?: { company_name: string };
}

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

/**
 * Get all tasks for the current planner
 */
export async function getTasks(filters?: {
    eventId?: string;
    status?: string;
    priority?: string;
}) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return { error: 'Unauthorized' }
        }

        // Build query
        let query = supabase
            .from('tasks')
            .select(`
                *,
                events!inner(name, planner_id),
                vendors(company_name)
            `)
            .eq('events.planner_id', user.id) // RLS + explicit filter

        // Apply filters
        if (filters?.eventId) {
            query = query.eq('event_id', filters.eventId)
        }
        if (filters?.status) {
            query = query.eq('status', filters.status)
        }
        if (filters?.priority) {
            query = query.eq('priority', filters.priority)
        }

        query = query.order('due_date', { ascending: true, nullsFirst: false })
            .order('priority', { ascending: false })

        const { data, error } = await query

        if (error) {
            console.error('Error fetching tasks:', error)
            return { error: 'Failed to fetch tasks' }
        }

        return { data: data as Task[] }
    } catch (error) {
        console.error('Unexpected error in getTasks:', error)
        return { error: 'An unexpected error occurred' }
    }
}

/**
 * Get overdue and at-risk tasks
 */
export async function getAtRiskTasks() {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return { error: 'Unauthorized' }
        }

        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)

        const { data, error } = await supabase
            .from('tasks')
            .select(`
                *,
                events!inner(name, planner_id)
            `)
            .eq('events.planner_id', user.id)
            .neq('status', 'completed')
            .neq('status', 'verified')
            .lt('due_date', tomorrow.toISOString())
            .order('due_date', { ascending: true })
            .limit(10)

        if (error) {
            console.error('Error fetching at-risk tasks:', error)
            return { error: 'Failed to fetch at-risk tasks' }
        }

        return { data: data as Task[] }
    } catch (error) {
        console.error('Unexpected error in getAtRiskTasks:', error)
        return { error: 'An unexpected error occurred' }
    }
}

/**
 * Create a new task
 */
export async function createTask(formData: FormData) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return { error: 'Unauthorized' }
        }

        // Parse and validate
        const rawData = {
            eventId: formData.get('eventId') as string,
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            vendorId: formData.get('vendorId') as string,
            priority: formData.get('priority') as string,
            dueDate: formData.get('dueDate') as string,
            notes: formData.get('notes') as string,
        }

        const validation = createTaskSchema.safeParse(rawData)
        if (!validation.success) {
            return { error: validation.error.issues[0].message }
        }

        const validData = validation.data

        // Verify event belongs to planner
        const { data: event, error: eventError } = await supabase
            .from('events')
            .select('id')
            .eq('id', validData.eventId)
            .eq('planner_id', user.id)
            .single()

        if (eventError || !event) {
            return { error: 'Event not found or unauthorized' }
        }

        // Insert task
        const { data, error } = await supabase
            .from('tasks')
            .insert({
                event_id: validData.eventId,
                title: validData.title,
                description: validData.description || null,
                vendor_id: validData.vendorId || null,
                priority: validData.priority,
                due_date: validData.dueDate || null,
                notes: validData.notes || null,
                status: 'pending',
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating task:', error)
            return { error: 'Failed to create task' }
        }

        revalidatePath('/planner/tasks')
        revalidatePath(`/planner/events/${validData.eventId}`)

        return { data: data as Task, success: true }
    } catch (error) {
        console.error('Unexpected error in createTask:', error)
        return { error: 'An unexpected error occurred' }
    }
}

/**
 * Update a task
 */
export async function updateTask(formData: FormData) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return { error: 'Unauthorized' }
        }

        const rawData = {
            id: formData.get('id') as string,
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            priority: formData.get('priority') as string,
            status: formData.get('status') as string,
            dueDate: formData.get('dueDate') as string,
            notes: formData.get('notes') as string,
        }

        const validation = updateTaskSchema.safeParse(rawData)
        if (!validation.success) {
            return { error: validation.error.issues[0].message }
        }

        const { id, ...updateData } = validation.data

        // Build update object
        const updates: any = {}
        if (updateData.title) updates.title = updateData.title
        if (updateData.description !== undefined) updates.description = updateData.description
        if (updateData.priority) updates.priority = updateData.priority
        if (updateData.status) {
            updates.status = updateData.status
            if (updateData.status === 'completed') {
                updates.completed_at = new Date().toISOString()
            }
        }
        if (updateData.dueDate !== undefined) updates.due_date = updateData.dueDate
        if (updateData.notes !== undefined) updates.notes = updateData.notes

        const { data, error } = await supabase
            .from('tasks')
            .update(updates)
            .eq('id', id)
            .select(`
                *,
                events!inner(name, planner_id)
            `)
            .single()

        if (error) {
            console.error('Error updating task:', error)
            return { error: 'Failed to update task' }
        }

        // Verify ownership
        if ((data as any).events.planner_id !== user.id) {
            return { error: 'Unauthorized' }
        }

        revalidatePath('/planner/tasks')
        return { data: data as Task, success: true }
    } catch (error) {
        console.error('Unexpected error in updateTask:', error)
        return { error: 'An unexpected error occurred' }
    }
}

/**
 * Delete a task
 */
export async function deleteTask(id: string) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return { error: 'Unauthorized' }
        }

        // Verify ownership before delete
        const { data: task, error: fetchError } = await supabase
            .from('tasks')
            .select('event_id, events!inner(planner_id)')
            .eq('id', id)
            .single()

        if (fetchError || !task) {
            return { error: 'Task not found' }
        }

        if ((task as any).events.planner_id !== user.id) {
            return { error: 'Unauthorized' }
        }

        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting task:', error)
            return { error: 'Failed to delete task' }
        }

        revalidatePath('/planner/tasks')
        return { success: true }
    } catch (error) {
        console.error('Unexpected error in deleteTask:', error)
        return { error: 'An unexpected error occurred' }
    }
}

/**
 * Mark task as complete
 */
export async function completeTask(id: string) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return { error: 'Unauthorized' }
        }

        const { data, error } = await supabase
            .from('tasks')
            .update({
                status: 'completed',
                completed_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error completing task:', error)
            return { error: 'Failed to complete task' }
        }

        revalidatePath('/planner/tasks')
        return { data: data as Task, success: true }
    } catch (error) {
        console.error('Unexpected error in completeTask:', error)
        return { error: 'An unexpected error occurred' }
    }
}
