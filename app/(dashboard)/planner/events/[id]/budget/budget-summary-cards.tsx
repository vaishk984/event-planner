import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Wallet, TrendingUp, BadgeIndianRupee, PiggyBank } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BudgetSummaryCardsProps {
    overview: {
        totalBudgeted: number    // Sum of estimated_amount across items
        totalInvoiced: number    // Sum of actual_amount (what vendors charged)
        totalPaid: number        // Sum of paid_amount (cash actually sent)
        eventBudget: number      // Master ceiling from the event record
    }
}

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount)

export function BudgetSummaryCards({ overview }: BudgetSummaryCardsProps) {
    const { totalBudgeted, totalInvoiced, totalPaid, eventBudget } = overview

    // Use event budget as ceiling if set, otherwise fall back to sum of estimates
    const budgetCeiling = eventBudget > 0 ? eventBudget : totalBudgeted

    const remainingFromCeiling = budgetCeiling - totalBudgeted
    const isOverAllocated = remainingFromCeiling < 0

    const invoicedPercent = totalBudgeted > 0 ? Math.min((totalInvoiced / totalBudgeted) * 100, 100) : 0
    const paidPercent = totalInvoiced > 0 ? Math.min((totalPaid / totalInvoiced) * 100, 100) : 0
    const allocatedPercent = budgetCeiling > 0 ? Math.min((totalBudgeted / budgetCeiling) * 100, 100) : 0

    return (
        <div className="grid gap-4 md:grid-cols-4">

            {/* Card 1: Event Budget (ceiling) */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Event Budget
                    </CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {budgetCeiling > 0 ? formatCurrency(budgetCeiling) : '—'}
                    </div>
                    <Progress value={allocatedPercent} className="h-1.5 mt-3 bg-gray-100" />
                    <p className="text-xs text-muted-foreground mt-1.5">
                        {budgetCeiling > 0
                            ? `${allocatedPercent.toFixed(0)}% allocated across expenses`
                            : 'Set a budget in event settings'}
                    </p>
                </CardContent>
            </Card>

            {/* Card 2: Total Budgeted (sum of estimates) */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Budgeted
                    </CardTitle>
                    <BadgeIndianRupee className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className={cn("text-2xl font-bold", isOverAllocated ? "text-red-600" : "text-gray-900")}>
                        {formatCurrency(totalBudgeted)}
                    </div>
                    <p className="text-xs mt-1.5">
                        {budgetCeiling > 0 ? (
                            <span className={isOverAllocated ? 'text-red-500' : 'text-muted-foreground'}>
                                {isOverAllocated
                                    ? `₹${Math.abs(remainingFromCeiling).toLocaleString('en-IN')} over event budget`
                                    : `₹${remainingFromCeiling.toLocaleString('en-IN')} unallocated`}
                            </span>
                        ) : (
                            <span className="text-muted-foreground">Sum of expense estimates</span>
                        )}
                    </p>
                </CardContent>
            </Card>

            {/* Card 3: Total Invoiced (actual bills received) */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Invoiced (Actual)
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className={cn(
                        "text-2xl font-bold",
                        totalInvoiced > totalBudgeted ? "text-red-600" : "text-gray-900"
                    )}>
                        {formatCurrency(totalInvoiced)}
                    </div>
                    <Progress value={invoicedPercent} className="h-1.5 mt-3 bg-gray-100" />
                    <p className="text-xs text-muted-foreground mt-1.5">
                        {invoicedPercent.toFixed(0)}% of budgeted amount invoiced
                    </p>
                </CardContent>
            </Card>

            {/* Card 4: Total Paid (cash out) */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Paid
                    </CardTitle>
                    <PiggyBank className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(totalPaid)}
                    </div>
                    <Progress value={paidPercent} className="h-1.5 mt-3 bg-gray-100" />
                    <p className="text-xs text-muted-foreground mt-1.5">
                        {totalInvoiced > 0
                            ? `${paidPercent.toFixed(0)}% of invoiced amount paid · ₹${(totalInvoiced - totalPaid).toLocaleString('en-IN')} pending`
                            : 'No invoices recorded yet'}
                    </p>
                </CardContent>
            </Card>

        </div>
    )
}
