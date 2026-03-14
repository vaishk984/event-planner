import { getUserId } from '@/lib/session';
import { createClient } from '@/lib/supabase/server';
import { Lead } from '@/actions/leads';
import { Task } from '@/actions/tasks';

function formatSupabaseError(error: unknown): string {
    if (!error || typeof error !== 'object') {
        return 'Unknown error'
    }

    const candidate = error as {
        code?: string
        message?: string
        details?: string
    }

    return [candidate.code, candidate.message, candidate.details]
        .filter(Boolean)
        .join(' | ') || 'Unknown error'
}

export async function getLeadsData(): Promise<{ data?: Lead[], error?: string }> {
    try {
        const supabase = await createClient();
        const plannerId = await getUserId();
        if (!plannerId) return { error: 'Unauthorized' };

        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('planner_id', plannerId)
            .eq('status', 'prospect')
            .order('score', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching leads:', formatSupabaseError(error));
            return { error: 'Failed to fetch leads' };
        }
        return { data: data as Lead[] };
    } catch (error) {
        console.error('Unexpected error in getLeads:', error);
        return { error: 'An unexpected error occurred' };
    }
}

export async function getTasksData(filters?: { eventId?: string; status?: string; priority?: string; }) {
    try {
        const supabase = await createClient();
        const plannerId = await getUserId();
        if (!plannerId) return { error: 'Unauthorized' };

        let query = supabase
            .from('tasks')
            .select('*, events!inner(name, planner_id), vendors(company_name)')
            .eq('events.planner_id', plannerId);

        if (filters?.eventId) {
            query = query.eq('event_id', filters.eventId);
        }
        if (filters?.status && filters.status !== 'all') {
            query = query.eq('status', filters.status);
        }
        if (filters?.priority && filters.priority !== 'all') {
            query = query.eq('priority', filters.priority);
        }

        const { data, error } = await query.order('due_date', { ascending: true });

        if (error) {
            console.error('Error fetching tasks:', formatSupabaseError(error));
            return { error: 'Failed to fetch tasks' };
        }
        return { data: data as Task[] };
    } catch (error) {
        console.error('Unexpected error in getTasks:', error);
        return { error: 'An unexpected error occurred' };
    }
}
