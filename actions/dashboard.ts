import { createClient } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/session'
import { DashboardData, DashboardLead, DashboardTask, DashboardVendor, TodayEvent } from '@/types/dashboard'
import { endOfDay, formatDistanceToNow, startOfDay } from 'date-fns'

function createEmptyDashboardData(name = 'Planner'): DashboardData {
    return {
        stats: {
            activeEvents: 0,
            activeEventsChange: 0,
            openLeads: 0,
            openLeadsChange: 0,
            revenue: 0,
            revenueChange: 0,
            pendingPayments: 0,
            overduePayments: 0,
        },
        todayEvents: [],
        leads: [],
        tasks: [],
        vendors: [],
        user: {
            name,
            date: new Date().toLocaleDateString('en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            }),
        },
    }
}

function formatSupabaseError(error: unknown): string | null {
    if (!error || typeof error !== 'object') {
        return null
    }

    const maybeError = error as {
        code?: string
        message?: string
        details?: string
    }

    const parts = [maybeError.code, maybeError.message, maybeError.details].filter(Boolean)
    return parts.length > 0 ? parts.join(' | ') : 'Unknown Supabase error'
}

export async function getDashboardData(): Promise<DashboardData> {
    try {
        const supabase = await createClient()
        const user = await getAuthenticatedUser()

        if (!user) {
            return createEmptyDashboardData()
        }

        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('display_name')
            .eq('id', user.id)
            .maybeSingle()

        const displayName = profile?.display_name || user.email || 'Planner'

        if (profileError && process.env.NODE_ENV === 'development') {
            console.warn('Dashboard profile unavailable:', formatSupabaseError(profileError))
        }

        const [
            eventsResult,
            leadsResult,
            paymentsResult,
            pendingPaymentsResult,
            todayEventsResult,
            recentLeadsResult,
            urgentTasksResult,
        ] = await Promise.all([
            supabase.from('events')
                .select('id', { count: 'exact' })
                .eq('planner_id', user.id)
                .neq('status', 'completed'),

            supabase.from('clients')
                .select('id', { count: 'exact' })
                .eq('planner_id', user.id)
                .eq('status', 'prospect'),

            supabase.from('financial_payments')
                .select('amount, events!inner(planner_id)')
                .eq('events.planner_id', user.id)
                .eq('status', 'completed')
                .eq('type', 'client_payment'),

            supabase.from('financial_payments')
                .select('amount, events!inner(planner_id)')
                .eq('events.planner_id', user.id)
                .eq('status', 'pending')
                .eq('type', 'client_payment'),

            supabase.from('event_functions')
                .select('id, name, start_time, type, events!inner(planner_id)')
                .eq('events.planner_id', user.id)
                .gte('date', startOfDay(new Date()).toISOString())
                .lte('date', endOfDay(new Date()).toISOString()),

            supabase.from('clients')
                .select('*')
                .eq('planner_id', user.id)
                .eq('status', 'prospect')
                .order('created_at', { ascending: false })
                .limit(5),

            supabase.from('tasks')
                .select('id, title, due_date, events!inner(name, planner_id)')
                .eq('events.planner_id', user.id)
                .neq('status', 'completed')
                .lt('due_date', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())
                .limit(5),
        ])

        const criticalErrors = [
            ['events', eventsResult.error],
            ['leads', leadsResult.error],
            ['recentLeads', recentLeadsResult.error],
        ].flatMap(([label, error]) => {
            const formatted = formatSupabaseError(error)
            return formatted ? [`${label}: ${formatted}`] : []
        })

        if (criticalErrors.length > 0 && process.env.NODE_ENV === 'development') {
            console.warn('Dashboard core data partially unavailable:', criticalErrors)
        }

        const revenue = paymentsResult.data?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0
        const pendingRevenue = pendingPaymentsResult.data?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0

        const todayEvents: TodayEvent[] = (todayEventsResult.data || []).map(event => ({
            id: event.id,
            name: event.name,
            time: event.start_time || 'All Day',
            status: 'today',
        }))

        const leads: DashboardLead[] = (recentLeadsResult.data || []).map(lead => ({
            id: lead.id,
            name: lead.name,
            event: lead.event_type || 'General Usage',
            lastContact: lead.updated_at ? `${formatDistanceToNow(new Date(lead.updated_at))} ago` : 'New',
            priority: (lead.score || 0) > 70 ? 'hot' : (lead.score || 0) > 40 ? 'warm' : 'cold',
            score: lead.score || 0,
        }))

        const tasks: DashboardTask[] = (urgentTasksResult.data || []).map(task => ({
            id: task.id,
            task: task.title,
            event: (task.events as { name?: string } | null)?.name || 'Unknown Event',
            dueDate: task.due_date,
            dueIn: task.due_date ? formatDistanceToNow(new Date(task.due_date), { addSuffix: true }) : 'ASAP',
        }))

        const vendors: DashboardVendor[] = []

        return {
            stats: {
                activeEvents: eventsResult.count || 0,
                activeEventsChange: 3,
                openLeads: leadsResult.count || 0,
                openLeadsChange: 5,
                revenue,
                revenueChange: 12,
                pendingPayments: pendingRevenue,
                overduePayments: 0,
            },
            todayEvents,
            leads,
            tasks,
            vendors,
            user: {
                name: displayName,
                date: createEmptyDashboardData().user.date,
            },
        }
    } catch (error) {
        console.error('Unexpected dashboard load error:', error)
        return createEmptyDashboardData()
    }
}
