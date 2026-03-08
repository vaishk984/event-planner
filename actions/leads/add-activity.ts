'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function addActivity(formData: FormData) {
    const supabase = await createClient()

    const leadId = formData.get('leadId') as string
    const activityType = formData.get('activityType') as string
    const description = formData.get('description') as string

    const { error } = await supabase
        .from('lead_activities')
        .insert({
            lead_id: leadId,
            activity_type: activityType,
            description,
        })

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/planner/leads/${leadId}`)
    return { success: true }
}
