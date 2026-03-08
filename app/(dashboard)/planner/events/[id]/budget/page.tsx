import { getBudgetOverview } from '@/actions/budget'
import { getVendors } from '@/actions/vendors'
import { BudgetSummaryCards } from './budget-summary-cards'
import { BudgetList } from './budget-list'
import { AddExpenseDialog } from './add-expense-dialog'

export default async function BudgetPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: eventId } = await params

    const [budgetResult, vendorsResult] = await Promise.all([
        getBudgetOverview(eventId),
        getVendors()
    ])

    const items = budgetResult.items || []
    const overview = budgetResult.overview || { totalBudgeted: 0, totalInvoiced: 0, totalPaid: 0, eventBudget: 0 }
    const vendors = vendorsResult.data || []

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Budget & Expenses</h2>
                    <p className="text-muted-foreground">Manage estimated costs and track actual spending.</p>
                </div>
                <AddExpenseDialog eventId={eventId} vendors={vendors} />
            </div>

            <BudgetSummaryCards overview={overview} />

            <div className="space-y-4">
                <h3 className="text-lg font-medium">Expenses</h3>
                <BudgetList items={items} eventId={eventId} />
            </div>
        </div>
    )
}
