/**
 * Supabase Auth Utilities
 * 
 * Client-side auth utilities for browser components.
 */

import { createBrowserClient } from '@supabase/ssr'

export function createBrowserSupabaseClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}

// Export types
export type UserRole = 'planner' | 'vendor' | 'admin'

export interface UserProfile {
    id: string
    role: UserRole
    display_name: string | null
    avatar_url: string | null
    phone: string | null
    email_verified: boolean
    onboarding_completed: boolean
    created_at: string
    updated_at: string
}

export interface PlannerProfile {
    id: string
    company_name: string
    company_logo: string | null
    phone: string | null
    city: string | null
    state: string | null
    experience_years: number
    bio: string | null
    subscription_plan: 'free' | 'professional' | 'business' | 'enterprise'
    total_events: number
    active_events: number
}

export interface VendorProfileExtended {
    id: string
    user_id: string | null
    verified: boolean
    verification_date: string | null
    onboarding_completed: boolean
}
