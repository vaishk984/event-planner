import { TaskPriority, TaskStatus } from "@/lib/types/task"

export interface TaskTemplate {
    title: string
    description: string
    defaultPriority: TaskPriority
    daysOffset: number // Days before event
    tags: string[]
    assigneeRole: 'Planner' | 'Client' | 'Vendor'
}

export const EVENT_TEMPLATES: Record<string, TaskTemplate[]> = {
    'Wedding': [
        {
            title: 'Book Venue',
            description: 'Shortlist and finalize the primary venue for the wedding.',
            defaultPriority: 'urgent',
            daysOffset: 180,
            tags: ['Venue', 'Key Milestone'],
            assigneeRole: 'Planner'
        },
        {
            title: 'Send Save the Dates',
            description: 'Design and dispatch initial invite teasers.',
            defaultPriority: 'high',
            daysOffset: 120,
            tags: ['Communication', 'Design'],
            assigneeRole: 'Client'
        },
        {
            title: 'Finalize Catering Menu',
            description: 'Tasting session and final menu selection.',
            defaultPriority: 'medium',
            daysOffset: 60,
            tags: ['Catering', 'F&B'],
            assigneeRole: 'Planner'
        },
        {
            title: 'Book Photographer',
            description: 'Secure booking for lead photographer and videographer.',
            defaultPriority: 'high',
            daysOffset: 90,
            tags: ['Vendor', 'Photography'],
            assigneeRole: 'Planner'
        }
    ],
    'Corporate': [
        {
            title: 'Confirm Guest Speakers',
            description: 'Send formal invites and get confirmation from keynote speakers.',
            defaultPriority: 'urgent',
            daysOffset: 45,
            tags: ['Logistics', 'Content'],
            assigneeRole: 'Planner'
        },
        {
            title: 'Setup AV Requirements',
            description: 'Coordinate with technical team for mics, screens, and projectors.',
            defaultPriority: 'high',
            daysOffset: 15,
            tags: ['Production', 'AV'],
            assigneeRole: 'Planner'
        }
    ]
}
