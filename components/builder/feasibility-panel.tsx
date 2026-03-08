'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
    CheckCircle2, AlertCircle, XCircle, Calendar, Users,
    IndianRupee, Clock, ChevronRight, Loader2, RefreshCw
} from 'lucide-react'
import type { Event } from '@/types/domain'

interface FeasibilityPanelProps {
    event: Event
    onNext: () => void
}

interface FeasibilityCheck {
    id: string
    label: string
    status: 'pass' | 'warning' | 'fail' | 'pending'
    message: string
    icon: any
}

export function FeasibilityPanel({ event, onNext }: FeasibilityPanelProps) {
    const [loading, setLoading] = useState(false)
    const [hasRun, setHasRun] = useState(false)
    const [score, setScore] = useState(0)
    const [checks, setChecks] = useState<FeasibilityCheck[]>([
        { id: 'date', label: 'Date Availability', status: 'pending', message: 'Not checked yet', icon: Calendar },
        { id: 'budget', label: 'Budget Viability', status: 'pending', message: 'Not checked yet', icon: IndianRupee },
        { id: 'vendors', label: 'Vendor Pool', status: 'pending', message: 'Not checked yet', icon: Users },
        { id: 'leadtime', label: 'Lead Time', status: 'pending', message: 'Not checked yet', icon: Clock },
    ])

    const runFeasibilityCheck = async () => {
        setLoading(true)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))

        const daysUntilEvent = Math.floor(
            (new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        )

        const estimatedCost = (event.guestCount || 0) * 1500 + 300000 // Base estimate
        const budgetRatio = estimatedCost / (event.budgetMax || 1)

        const newChecks: FeasibilityCheck[] = [
            {
                id: 'date',
                label: 'Date Availability',
                status: 'pass',
                message: `${new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })} - Available`,
                icon: Calendar
            },
            {
                id: 'budget',
                label: 'Budget Viability',
                status: budgetRatio > 1 ? 'fail' : budgetRatio > 0.9 ? 'warning' : 'pass',
                message: budgetRatio > 1
                    ? `Estimated ₹${(estimatedCost / 100000).toFixed(1)}L exceeds budget`
                    : budgetRatio > 0.9
                        ? `Tight budget: ${(budgetRatio * 100).toFixed(0)}% utilized`
                        : `Healthy margin: ${(budgetRatio * 100).toFixed(0)}% utilized`,
                icon: IndianRupee
            },
            {
                id: 'vendors',
                label: 'Vendor Pool',
                status: 'pass',
                message: '15+ vendors available in each category',
                icon: Users
            },
            {
                id: 'leadtime',
                label: 'Lead Time',
                status: daysUntilEvent < 14 ? 'fail' : daysUntilEvent < 30 ? 'warning' : 'pass',
                message: daysUntilEvent < 14
                    ? `Only ${daysUntilEvent} days - Very tight!`
                    : daysUntilEvent < 30
                        ? `${daysUntilEvent} days - Plan quickly`
                        : `${daysUntilEvent} days - Sufficient time`,
                icon: Clock
            },
        ]

        // Calculate score
        let newScore = 100
        newChecks.forEach(check => {
            if (check.status === 'fail') newScore -= 30
            if (check.status === 'warning') newScore -= 10
        })

        setChecks(newChecks)
        setScore(Math.max(0, newScore))
        setHasRun(true)
        setLoading(false)
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pass': return <CheckCircle2 className="w-5 h-5 text-green-500" />
            case 'warning': return <AlertCircle className="w-5 h-5 text-amber-500" />
            case 'fail': return <XCircle className="w-5 h-5 text-red-500" />
            default: return <div className="w-5 h-5 rounded-full bg-gray-200" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pass': return 'bg-green-50 border-green-200'
            case 'warning': return 'bg-amber-50 border-amber-200'
            case 'fail': return 'bg-red-50 border-red-200'
            default: return 'bg-gray-50 border-gray-200'
        }
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Feasibility Check</h2>
                    <p className="text-sm text-gray-500">Validate if this event is viable with current constraints</p>
                </div>
                <div className="flex items-center gap-2">
                    {hasRun && (
                        <Button variant="outline" onClick={runFeasibilityCheck} disabled={loading}>
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Re-run
                        </Button>
                    )}
                    <Button
                        onClick={onNext}
                        className="bg-orange-500 hover:bg-orange-600"
                        disabled={!hasRun || score < 30}
                    >
                        Continue to Vendors <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>

            {!hasRun ? (
                <div className="text-center py-16">
                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Run Feasibility Analysis</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        Before we start sourcing vendors, let's verify that this event is viable
                        with the given date, budget, and requirements.
                    </p>
                    <Button
                        size="lg"
                        onClick={runFeasibilityCheck}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            'Run Feasibility Check'
                        )}
                    </Button>
                </div>
            ) : (
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Score Card */}
                    <Card className={`${score >= 70 ? 'bg-green-50 border-green-200' : score >= 40 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
                        <CardContent className="pt-6 text-center">
                            <div className={`text-5xl font-bold mb-2 ${score >= 70 ? 'text-green-600' : score >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                                {score}
                            </div>
                            <p className="text-sm text-gray-600 mb-4">Viability Score</p>
                            <Progress value={score} className="h-2 mb-4" />
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${score >= 70 ? 'bg-green-100 text-green-700' : score >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                }`}>
                                {score >= 70 ? (
                                    <><CheckCircle2 className="w-4 h-4" /> Good to Go</>
                                ) : score >= 40 ? (
                                    <><AlertCircle className="w-4 h-4" /> Proceed with Caution</>
                                ) : (
                                    <><XCircle className="w-4 h-4" /> High Risk</>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Checks List */}
                    <div className="md:col-span-2 space-y-3">
                        {checks.map(check => {
                            const Icon = check.icon
                            return (
                                <Card key={check.id} className={getStatusColor(check.status)}>
                                    <CardContent className="py-4 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                                            <Icon className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{check.label}</p>
                                            <p className="text-sm text-gray-600">{check.message}</p>
                                        </div>
                                        {getStatusIcon(check.status)}
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
