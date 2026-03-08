import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface BudgetMeterProps {
    totalBudget: number
    allocated: number
    className?: string
}

export function BudgetMeter({ totalBudget, allocated, className }: BudgetMeterProps) {
    const percentage = Math.min((allocated / totalBudget) * 100, 100)
    const isOverBudget = allocated > totalBudget

    // Determine color based on usage
    let colorClass = "bg-green-500" // Safe
    if (percentage > 75) colorClass = "bg-yellow-500" // Warning
    if (percentage > 90 || isOverBudget) colorClass = "bg-red-500" // Danger

    return (
        <Card className={cn("border-none shadow-sm bg-gray-50", className)}>
            <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Smart Budget Meter</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-gray-900">
                                ₹{allocated.toLocaleString()}
                            </span>
                            <span className="text-sm text-gray-500">
                                / ₹{totalBudget.toLocaleString()}
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                            isOverBudget ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                        )}>
                            {Math.round(percentage)}% Used
                        </span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={cn("h-full transition-all duration-500 ease-out", colorClass)}
                        style={{ width: `${percentage}%` }}
                    />
                </div>

                <div className="mt-2 flex justify-between text-xs text-gray-500">
                    <span>Allocated: ₹{allocated.toLocaleString()}</span>
                    <span>Remaining: ₹{Math.max(0, totalBudget - allocated).toLocaleString()}</span>
                </div>
            </CardContent>
        </Card>
    )
}
