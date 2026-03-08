// Budget Store
// Manages category-wise budget allocations for events

import type {
    BudgetAllocation,
    BudgetCategoryType,
    BUDGET_CATEGORY_DEFAULTS
} from '@/types/domain'

// Re-export for convenience
export { BUDGET_CATEGORY_DEFAULTS } from '@/types/domain'

// In-memory store
let budgetAllocations: BudgetAllocation[] = []

// Get all allocations for an event
export function getBudgetForEvent(eventId: string): BudgetAllocation[] {
    return budgetAllocations.filter(b => b.eventId === eventId)
}

// Get allocation for specific category
export function getCategoryBudget(eventId: string, category: BudgetCategoryType): BudgetAllocation | undefined {
    return budgetAllocations.find(b => b.eventId === eventId && b.category === category)
}

// Initialize budget with default splits based on total budget
export function initializeBudget(eventId: string, totalBudget: number): BudgetAllocation[] {
    // Import defaults inline to avoid circular dependency issues
    const defaults: Record<BudgetCategoryType, { name: string; minPercent: number; maxPercent: number }> = {
        venue: { name: 'Venue & Infrastructure', minPercent: 20, maxPercent: 30 },
        food: { name: 'Food & Beverage', minPercent: 25, maxPercent: 35 },
        decor: { name: 'Decoration & Design', minPercent: 15, maxPercent: 25 },
        entertainment: { name: 'Entertainment', minPercent: 5, maxPercent: 10 },
        photography: { name: 'Photography & Video', minPercent: 5, maxPercent: 10 },
        bridal: { name: 'Bridal & Groom', minPercent: 3, maxPercent: 8 },
        logistics: { name: 'Logistics', minPercent: 3, maxPercent: 8 },
        guest: { name: 'Guest Experience', minPercent: 2, maxPercent: 5 },
        misc: { name: 'Miscellaneous', minPercent: 5, maxPercent: 10 },
    }

    const categories: BudgetCategoryType[] = [
        'venue', 'food', 'decor', 'entertainment',
        'photography', 'bridal', 'logistics', 'guest', 'misc'
    ]

    // Clear existing allocations for this event
    budgetAllocations = budgetAllocations.filter(b => b.eventId !== eventId)

    const newAllocations: BudgetAllocation[] = categories.map(category => {
        const config = defaults[category]
        // Use midpoint of range as default allocation
        const defaultPercent = (config.minPercent + config.maxPercent) / 2
        const allocatedAmount = Math.round(totalBudget * (defaultPercent / 100))

        return {
            id: `budget_${eventId}_${category}`,
            eventId,
            category,
            allocatedAmount,
            spentAmount: 0,
            allocatedPercent: defaultPercent,
            status: 'on_track' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
    })

    budgetAllocations.push(...newAllocations)
    return newAllocations
}

// Update allocation amount
export function updateAllocation(
    eventId: string,
    category: BudgetCategoryType,
    allocatedAmount: number,
    totalBudget: number
): BudgetAllocation | null {
    const index = budgetAllocations.findIndex(
        b => b.eventId === eventId && b.category === category
    )
    if (index === -1) return null

    const allocatedPercent = (allocatedAmount / totalBudget) * 100

    budgetAllocations[index] = {
        ...budgetAllocations[index],
        allocatedAmount,
        allocatedPercent,
        status: calculateStatus(allocatedPercent, category),
        updatedAt: new Date().toISOString(),
    }

    return budgetAllocations[index]
}

// Update spent amount
export function updateSpent(
    eventId: string,
    category: BudgetCategoryType,
    spentAmount: number
): BudgetAllocation | null {
    const index = budgetAllocations.findIndex(
        b => b.eventId === eventId && b.category === category
    )
    if (index === -1) return null

    const allocation = budgetAllocations[index]
    const spentPercent = (spentAmount / allocation.allocatedAmount) * 100

    let status: BudgetAllocation['status'] = 'on_track'
    if (spentPercent > 100) status = 'over'
    else if (spentPercent > 90) status = 'warning'
    else if (spentPercent < 50) status = 'under'

    budgetAllocations[index] = {
        ...allocation,
        spentAmount,
        status,
        updatedAt: new Date().toISOString(),
    }

    return budgetAllocations[index]
}

// Calculate status based on allocation vs industry standards
function calculateStatus(percent: number, category: BudgetCategoryType): BudgetAllocation['status'] {
    const defaults: Record<BudgetCategoryType, { minPercent: number; maxPercent: number }> = {
        venue: { minPercent: 20, maxPercent: 30 },
        food: { minPercent: 25, maxPercent: 35 },
        decor: { minPercent: 15, maxPercent: 25 },
        entertainment: { minPercent: 5, maxPercent: 10 },
        photography: { minPercent: 5, maxPercent: 10 },
        bridal: { minPercent: 3, maxPercent: 8 },
        logistics: { minPercent: 3, maxPercent: 8 },
        guest: { minPercent: 2, maxPercent: 5 },
        misc: { minPercent: 5, maxPercent: 10 },
    }

    const config = defaults[category]
    if (percent > config.maxPercent * 1.2) return 'over'
    if (percent > config.maxPercent) return 'warning'
    if (percent < config.minPercent * 0.5) return 'under'
    return 'on_track'
}

// Get budget summary
export function getBudgetSummary(eventId: string) {
    const allocations = getBudgetForEvent(eventId)

    const totalAllocated = allocations.reduce((sum, a) => sum + a.allocatedAmount, 0)
    const totalSpent = allocations.reduce((sum, a) => sum + a.spentAmount, 0)
    const overBudgetCategories = allocations.filter(a => a.status === 'over' || a.status === 'warning')

    return {
        totalAllocated,
        totalSpent,
        remaining: totalAllocated - totalSpent,
        spentPercent: totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0,
        categoriesCount: allocations.length,
        warningCount: overBudgetCategories.length,
        allocations,
    }
}

// Add spending to a category
export function addSpending(
    eventId: string,
    category: BudgetCategoryType,
    amount: number,
    description?: string
): BudgetAllocation | null {
    const allocation = getCategoryBudget(eventId, category)
    if (!allocation) return null

    return updateSpent(eventId, category, allocation.spentAmount + amount)
}
