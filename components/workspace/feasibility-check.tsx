'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, CheckCircle2, XCircle, Calendar, Wallet, Users } from 'lucide-react'
import { checkEventFeasibility } from '@/lib/actions/feasibility-actions'
import type { FeasibilityReport } from '@/lib/repositories/feasibility-repository'

interface FeasibilityCheckProps {
    date: string
    budgetMax: number
    guestCount: number
    onPassed: () => void
}

export function FeasibilityCheck({ date, budgetMax, guestCount, onPassed }: FeasibilityCheckProps) {
    const [loading, setLoading] = useState(false)
    const [report, setReport] = useState<FeasibilityReport | null>(null)

    const runCheck = async () => {
        setLoading(true)
        try {
            const result = await checkEventFeasibility(date, budgetMax, undefined, guestCount)
            setReport(result)
            if (result.isFeasible && result.score > 70) {
                // If the check passes nicely, we allow the parent to proceed
                // but usually the user manually clicks "Proceed" after seeing result
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    if (!report) {
        return (
            <Card className="border-dashed border-2 bg-gray-50/50">
                <div className="p-8 text-center">
                    <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Pre-flight Feasibility Check</h3>
                    <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                        Before we start planning, let's analyze the date, budget, and estimated costs to ensure this event is viable.
                    </p>
                    <Button onClick={runCheck} disabled={loading} size="lg">
                        {loading ? 'Running Analysis...' : 'Run Feasibility Check'}
                    </Button>
                </div>
            </Card>
        )
    }

    const { score, conflicts, warnings, budgetAnalysis, vendorAvailability } = report
    const statusColor = score > 80 ? 'text-green-600' : (score > 50 ? 'text-amber-600' : 'text-red-600')
    const StatusIcon = score > 80 ? CheckCircle2 : (score > 50 ? AlertCircle : XCircle)

    return (
        <Card className="overflow-hidden">
            <CardHeader className="bg-gray-50 border-b pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <StatusIcon className={`w-5 h-5 ${statusColor}`} />
                        Feasibility Report
                    </CardTitle>
                    <div className="text-right">
                        <div className={`text-2xl font-bold ${statusColor}`}>{score}/100</div>
                        <p className="text-xs text-gray-500 uppercase font-medium">Viability Score</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6 grid md:grid-cols-2 gap-8">

                {/* Left Column: Issues List */}
                <div className="space-y-6">
                    <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-gray-400" />
                            Risk Analysis
                        </h4>

                        {conflicts.length === 0 && warnings.length === 0 && (
                            <div className="p-3 bg-green-50 text-green-700 text-sm rounded border border-green-100 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                No major risks detected.
                            </div>
                        )}

                        <div className="space-y-2">
                            {conflicts.map((c, i) => (
                                <div key={i} className="p-3 bg-red-50 text-red-700 text-sm rounded border border-red-100 flex items-start gap-2">
                                    <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                    {c}
                                </div>
                            ))}
                            {warnings.map((w, i) => (
                                <div key={i} className="p-3 bg-amber-50 text-amber-700 text-sm rounded border border-amber-100 flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                    {w}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <Button
                            className="w-full"
                            variant={score > 50 ? "default" : "secondary"}
                            onClick={onPassed}
                            disabled={score < 30} // Hard block if score is terrible
                        >
                            {score > 50 ? 'Proceed to Planning Workspace' : 'Proceed with Caution'}
                        </Button>
                    </div>
                </div>

                {/* Right Column: Metrics */}
                <div className="space-y-6">
                    {/* Budget Meter */}
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-500">Budget Utilization</span>
                            <span className="font-medium">{(budgetAnalysis.estimatedCost / budgetAnalysis.budgetMax * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={(budgetAnalysis.estimatedCost / budgetAnalysis.budgetMax * 100)} className="h-2" />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>Est: ₹{budgetAnalysis.estimatedCost.toLocaleString()}</span>
                            <span>Max: ₹{budgetAnalysis.budgetMax.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Vendor Availability */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="text-2xl font-bold text-blue-700">{vendorAvailability.available}</div>
                            <div className="text-xs text-blue-600 font-medium">Vendors Available</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="text-2xl font-bold text-gray-700">{Math.round((vendorAvailability.available / vendorAvailability.total) * 100)}%</div>
                            <div className="text-xs text-gray-600 font-medium">Availability Rate</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
