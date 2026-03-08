/**
 * BudgetService
 * 
 * Business logic for budget management.
 */

import { BudgetItem, BudgetCategory } from '../entities';
import { BudgetRepository } from '../repositories';
import { CreateBudgetItemDto, UpdateBudgetItemDto } from '../dto/request';
import { NotFoundException } from '../exceptions';

export interface BudgetSummary {
    totalEstimated: number;
    totalActual: number;
    totalPaid: number;
    remaining: number;
    byCategory: Record<BudgetCategory, {
        estimated: number;
        actual: number;
        paid: number;
    }>;
    overBudgetItems: BudgetItem[];
}

export class BudgetService {
    private repository: BudgetRepository;

    constructor(repository?: BudgetRepository) {
        this.repository = repository || new BudgetRepository();
    }

    /**
     * Get budget item by ID
     */
    async getById(id: string): Promise<BudgetItem> {
        const item = await this.repository.findById(id);
        if (!item) throw new NotFoundException('BudgetItem', id);
        return item;
    }

    /**
     * Get all budget items for event
     */
    async getByEvent(eventId: string): Promise<BudgetItem[]> {
        return this.repository.getByEvent(eventId);
    }

    /**
     * Get budget items by function
     */
    async getByFunction(functionId: string): Promise<BudgetItem[]> {
        return this.repository.getByFunction(functionId);
    }

    /**
     * Get budget items by category
     */
    async getByCategory(eventId: string, category: BudgetCategory): Promise<BudgetItem[]> {
        return this.repository.getByCategory(eventId, category);
    }

    /**
     * Create a budget item
     */
    async create(dto: CreateBudgetItemDto): Promise<BudgetItem> {
        const item = new BudgetItem({
            id: crypto.randomUUID(),
            eventId: dto.eventId,
            functionId: dto.functionId || null,
            category: dto.category as BudgetCategory,
            description: dto.description,
            vendorId: dto.vendorId || null,
            bookingRequestId: dto.bookingRequestId || null,
            estimatedAmount: dto.estimatedAmount,
            actualAmount: dto.actualAmount || null,
            paidAmount: 0,
            currency: dto.currency || 'INR',
            notes: dto.notes || null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return this.repository.create(item);
    }

    /**
     * Update a budget item
     */
    async update(id: string, dto: UpdateBudgetItemDto): Promise<BudgetItem> {
        const item = await this.getById(id);

        if (dto.description !== undefined) item.description = dto.description;
        if (dto.estimatedAmount !== undefined) item.estimatedAmount = dto.estimatedAmount;
        if (dto.actualAmount !== undefined) item.actualAmount = dto.actualAmount;
        if (dto.paidAmount !== undefined) item.paidAmount = dto.paidAmount;
        if (dto.vendorId !== undefined) item.vendorId = dto.vendorId;
        if (dto.bookingRequestId !== undefined) item.bookingRequestId = dto.bookingRequestId;
        if (dto.notes !== undefined) item.notes = dto.notes;

        return this.repository.update(id, item);
    }

    /**
     * Add payment to budget item
     */
    async addPayment(id: string, amount: number): Promise<BudgetItem> {
        const item = await this.getById(id);
        item.addPayment(amount);
        return this.repository.update(id, item);
    }

    /**
     * Delete a budget item
     */
    async delete(id: string): Promise<void> {
        await this.getById(id);
        await this.repository.delete(id);
    }

    /**
     * Get complete budget summary
     */
    async getSummary(eventId: string): Promise<BudgetSummary> {
        const totals = await this.repository.getTotals(eventId);
        const byCategory = await this.repository.getSummaryByCategory(eventId);
        const overBudgetItems = await this.repository.getOverBudget(eventId);

        return {
            ...totals,
            byCategory,
            overBudgetItems,
        };
    }

    /**
     * Get over-budget items
     */
    async getOverBudget(eventId: string): Promise<BudgetItem[]> {
        return this.repository.getOverBudget(eventId);
    }

    /**
     * Get recommended budget split
     */
    getRecommendedSplit(totalBudget: number): Record<BudgetCategory, { min: number; max: number }> {
        const result: Record<string, { min: number; max: number }> = {};

        for (const [category, percentages] of Object.entries(BudgetItem.RECOMMENDED_SPLITS)) {
            result[category] = {
                min: Math.round(totalBudget * (percentages.min / 100)),
                max: Math.round(totalBudget * (percentages.max / 100)),
            };
        }

        return result as Record<BudgetCategory, { min: number; max: number }>;
    }

    /**
     * Get all budget categories
     */
    getCategories(): Array<{ value: BudgetCategory; label: string }> {
        return [
            { value: 'venue', label: 'Venue & Infrastructure' },
            { value: 'catering', label: 'Food & Beverage' },
            { value: 'decoration', label: 'Decoration & Design' },
            { value: 'photography', label: 'Photography & Video' },
            { value: 'entertainment', label: 'Entertainment' },
            { value: 'attire', label: 'Attire & Jewelry' },
            { value: 'makeup', label: 'Makeup & Hair' },
            { value: 'transport', label: 'Transport & Logistics' },
            { value: 'invitations', label: 'Invitations & Stationery' },
            { value: 'gifts', label: 'Gifts & Favors' },
            { value: 'miscellaneous', label: 'Miscellaneous' },
        ];
    }
}

// Singleton instance
export const budgetService = new BudgetService();
