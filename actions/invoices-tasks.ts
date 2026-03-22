'use server'
import { createClient } from '@/lib/supabase/server'
import { getUserId } from '@/lib/session'
import { createLogger } from '@/lib/logger'
import { revalidatePath } from 'next/cache'

const logger = createLogger('InvoicesTasks')

// ============================================================================
// INVOICE ACTIONS
// ============================================================================

export async function getInvoices() {
    const supabase = await createClient()
    const userId = await getUserId()
    if (!userId) return { error: 'Unauthorized', data: [] }

    const { data, error } = await supabase
        .from('invoices')
        .select('*, events(name)')
        .eq('planner_id', userId)
        .order('created_at', { ascending: false })

    if (error) {
        logger.error('Failed to fetch invoices with join', error)
        // Fallback without join
        const { data: fallback } = await supabase
            .from('invoices')
            .select('*')
            .eq('planner_id', userId)
            .order('created_at', { ascending: false })
        return { data: fallback || [] }
    }

    return { data: data || [] }
}

export async function getInvoicesByEvent(eventId: string) {
    const supabase = await createClient()
    const userId = await getUserId()

    if (!userId) {
        return { error: 'Unauthorized', data: [] }
    }

    const { data, error } = await supabase
        .from('invoices')
        .select('*, invoice_items(*)')
        .eq('planner_id', userId)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })

    if (error) {
        logger.error('Failed to fetch invoices by event', error)
        return { data: [] }
    }

    return { data: data || [] }
}

export async function createInvoice(formData: {
    eventId: string
    clientName: string
    clientEmail?: string
    clientPhone?: string
    dueDate?: string
    items: { description: string; quantity: number; rate: number }[]
    notes?: string
}) {
    const supabase = await createClient()
    const userId = await getUserId()
    if (!userId) return { error: 'Unauthorized' }

    // Generate invoice number
    const { count } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })

    const invoiceNumber = `INV-${String((count || 0) + 1).padStart(4, '0')}`

    // Calculate totals
    const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0)
    const platformFee = Math.round(subtotal * 0.02)
    const total = subtotal + platformFee

    // Insert invoice
    const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
            event_id: formData.eventId,
            planner_id: userId,
            invoice_number: invoiceNumber,
            client_name: formData.clientName,
            client_email: formData.clientEmail || '',
            client_phone: formData.clientPhone || '',
            due_date: formData.dueDate || null,
            subtotal,
            platform_fee: platformFee,
            total,
            notes: formData.notes || '',
        })
        .select()
        .single()

    if (invoiceError || !invoice) {
        logger.error('Failed to create invoice', invoiceError)
        return { error: 'Failed to create invoice' }
    }

    // Insert items
    if (formData.items.length > 0) {
        const itemRows = formData.items.map(item => ({
            invoice_id: invoice.id,
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.quantity * item.rate,
        }))

        await supabase.from('invoice_items').insert(itemRows)
    }

    revalidatePath('/planner/invoices')
    return { success: true, invoice }
}

export async function updateInvoiceStatus(invoiceId: string, status: string) {
    const supabase = await createClient()
    const userId = await getUserId()

    if (!userId) {
        return { error: 'Unauthorized' }
    }

    const updateData: any = { status, updated_at: new Date().toISOString() }
    if (status === 'paid') {
        updateData.paid_at = new Date().toISOString()
        // Get invoice total to set paid_amount
        const { data: inv } = await supabase
            .from('invoices')
            .select('total')
            .eq('id', invoiceId)
            .eq('planner_id', userId)
            .single()
        if (inv) updateData.paid_amount = inv.total
    }

    const { error } = await supabase
        .from('invoices')
        .update(updateData)
        .eq('id', invoiceId)
        .eq('planner_id', userId)

    if (error) {
        logger.error('Failed to update invoice status', error)
        return { error: 'Failed to update invoice' }
    }

    revalidatePath('/planner/invoices')
    return { success: true }
}

// ============================================================================
// TASK ACTIONS
// ============================================================================

export async function getTasks() {
    const supabase = await createClient()
    const userId = await getUserId()
    if (!userId) return { error: 'Unauthorized', data: [] }

    const { data, error } = await supabase
        .from('tasks')
        .select('*, events(name)')
        .eq('planner_id', userId)
        .order('created_at', { ascending: false })

    if (error) {
        logger.error('Failed to fetch tasks with join', error)
        const { data: fallback } = await supabase
            .from('tasks')
            .select('*')
            .eq('planner_id', userId)
            .order('created_at', { ascending: false })
        return { data: fallback || [] }
    }

    return { data: data || [] }
}

export async function getTasksByEvent(eventId: string) {
    const supabase = await createClient()
    const userId = await getUserId()

    if (!userId) {
        return { error: 'Unauthorized', data: [] }
    }

    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('planner_id', userId)
        .eq('event_id', eventId)
        .order('due_date', { ascending: true })

    if (error) {
        logger.error('Failed to fetch tasks by event', error)
        return { data: [] }
    }

    return { data: data || [] }
}

export async function createTask(formData: {
    eventId?: string
    title: string
    description?: string
    priority?: string
    dueDate?: string
    assignedTo?: string
    category?: string
}) {
    const supabase = await createClient()
    const userId = await getUserId()
    if (!userId) return { error: 'Unauthorized' }

    const { data, error } = await supabase
        .from('tasks')
        .insert({
            event_id: formData.eventId || null,
            planner_id: userId,
            title: formData.title,
            description: formData.description || '',
            priority: formData.priority || 'medium',
            due_date: formData.dueDate || null,
            assigned_to: formData.assignedTo || '',
            category: formData.category || 'general',
        })
        .select()
        .single()

    if (error) {
        logger.error('Failed to create task', error)
        return { error: 'Failed to create task' }
    }

    revalidatePath('/planner/tasks')
    return { success: true, task: data }
}

export async function updateTaskStatus(taskId: string, status: string) {
    const supabase = await createClient()
    const userId = await getUserId()

    if (!userId) {
        return { error: 'Unauthorized' }
    }

    const { error } = await supabase
        .from('tasks')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', taskId)
        .eq('planner_id', userId)

    if (error) {
        logger.error('Failed to update task status', error)
        return { error: 'Failed to update task' }
    }

    revalidatePath('/planner/tasks')
    return { success: true }
}

export async function deleteTask(taskId: string) {
    const supabase = await createClient()
    const userId = await getUserId()

    if (!userId) {
        return { error: 'Unauthorized' }
    }

    const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('planner_id', userId)

    if (error) {
        logger.error('Failed to delete task', error)
        return { error: 'Failed to delete task' }
    }

    revalidatePath('/planner/tasks')
    return { success: true }
}
