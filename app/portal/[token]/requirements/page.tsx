import { getEventByClientToken } from '@/actions/client-portal'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RequirementsClient } from './requirements-client'

export default async function RequirementsPage({
    params,
}: {
    params: Promise<{ token: string }>
}) {
    const { token } = await params

    const eventResult = await getEventByClientToken(token)
    if (eventResult.error || !eventResult.data) {
        notFound()
    }

    // Get event requirements (from intakes or event_specs)
    const supabase = await createClient()
    const { data: specs } = await supabase
        .from('event_specs')
        .select('*')
        .eq('event_id', eventResult.data.id)
        .maybeSingle()

    // Also get intake data if available
    const { data: intake } = await supabase
        .from('intakes')
        .select('requirements')
        .eq('event_id', eventResult.data.id)
        .maybeSingle()

    return (
        <RequirementsClient
            event={eventResult.data}
            specs={specs}
            intake={intake}
        />
    )
}
