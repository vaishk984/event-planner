export const APP_NAME = 'PlannerOS'
export const APP_DESCRIPTION = 'Professional Event Planning Platform'

// Event Types
export const EVENT_TYPES = [
    { value: 'wedding', label: 'Wedding' },
    { value: 'birthday', label: 'Birthday' },
    { value: 'corporate', label: 'Corporate Event' },
    { value: 'anniversary', label: 'Anniversary' },
    { value: 'other', label: 'Other' },
] as const

// Lead Sources
export const LEAD_SOURCES = [
    { value: 'website', label: 'Website' },
    { value: 'referral', label: 'Referral' },
    { value: 'social_media', label: 'Social Media' },
    { value: 'event', label: 'Event' },
    { value: 'other', label: 'Other' },
] as const

// Lead Status
export const LEAD_STATUSES = [
    { value: 'new', label: 'New', color: 'blue' },
    { value: 'contacted', label: 'Contacted', color: 'yellow' },
    { value: 'qualified', label: 'Qualified', color: 'green' },
    { value: 'converted', label: 'Converted', color: 'purple' },
    { value: 'lost', label: 'Lost', color: 'red' },
] as const

// Event Status
export const EVENT_STATUSES = [
    { value: 'draft', label: 'Draft', color: 'gray' },
    { value: 'planned', label: 'Planned', color: 'blue' },
    { value: 'live', label: 'Live', color: 'green' },
    { value: 'completed', label: 'Completed', color: 'purple' },
    { value: 'cancelled', label: 'Cancelled', color: 'red' },
    { value: 'archived', label: 'Archived', color: 'gray' },
] as const

// Task Status
export const TASK_STATUSES = [
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'accepted', label: 'Accepted', color: 'blue' },
    { value: 'rejected', label: 'Rejected', color: 'red' },
    { value: 'in_progress', label: 'In Progress', color: 'orange' },
    { value: 'completed', label: 'Completed', color: 'green' },
    { value: 'verified', label: 'Verified', color: 'purple' },
] as const

// Package Types
export const PACKAGE_TYPES = [
    { value: 'good', label: 'Good', description: 'Essential package' },
    { value: 'better', label: 'Better', description: 'Enhanced package' },
    { value: 'best', label: 'Best', description: 'Premium package' },
    { value: 'custom', label: 'Custom', description: 'Fully customized' },
] as const

// Priority Levels
export const PRIORITY_LEVELS = [
    { value: 'low', label: 'Low', color: 'gray' },
    { value: 'medium', label: 'Medium', color: 'yellow' },
    { value: 'high', label: 'High', color: 'red' },
] as const
