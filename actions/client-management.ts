'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function generateClientToken(eventId: string) {
    const supabase = await createClient()

    // Check if token exists first? 
    // Just simple update with gen_random_uuid() or similar? 
    // Supabase can generate UUID, or we generate in JS.
    // JS randomUUID is safer for logic control.

    const token = crypto.randomUUID()

    const { error } = await supabase
        .from('events')
        .update({ public_token: token, proposal_status: 'sent' })
        .eq('id', eventId)

    if (error) {
        console.error('generateClientToken error:', error)
        return { error: 'Failed to generate access token' }
    }

    revalidatePath(`/planner/events/${eventId}/client`)
    return { success: true, token }
}

export async function getClientAccessDetails(eventId: string) {
    const supabase = await createClient()

    const { data: event, error } = await supabase
        .from('events')
        .select('public_token, proposal_status, name, final_proposal_token, client_feedback')
        .eq('id', eventId)
        .single()

    if (error) {
        return { error: 'Failed to details' }
    }

    return { data: event }
}
