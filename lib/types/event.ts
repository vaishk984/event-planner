export type EventStatus = 'draft' | 'planned' | 'live' | 'completed' | 'cancelled' | 'archived'
export type EventType = 'wedding' | 'birthday' | 'corporate' | 'anniversary' | 'other'

export interface Event {
    id: string
    planner_id: string
    client_id?: string
    venue_id?: string
    type: EventType
    date: string
    guest_count?: number
    budget?: number
    status: EventStatus
    created_at: string
    updated_at: string
}

export interface EventRequirement {
    id: string
    event_id: string
    type: string
    description?: string
    priority: 'low' | 'medium' | 'high'
    created_at: string
}

export interface EventConcept {
    id: string
    event_id: string
    theme?: string
    vision_desc?: string
    moodboard_url?: string
    created_at: string
}

export interface CreateEventInput {
    type: EventType
    date: string
    guest_count?: number
    budget?: number
}
