/**
 * BudgetRepository
 * 
 * Data access for BudgetItem entities.
 */

import { BaseRepository } from './BaseRepository';
import { BudgetItem, BudgetItemRow, BudgetCategory } from '../entities';

export class BudgetRepository extends BaseRepository<BudgetItem, BudgetItemRow> {
    protected tableName = 'budget_items';
    protected entityName = 'BudgetItem';

    protected toEntity(row: BudgetItemRow): BudgetItem {
        return BudgetItem.fromRow(row);
    }

    protected toRow(entity: Partial<BudgetItem>): Partial<BudgetItemRow> {
        if (entity instanceof BudgetItem) {
            return entity.toRow();
        }
        return entity as unknown as Partial<BudgetItemRow>;
    }

    /**
     * Get budget items by event
     */
    async getByEvent(eventId: string): Promise<BudgetItem[]> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('event_id', eventId)
            .order('category');

        if (error) throw error;
        return (data || []).map(row => this.toEntity(row as BudgetItemRow));
    }

    /**
     * Get budget items by function
     */
    async getByFunction(functionId: string): Promise<BudgetItem[]> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('function_id', functionId)
            .order('category');

        if (error) throw error;
        return (data || []).map(row => this.toEntity(row as BudgetItemRow));
    }

    /**
     * Get by category
     */
    async getByCategory(eventId: string, category: BudgetCategory): Promise<BudgetItem[]> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('event_id', eventId)
            .eq('category', category);

        if (error) throw error;
        return (data || []).map(row => this.toEntity(row as BudgetItemRow));
    }

    /**
     * Get over-budget items
     */
    async getOverBudget(eventId: string): Promise<BudgetItem[]> {
        const items = await this.getByEvent(eventId);
        return items.filter(item => item.isOverBudget());
    }

    /**
     * Get summary by category
     */
    async getSummaryByCategory(eventId: string): Promise<Record<BudgetCategory, {
        estimated: number;
        actual: number;
        paid: number;
    }>> {
        const items = await this.getByEvent(eventId);
        const summary: Record<string, { estimated: number; actual: number; paid: number }> = {};

        for (const item of items) {
            if (!summary[item.category]) {
                summary[item.category] = { estimated: 0, actual: 0, paid: 0 };
            }
            summary[item.category].estimated += item.estimatedAmount;
            summary[item.category].actual += item.actualAmount ?? 0;
            summary[item.category].paid += item.paidAmount;
        }

        return summary as Record<BudgetCategory, { estimated: number; actual: number; paid: number }>;
    }

    /**
     * Get totals
     */
    async getTotals(eventId: string): Promise<{
        totalEstimated: number;
        totalActual: number;
        totalPaid: number;
        remaining: number;
    }> {
        const items = await this.getByEvent(eventId);

        let totalEstimated = 0;
        let totalActual = 0;
        let totalPaid = 0;

        for (const item of items) {
            totalEstimated += item.estimatedAmount;
            totalActual += item.actualAmount ?? item.estimatedAmount;
            totalPaid += item.paidAmount;
        }

        return {
            totalEstimated,
            totalActual,
            totalPaid,
            remaining: totalActual - totalPaid,
        };
    }
}
