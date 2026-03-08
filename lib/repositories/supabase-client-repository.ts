/**
 * Supabase Client Repository
 * 
 * Production-ready client CRM repository backed by Supabase.
 */

import { SupabaseBaseRepository } from './supabase-base-repository'
import type { ActionResult } from '@/types/domain'

// Client interface
export interface Client {
    id: string
    plannerId: string

    // Basic info
    name: string
    email?: string
    phone: string

    // Additional info
    address?: string
    city?: string
    notes?: string

    // Relationship
    source?: string // How they found you
    referredBy?: string
    tags?: string[]

    // Stats (computed)
    totalEvents?: number
    totalSpend?: number
    lastEventDate?: string

    // Status
    status: 'active' | 'inactive' | 'vip'

    // Preferences
    preferences?: Record<string, any>

    // Timestamps
    createdAt: string
    updatedAt: string
}

class SupabaseClientRepositoryClass extends SupabaseBaseRepository<Client> {
    protected tableName = 'clients'
    protected entityName = 'client'

    /**
     * Find clients by planner ID
     */
    async findByPlannerId(plannerId: string): Promise<Client[]> {
        const supabase = await this.getClient()

        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('planner_id', plannerId)
            .order('name', { ascending: true })

        if (error) return []
        return this.fromDbArray(data || [])
    }

    /**
     * Search clients
     */
    async search(query: string, plannerId: string): Promise<Client[]> {
        const supabase = await this.getClient()

        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('planner_id', plannerId)
            .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
            .order('name', { ascending: true })
            .limit(20)

        if (error) return []
        return this.fromDbArray(data || [])
    }

    /**
     * Find VIP clients
     */
    async findVip(plannerId: string): Promise<Client[]> {
        const supabase = await this.getClient()

        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('planner_id', plannerId)
            .eq('status', 'vip')
            .order('total_spend', { ascending: false })

        if (error) return []
        return this.fromDbArray(data || [])
    }

    /**
     * Find by phone (duplicate detection)
     */
    async findByPhone(phone: string): Promise<Client | null> {
        const supabase = await this.getClient()

        // Normalize phone number
        const normalized = phone.replace(/\D/g, '').slice(-10)

        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .ilike('phone', `%${normalized}%`)
            .limit(1)
            .single()

        if (error || !data) return null
        return this.fromDb(data)
    }

    /**
     * Get client statistics for a planner
     */
    async getStats(plannerId: string): Promise<{
        total: number
        active: number
        vip: number
        totalRevenue: number
    }> {
        const supabase = await this.getClient()

        const { data, error } = await supabase
            .from(this.tableName)
            .select('status, total_spend')
            .eq('planner_id', plannerId)

        if (error || !data) {
            return { total: 0, active: 0, vip: 0, totalRevenue: 0 }
        }

        return {
            total: data.length,
            active: data.filter((c: any) => c.status === 'active').length,
            vip: data.filter((c: any) => c.status === 'vip').length,
            totalRevenue: data.reduce((sum: number, c: any) => sum + (c.total_spend || 0), 0),
        }
    }
}

// Export singleton instance
export const supabaseClientRepository = new SupabaseClientRepositoryClass()
