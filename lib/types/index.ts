export * from './database'
export * from './lead'
export * from './event'
export * from './package'
export * from './vendor'

// Common types
export type UserRole = 'planner' | 'client' | 'vendor'

export interface User {
    id: string
    email: string
    role: UserRole
    created_at: string
}

export interface UserProfile {
    id: string
    role_id: string
    phone?: string
    address?: string
    company_name?: string
    image_url?: string
    created_at: string
    updated_at: string
}
