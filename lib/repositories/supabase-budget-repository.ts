/**
 * Supabase Budget Repository
 * 
 * Production-ready budget repository backed by Supabase.
 */

import { SupabaseBaseRepository } from './supabase-base-repository'
import type { BudgetAllocation, BudgetCategoryType, ActionResult } from '@/types/domain'

class SupabaseBudgetRepositoryClass extends SupabaseBaseRepository<BudgetAllocation> {
    protected tableName = 'budget_items'
    protected entityName = 'budget'

    /**
     * Find budget allocations by event ID
     */
    async findByEventId(eventId: string): Promise<BudgetAllocation[]> {
        const supabase = await this.getClient()

        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('event_id', eventId)
            .order('category', { ascending: true })

        if (error) return []
        return this.fromDbArray(data || [])
    }

    /**
     * Find budget allocation by event and category
     */
    async findByEventAndCategory(eventId: string, category: BudgetCategoryType): Promise<BudgetAllocation | null> {
        const supabase = await this.getClient()

        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('event_id', eventId)
            .eq('category', category)
            .single()

        if (error || !data) return null
        return this.fromDb(data)
    }

    /**
     * Get budget summary for an event
     */
    async getSummary(eventId: string): Promise<{
        totalAllocated: number
        totalSpent: number
        remaining: number
        categories: BudgetAllocation[]
    }> {
        const allocations = await this.findByEventId(eventId)

        const totalAllocated = allocations.reduce((sum, a) => sum + (a.allocatedAmount || 0), 0)
        const totalSpent = allocations.reduce((sum, a) => sum + (a.spentAmount || 0), 0)

        return {
            totalAllocated,
            totalSpent,
            remaining: totalAllocated - totalSpent,
            categories: allocations,
        }
    }

    /**
     * Update spent amount
     */
    async updateSpent(id: string, amount: number): Promise<ActionResult<BudgetAllocation>> {
        const current = await this.findById(id)
        if (!current) {
            return { success: false, error: 'Budget item not found', code: 'NOT_FOUND' }
        }

        const newSpent = (current.spentAmount || 0) + amount
        let status: 'under' | 'on_track' | 'warning' | 'over' = 'under'

        const percentUsed = (newSpent / current.allocatedAmount) * 100
        if (percentUsed >= 100) status = 'over'
        else if (percentUsed >= 90) status = 'warning'
        else if (percentUsed >= 50) status = 'on_track'

        return this.update(id, {
            spentAmount: newSpent,
            status,
        } as Partial<BudgetAllocation>)
    }
}

// Export singleton instance
export const supabaseBudgetRepository = new SupabaseBudgetRepositoryClass()
