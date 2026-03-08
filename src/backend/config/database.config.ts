/**
 * Database Configuration
 * 
 * Supabase database configuration and client setup.
 */

export const DatabaseConfig = {
    supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    },

    // Connection pool settings (for future use)
    pool: {
        min: 2,
        max: 10,
        idleTimeoutMs: 30000,
    },

    // Table names (centralized for consistency)
    tables: {
        users: 'user_profiles',
        events: 'events',
        eventFunctions: 'event_functions',
        vendors: 'vendors',
        leads: 'leads',
        tasks: 'event_tasks',
        timelineItems: 'timeline_items',
        invoices: 'invoices',
        proposals: 'packages',
        services: 'services',
        notifications: 'notifications',
    },
} as const;
