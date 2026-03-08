'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
    Building2, UtensilsCrossed, Flower2, Music, Camera, Sparkles,
    Truck, Gift, Box, AlertTriangle, CheckCircle2, TrendingUp,
    IndianRupee, Edit, RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'
import type { Event, BudgetAllocation, BudgetCategoryType } from '@/types/domain'
import {
    getBudgetForEvent,
    initializeBudget,
    updateAllocation,
    getBudgetSummary
} from '@/lib/stores/budget-store'

interface BudgetPanelProps {
    event: Event
}

const CATEGORY_ICONS: Record<BudgetCategoryType, React.ReactNode> = {
    venue: <Building2 className="w-5 h-5" />,
    food: <UtensilsCrossed className="w-5 h-5" />,
    decor: <Flower2 className="w-5 h-5" />,
    entertainment: <Music className="w-5 h-5" />,
    photography: <Camera className="w-5 h-5" />,
    bridal: <Sparkles className="w-5 h-5" />,
    logistics: <Truck className="w-5 h-5" />,
    guest: <Gift className="w-5 h-5" />,
    misc: <Box className="w-5 h-5" />,
}

const CATEGORY_COLORS: Record<BudgetCategoryType, string> = {
    venue: 'bg-blue-500',
    food: 'bg-orange-500',
    decor: 'bg-pink-500',
    entertainment: 'bg-purple-500',
    photography: 'bg-cyan-500',
    bridal: 'bg-rose-500',
    logistics: 'bg-amber-500',
    guest: 'bg-emerald-500',
    misc: 'bg-gray-500',
}

const CATEGORY_NAMES: Record<BudgetCategoryType, string> = {
    venue: 'Venue & Infrastructure',
    food: 'Food & Beverage',
    decor: 'Decoration & Design',
    entertainment: 'Entertainment',
    photography: 'Photography & Video',
    bridal: 'Bridal & Groom',
    logistics: 'Logistics',
    guest: 'Guest Experience',
    misc: 'Miscellaneous',
}

export function BudgetPanel({ event }: BudgetPanelProps) {
    const [allocations, setAllocations] = useState<BudgetAllocation[]>([])
    const [editingCategory, setEditingCategory] = useState<BudgetCategoryType | null>(null)
    const [editAmount, setEditAmount] = useState<number>(0)

    const totalBudget = event.budgetMax || event.budgetMin || 0

    // Load or initialize budget
    useEffect(() => {
        let budget = getBudgetForEvent(event.id)
        if (budget.length === 0 && totalBudget > 0) {
            budget = initializeBudget(event.id, totalBudget)
        }
        setAllocations(budget)
    }, [event.id, totalBudget])

    const summary = getBudgetSummary(event.id)

    const handleEdit = (category: BudgetCategoryType, currentAmount: number) => {
        setEditingCategory(category)
        setEditAmount(currentAmount)
    }

    const handleSave = () => {
        if (!editingCategory) return

        updateAllocation(event.id, editingCategory, editAmount, totalBudget)
        setAllocations(getBudgetForEvent(event.id))
        setEditingCategory(null)
        toast.success('Budget updated')
    }

    const handleReset = () => {
        const newAllocations = initializeBudget(event.id, totalBudget)
        setAllocations(newAllocations)
        toast.success('Budget reset to defaults')
    }

    const allocatedTotal = allocations.reduce((sum, a) => sum + a.allocatedAmount, 0)
    const remaining = totalBudget - allocatedTotal

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-orange-500 to-rose-500 text-white border-0">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-white/80">Total Budget</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{(totalBudget / 100000).toFixed(1)}L</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Allocated</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            ₹{(allocatedTotal / 100000).toFixed(1)}L
                        </div>
                        <p className="text-xs text-gray-500">
                            {totalBudget > 0 ? ((allocatedTotal / totalBudget) * 100).toFixed(0) : 0}% of total
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Spent</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            ₹{(summary.totalSpent / 100000).toFixed(1)}L
                        </div>
                        <p className="text-xs text-gray-500">
                            {allocatedTotal > 0 ? ((summary.totalSpent / allocatedTotal) * 100).toFixed(0) : 0}% of allocated
                        </p>
                    </CardContent>
                </Card>

                <Card className={remaining < 0 ? 'border-red-200 bg-red-50' : ''}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            {remaining < 0 ? 'Over Budget' : 'Unallocated'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${remaining < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                            ₹{Math.abs(remaining / 100000).toFixed(1)}L
                        </div>
                        {remaining < 0 && (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Reduce allocations
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Warnings */}
            {summary.warningCount > 0 && (
                <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="py-3 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        <span className="text-amber-800">
                            {summary.warningCount} categor{summary.warningCount > 1 ? 'ies' : 'y'} exceeding recommended limits
                        </span>
                    </CardContent>
                </Card>
            )}

            {/* Actions */}
            <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={handleReset}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Reset to Defaults
                </Button>
            </div>

            {/* Category Breakdown */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allocations.map(allocation => {
                    const isEditing = editingCategory === allocation.category
                    const spentPercent = allocation.allocatedAmount > 0
                        ? (allocation.spentAmount / allocation.allocatedAmount) * 100
                        : 0

                    return (
                        <Card
                            key={allocation.category}
                            className={`${allocation.status === 'over' ? 'border-red-300 bg-red-50/50' :
                                    allocation.status === 'warning' ? 'border-amber-300 bg-amber-50/50' :
                                        ''
                                }`}
                        >
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full ${CATEGORY_COLORS[allocation.category]} flex items-center justify-center text-white`}>
                                            {CATEGORY_ICONS[allocation.category]}
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm">{CATEGORY_NAMES[allocation.category]}</CardTitle>
                                            <p className="text-xs text-gray-500">{allocation.allocatedPercent.toFixed(0)}% of budget</p>
                                        </div>
                                    </div>
                                    {allocation.status === 'over' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                                    {allocation.status === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                                    {allocation.status === 'on_track' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {isEditing ? (
                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            value={editAmount}
                                            onChange={e => setEditAmount(parseInt(e.target.value) || 0)}
                                            className="h-8"
                                        />
                                        <Button size="sm" onClick={handleSave}>Save</Button>
                                        <Button size="sm" variant="outline" onClick={() => setEditingCategory(null)}>✕</Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-lg font-bold">
                                                ₹{(allocation.allocatedAmount / 1000).toFixed(0)}K
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Spent: ₹{(allocation.spentAmount / 1000).toFixed(0)}K
                                            </p>
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8"
                                            onClick={() => handleEdit(allocation.category, allocation.allocatedAmount)}
                                        >
                                            <Edit className="w-4 h-4 text-gray-400" />
                                        </Button>
                                    </div>
                                )}

                                {/* Progress bar */}
                                <div className="space-y-1">
                                    <Progress
                                        value={Math.min(spentPercent, 100)}
                                        className={`h-2 ${spentPercent > 100 ? '[&>div]:bg-red-500' :
                                                spentPercent > 80 ? '[&>div]:bg-amber-500' :
                                                    '[&>div]:bg-green-500'
                                            }`}
                                    />
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>{spentPercent.toFixed(0)}% used</span>
                                        <span>₹{((allocation.allocatedAmount - allocation.spentAmount) / 1000).toFixed(0)}K left</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
