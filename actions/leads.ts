'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createLeadSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    phone: z.string().min(10, 'Phone must be at least 10 digits'),
    eventType: z.string().min(1, 'Event type is required'),
    eventDate: z.string().optional(),
    budgetRange: z.string().optional(),
    source: z.enum(['website', 'referral', 'social_media', 'advertisement', 'walk_in', 'other']).optional(),
    notes: z.string().optional(),
})

const updateLeadSchema = createLeadSchema.partial().extend({
    id: z.string().uuid('Invalid lead ID'),
})

// ============================================================================
// TYPES
// ============================================================================

export interface Lead {
    id: string;
    planner_id: string;
    name: string;
    email?: string;
    phone: string;
    event_type: string;
    event_date?: string;
    budget_range?: string;
    source?: string;
    status: 'prospect' | 'active' | 'past' | 'inactive';
    score: number;
    notes?: string;
    created_at: string;
    updated_at: string;
}

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

/**
 * Get all leads for the current planner
 */
export async function getLeads() {
    try {
        const supabase = await createClient()

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return { error: 'Unauthorized' }
        }

        // Fetch leads (RLS automatically filters by planner_id)
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('status', 'prospect') // Only leads, not active clients
            .order('score', { ascending: false }) // Hot leads first
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching leads:', error)
            return { error: 'Failed to fetch leads' }
        }

        return { data: data as Lead[] }
    } catch (error) {
        console.error('Unexpected error in getLeads:', error)
        return { error: 'An unexpected error occurred' }
    }
}

/**
 * Get a single lead by ID
 */
export async function getLead(id: string) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return { error: 'Unauthorized' }
        }

        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('id', id)
            .eq('status', 'prospect')
            .single()

        if (error) {
            console.error('Error fetching lead:', error)
            return { error: 'Lead not found' }
        }

        return { data: data as Lead }
    } catch (error) {
        console.error('Unexpected error in getLead:', error)
        return { error: 'An unexpected error occurred' }
    }
}

/**
 * Create a new lead
 */
export async function createLead(formData: FormData) {
    try {
        const supabase = await createClient()

        // Auth check
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return { error: 'Unauthorized' }
        }

        // Parse and validate input
        const rawData = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            eventType: formData.get('eventType') as string,
            eventDate: formData.get('eventDate') as string,
            budgetRange: formData.get('budgetRange') as string,
            source: formData.get('source') as string,
            notes: formData.get('notes') as string,
        }

        const validation = createLeadSchema.safeParse(rawData)
        if (!validation.success) {
            return { error: validation.error.issues[0].message }
        }

        const validData = validation.data

        // Calculate initial score (0-100)
        const score = calculateLeadScore({
            budgetRange: validData.budgetRange,
            eventDate: validData.eventDate,
            source: validData.source,
        })

        // Insert into database
        const { data, error } = await supabase
            .from('clients')
            .insert({
                planner_id: user.id,
                name: validData.name,
                email: validData.email || null,
                phone: validData.phone,
                event_type: validData.eventType,
                event_date: validData.eventDate || null,
                budget_range: validData.budgetRange || null,
                source: validData.source || 'other',
                status: 'prospect',
                score: score,
                notes: validData.notes || null,
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating lead:', error)
            return { error: 'Failed to create lead' }
        }

        revalidatePath('/planner/leads')
        return { data: data as Lead, success: true }
    } catch (error) {
        console.error('Unexpected error in createLead:', error)
        return { error: 'An unexpected error occurred' }
    }
}

/**
 * Update an existing lead
 */
export async function updateLead(formData: FormData) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return { error: 'Unauthorized' }
        }

        const rawData = {
            id: formData.get('id') as string,
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            eventType: formData.get('eventType') as string,
            eventDate: formData.get('eventDate') as string,
            budgetRange: formData.get('budgetRange') as string,
            source: formData.get('source') as string,
            notes: formData.get('notes') as string,
        }

        const validation = updateLeadSchema.safeParse(rawData)
        if (!validation.success) {
            return { error: validation.error.issues[0].message }
        }

        const { id, ...updateData } = validation.data

        // Recalculate score
        const score = calculateLeadScore({
            budgetRange: updateData.budgetRange,
            eventDate: updateData.eventDate,
            source: updateData.source,
        })

        const { data, error } = await supabase
            .from('clients')
            .update({
                ...updateData,
                event_type: updateData.eventType,
                event_date: updateData.eventDate || null,
                budget_range: updateData.budgetRange || null,
                score: score,
            })
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error updating lead:', error)
            return { error: 'Failed to update lead' }
        }

        revalidatePath('/planner/leads')
        return { data: data as Lead, success: true }
    } catch (error) {
        console.error('Unexpected error in updateLead:', error)
        return { error: 'An unexpected error occurred' }
    }
}

/**
 * Delete a lead
 */
export async function deleteLead(id: string) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return { error: 'Unauthorized' }
        }

        const { error } = await supabase
            .from('clients')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting lead:', error)
            return { error: 'Failed to delete lead' }
        }

        revalidatePath('/planner/leads')
        return { success: true }
    } catch (error) {
        console.error('Unexpected error in deleteLead:', error)
        return { error: 'An unexpected error occurred' }
    }
}

/**
 * Convert lead to event
 */
export async function convertLeadToEvent(leadId: string) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return { error: 'Unauthorized' }
        }

        // Get lead details
        const { data: lead, error: leadError } = await supabase
            .from('clients')
            .select('*')
            .eq('id', leadId)
            .single()

        if (leadError || !lead) {
            return { error: 'Lead not found' }
        }

        // Create event from lead
        const { data: event, error: eventError } = await supabase
            .from('events')
            .insert({
                planner_id: user.id,
                name: `${lead.name}'s ${lead.event_type}`,
                type: lead.event_type.toLowerCase(),
                event_category: lead.event_type.toLowerCase(),
                date: lead.event_date || null,
                status: 'planning',
            })
            .select()
            .single()

        if (eventError) {
            console.error('Error creating event:', eventError)
            return { error: 'Failed to create event' }
        }

        // Update lead status to 'active' (converted)
        await supabase
            .from('clients')
            .update({ status: 'active' })
            .eq('id', leadId)

        revalidatePath('/planner/leads')
        revalidatePath('/planner/events')

        return { data: event, success: true }
    } catch (error) {
        console.error('Unexpected error in convertLeadToEvent:', error)
        return { error: 'An unexpected error occurred' }
    }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate lead score (0-100) based on various factors
 */
function calculateLeadScore(params: {
    budgetRange?: string;
    eventDate?: string;
    source?: string;
}): number {
    let score = 50; // Base score

    // Budget factor (+30 points max)
    if (params.budgetRange) {
        const budgetValue = parseBudgetRange(params.budgetRange);
        if (budgetValue > 500000) score += 30;
        else if (budgetValue > 200000) score += 20;
        else if (budgetValue > 100000) score += 10;
    }

    // Date urgency factor (+20 points max)
    if (params.eventDate) {
        const daysUntilEvent = Math.floor(
            (new Date(params.eventDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        if (daysUntilEvent < 30) score += 20; // Very urgent
        else if (daysUntilEvent < 90) score += 15;
        else if (daysUntilEvent < 180) score += 10;
    }

    // Source factor (+10 points max)
    if (params.source === 'referral') score += 10;
    else if (params.source === 'website') score += 5;

    return Math.min(100, Math.max(0, score));
}

function parseBudgetRange(range: string): number {
    // Extract numbers from strings like "1-2 lakhs", "5-10 lakhs", etc.
    const match = range.match(/(\d+)/);
    return match ? parseInt(match[0]) * 100000 : 0;
}
