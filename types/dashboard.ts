export interface DashboardStats {
    activeEvents: number;
    activeEventsChange: number;
    openLeads: number;
    openLeadsChange: number;
    revenue: number;
    revenueChange: number;
    pendingPayments: number;
    overduePayments: number;
}

export interface TodayEvent {
    id: string;
    name: string;
    time: string;
    venue?: string;
    status: 'today' | 'upcoming';
}

export interface DashboardLead {
    id: string;
    name: string;
    event: string;
    lastContact?: string;
    priority: 'hot' | 'warm' | 'cold';
    score: number;
}

export interface DashboardTask {
    id: string;
    task: string;
    event: string;
    dueIn: string; // "2 hours", "-1 day"
    dueDate: string;
}

export interface DashboardVendor {
    id: string;
    vendor: string;
    event: string;
    awaiting: string;
}

export interface DashboardData {
    stats: DashboardStats;
    todayEvents: TodayEvent[];
    leads: DashboardLead[];
    tasks: DashboardTask[];
    vendors: DashboardVendor[];
    user: {
        name: string;
        date: string;
    };
}
