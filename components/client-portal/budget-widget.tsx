'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useClientIntake } from '@/components/providers/client-intake-provider'
import { calculateBudget, formatCurrency, BudgetResult } from '@/lib/budget-calculator'
import {
    Calculator, TrendingUp, UtensilsCrossed, Palette, Camera,
    Music, Sparkles, MapPin, ChevronRight
} from 'lucide-react'

const CATEGORY_ICONS: Record<string, any> = {
    venue: MapPin,
    food: UtensilsCrossed,
    decor: Palette,
    entertainment: Music,
    photography: Camera,
    addon: Sparkles,
    service: Sparkles,
}

const CATEGORY_COLORS: Record<string, string> = {
    venue: 'bg-blue-100 text-blue-700',
    food: 'bg-orange-100 text-orange-700',
    decor: 'bg-pink-100 text-pink-700',
    entertainment: 'bg-purple-100 text-purple-700',
    photography: 'bg-cyan-100 text-cyan-700',
    addon: 'bg-amber-100 text-amber-700',
    service: 'bg-green-100 text-green-700',
}

interface BudgetWidgetProps {
    compact?: boolean
}

export function BudgetWidget({ compact = false }: BudgetWidgetProps) {
    const { data } = useClientIntake()

    const budget: BudgetResult = useMemo(() => {
        return calculateBudget({
            guestCount: data.guestCount,
            venueType: data.venueType,
            foodBudgetLevel: data.food.budgetLevel,
            servingStyle: data.food.servingStyle,
            decorIntensity: data.decor.intensity,
            entertainmentType: data.entertainment.type,
            photoPackage: data.photography.package,
            wantsDrone: data.photography.drone,
            wantsPreWedding: data.photography.preWedding,
            wantsMakeup: data.services.makeup,
            wantsMehendi: data.services.mehendi,
            wantsAnchor: data.services.anchor,
            wantsValet: data.services.valet,
            wantsPandit: data.services.pandit,
        })
    }, [data])

    // Compare with client's budget
    const clientBudgetMax = data.budgetMax
    const overBudget = budget.total > clientBudgetMax
    const budgetDiff = budget.total - clientBudgetMax
    const budgetPercent = clientBudgetMax > 0 ? Math.min(100, (budget.total / clientBudgetMax) * 100) : 0

    if (compact) {
        return (
            <div className="fixed bottom-4 right-4 z-40">
                <Card className="shadow-2xl border-2 border-orange-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                                <Calculator className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Estimated Total</p>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(budget.total)}</p>
                            </div>
                            {overBudget && (
                                <Badge variant="destructive" className="ml-2">
                                    +{formatCurrency(budgetDiff)}
                                </Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <Card className="sticky top-24">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Calculator className="w-5 h-5 text-orange-500" />
                    Budget Estimator
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
                {/* Total */}
                <div className="text-center py-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">Estimated Total</p>
                    <p className="text-3xl font-bold text-gray-900">{formatCurrency(budget.total)}</p>
                    <p className="text-sm text-gray-400 mt-1">
                        {formatCurrency(budget.perPerson)}/person • {data.guestCount} guests
                    </p>
                </div>

                {/* Budget bar */}
                {clientBudgetMax > 0 && (
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500">Your budget</span>
                            <span className={overBudget ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                                {overBudget ? `Over by ${formatCurrency(budgetDiff)}` : `Under by ${formatCurrency(-budgetDiff)}`}
                            </span>
                        </div>
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all ${overBudget ? 'bg-red-500' : 'bg-green-500'}`}
                                style={{ width: `${Math.min(100, budgetPercent)}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-1 text-right">
                            Budget: {formatCurrency(clientBudgetMax)}
                        </p>
                    </div>
                )}

                {/* Breakdown */}
                <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Breakdown</p>
                    {budget.breakdown.map((item, i) => {
                        const Icon = CATEGORY_ICONS[item.category] || Sparkles
                        const colorClass = CATEGORY_COLORS[item.category] || 'bg-gray-100 text-gray-700'

                        return (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                <div className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClass}`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm text-gray-700">{item.label}</span>
                                </div>
                                <span className="font-medium">{formatCurrency(item.amount)}</span>
                            </div>
                        )
                    })}
                </div>

                {budget.breakdown.length === 0 && (
                    <div className="text-center py-6 text-gray-400">
                        <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Make selections to see estimates</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
