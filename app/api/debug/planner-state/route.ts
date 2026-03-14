import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'

export async function GET() {
    const session = await getSession()

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    const userId = session.userId

    const [
        profileResult,
        eventsResult,
        intakesResult,
    ] = await Promise.all([
        supabase
            .from('user_profiles')
            .select('id, role, display_name')
            .eq('id', userId)
            .maybeSingle(),
        supabase
            .from('events')
            .select('id', { count: 'exact', head: true })
            .eq('planner_id', userId),
        supabase
            .from('event_intakes')
            .select('id', { count: 'exact', head: true })
            .eq('planner_id', userId),
    ])

    const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
        ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host
        : null

    return NextResponse.json({
        userId,
        email: session.email,
        role: session.role,
        displayName: session.displayName,
        supabaseHost,
        profile: profileResult.data,
        counts: {
            events: eventsResult.count || 0,
            intakes: intakesResult.count || 0,
        },
        errors: {
            profile: profileResult.error?.message || null,
            events: eventsResult.error?.message || null,
            intakes: intakesResult.error?.message || null,
        },
    })
}
