'use server'

import { createClient } from '@/lib/supabase/server'
import { DashboardData, DashboardLead, DashboardTask, DashboardVendor, TodayEvent } from '@/types/dashboard'
import { startOfDay, endOfDay, formatDistanceToNow } from 'date-fns'

export async function getDashboardData(): Promise<DashboardData> {
    const supabase = await createClient()

    // 1. Get User Info
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: profile } = await supabase
        .from('user_profiles')
        .select('display_name')
        .eq('id', user.id)
        .single()

    // 2. Fetch Stats (Parallel Queries)
    const [
        eventsResult,
        leadsResult,
        paymentsResult,
        tasksResult,
        todayEventsResult,
        recentLeadsResult,
        urgentTasksResult
    ] = await Promise.all([
        // Active Events Count
        supabase.from('events').select('id', { count: 'exact' }).neq('status', 'completed'),

        // Open Leads Count
        supabase.from('clients').select('id', { count: 'exact' }).eq('status', 'prospect'),

        // Revenue (Confirmed payments this month)
        supabase.from('financial_payments')
            .select('amount')
            .eq('status', 'completed')
            .eq('type', 'client_payment'),

        // Pending Payments (Invoices sent but not paid)
        supabase.from('financial_payments')
            .select('amount')
            .eq('status', 'pending')
            .eq('type', 'client_payment'),

        // Today's Events
        supabase.from('event_functions')
            .select('id, name, start_time, type')
            .gte('date', startOfDay(new Date()).toISOString())
            .lte('date', endOfDay(new Date()).toISOString()),

        // Recent Leads
        supabase.from('clients')
            .select('*')
            .eq('status', 'prospect')
            .order('created_at', { ascending: false })
            .limit(5),

        // Tasks at Risk (Overdue or due soon)
        supabase.from('tasks')
            .select('id, title, due_date, events(name)')
            .neq('status', 'completed')
            .lt('due_date', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()) // Due within 24h or overdue
            .limit(5)
    ])

    // Calculate Totals
    const revenue = paymentsResult.data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
    const pendingRevenue = tasksResult.data?.reduce((sum, p) => sum + 0, 0) || 0 // Fix logic if using correct table

    // Transform Events
    const todayEvents: TodayEvent[] = (todayEventsResult.data || []).map(e => ({
        id: e.id,
        name: e.name,
        time: e.start_time || 'All Day',
        status: 'today'
    }))

    // Transform Leads
    const leads: DashboardLead[] = (recentLeadsResult.data || []).map(l => ({
        id: l.id,
        name: l.name,
        event: l.event_type || 'General Usage',
        lastContact: l.updated_at ? formatDistanceToNow(new Date(l.updated_at)) + ' ago' : 'New',
        priority: (l.score || 0) > 70 ? 'hot' : (l.score || 0) > 40 ? 'warm' : 'cold',
        score: l.score || 0
    }))

    // Transform Tasks
    const tasks: DashboardTask[] = (urgentTasksResult.data || []).map(t => ({
        id: t.id,
        task: t.title,
        event: (t.events as any)?.name || 'Unknown Event',
        dueDate: t.due_date,
        dueIn: t.due_date ? formatDistanceToNow(new Date(t.due_date), { addSuffix: true }) : 'ASAP'
    }))

    // Vendors (Mock for now until logic defined)
    const vendors: DashboardVendor[] = []

    return {
        stats: {
            activeEvents: eventsResult.count || 0,
            activeEventsChange: 3, // Logic for historical diff required later
            openLeads: leadsResult.count || 0,
            openLeadsChange: 5,
            revenue: revenue,
            revenueChange: 12,
            pendingPayments: 0, // Need to fix Pending query above
            overduePayments: 0
        },
        todayEvents,
        leads,
        tasks,
        vendors,
        user: {
            name: profile?.display_name || 'Planner',
            date: new Date().toLocaleDateString('en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            })
        }
    }
}
