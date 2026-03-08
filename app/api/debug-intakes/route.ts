import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser()

    // 2. Query recent intakes raw
    const { data: rawIntakes, error } = await supabase
        .from('event_intakes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

    return NextResponse.json({
        currentUser: user?.id || 'null',
        queryError: error,
        recentIntakes: rawIntakes?.map(i => ({
            id: i.id,
            planner_id: i.planner_id,
            client_name: i.client_name,
            requirements_client_name: i.requirements?.clientName,
            status: i.status,
            created_at: i.created_at
        }))
    })
}
