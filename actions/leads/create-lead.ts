'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getUserId } from '@/lib/session'
import { calculateLeadScore } from '@/lib/services/lead-scoring'

interface CreateLeadInput {
    name: string
    email: string
    phone?: string
    eventType: string
    eventDate?: string
    budget?: number
    guestCount?: number
    source: string
    notes?: string
}

export async function createLead(formData: FormData) {
    // Get current user ID
    const userId = await getUserId()

    if (!userId) {
        return { error: 'Not authenticated' }
    }

    // Extract form data
    const input: CreateLeadInput = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string || undefined,
        eventType: formData.get('eventType') as string,
        eventDate: formData.get('eventDate') as string || undefined,
        budget: formData.get('budget') ? Number(formData.get('budget')) : undefined,
        guestCount: formData.get('guestCount') ? Number(formData.get('guestCount')) : undefined,
        source: formData.get('source') as string,
        notes: formData.get('notes') as string || undefined,
    }

    // Calculate lead score
    const score = calculateLeadScore({
        budget: input.budget,
        eventDate: input.eventDate,
        guestCount: input.guestCount,
        source: input.source,
        hasEngaged: false, // New lead
    })

    console.log('🚀 CREATE LEAD (MOCK):', {
        userId,
        ...input,
        score
    })

    // TODO: Re-enable Supabase insert later
    /*
    const supabase = await createClient()
    const { data: lead, error } = await supabase
        .from('leads')
        .insert({ ... })
    */

    revalidatePath('/planner/leads')
    redirect('/planner/leads')
}
