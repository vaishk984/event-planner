export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
export type LeadSource = 'website' | 'referral' | 'social_media' | 'event' | 'other'

export interface Lead {
    id: string
    planner_id: string
    name: string
    email: string
    phone?: string
    event_type: string
    budget_range?: string
    event_date?: string
    source: LeadSource
    score: number
    status: LeadStatus
    created_at: string
    updated_at: string
}

export interface LeadActivity {
    id: string
    lead_id: string
    activity_type: string
    notes?: string
    created_at: string
}

export interface CreateLeadInput {
    name: string
    email: string
    phone?: string
    event_type: string
    budget_range?: string
    event_date?: string
    source: LeadSource
}
