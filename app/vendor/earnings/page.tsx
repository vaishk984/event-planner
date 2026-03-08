// This is a server component now
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    IndianRupee, TrendingUp, ArrowUpRight, ArrowDownRight, Calendar,
    Download, CheckCircle2, Clock, Building2
} from 'lucide-react'
import { getVendorEarnings } from '@/lib/actions/vendor-actions'
import { EarningsFilter } from './earnings-filter'

export const dynamic = 'force-dynamic'

export default async function VendorEarningsPage({
    searchParams
}: {
    searchParams: Promise<{ filter?: string }>
}) {
    const params = await searchParams
    const filter = params.filter || 'all'
    const data = await getVendorEarnings()

    if (!data) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold">Earnings</h1>
                <p className="text-gray-500">Unable to load earnings data. Please try again later.</p>
            </div>
        )
    }

    const { stats, monthly, recent } = data

    // Filter recent payments based on query param
    const filteredPayments = filter === 'all'
        ? recent
        : recent.filter(p => {
            if (filter === 'received') return p.status === 'completed'
            if (filter === 'pending') return ['pending', 'quoted', 'accepted'].includes(p.status)
            return true
        })

    const growthPercent = Math.round(((stats.thisMonth - stats.lastMonth) / (stats.lastMonth || 1)) * 100)

    // Helper to format currency
    const formatCurrency = (amount: number) => {
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
        if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`
        return `₹${amount}`
    }

    return (
        <div className="space-y-6 container max-w-6xl mx-auto py-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Earnings</h2>
                    <p className="text-gray-500">Track your income and payment history</p>
                </div>
                <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" /> Download Report
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-white/80">This Month</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{formatCurrency(stats.thisMonth)}</div>
                        <div className="flex items-center gap-1 mt-2 text-sm text-white/80">
                            {growthPercent > 0 ? (
                                <>
                                    <ArrowUpRight className="w-4 h-4" />
                                    <span>+{growthPercent}% vs last month</span>
                                </>
                            ) : (
                                <>
                                    <ArrowDownRight className="w-4 h-4" />
                                    <span>{growthPercent}% vs last month</span>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Pending Payments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-amber-600">{formatCurrency(stats.pending)}</div>
                        <p className="text-xs text-gray-500 mt-2">Expected revenue</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Total Earnings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{formatCurrency(stats.total)}</div>
                        <p className="text-xs text-gray-500 mt-2">{stats.completedCount} completed events</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Avg. Per Event</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{formatCurrency(stats.avgPerEvent)}</div>
                        <p className="text-xs text-gray-500 mt-2">
                            <TrendingUp className="w-3 h-3 inline mr-1 text-green-500" />
                            Based on completed
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Monthly Breakdown */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Monthly Breakdown</CardTitle>
                        <CardDescription>Last 6 months revenue</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {monthly.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No data available</p>}
                        {monthly.map((month, idx) => (
                            <div
                                key={month.month}
                                className={`flex items-center justify-between p-3 rounded-lg ${idx === 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}
                            >
                                <div>
                                    <p className={`font-medium ${idx === 0 ? 'text-green-700' : 'text-gray-700'}`}>
                                        {month.month}
                                    </p>
                                    <p className="text-xs text-gray-500">{month.count} events</p>
                                </div>
                                <p className={`font-bold ${idx === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                                    {formatCurrency(month.amount)}
                                </p>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Recent Payments */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Payment History</CardTitle>
                                <CardDescription>Recent transactions & pending</CardDescription>
                            </div>
                            <EarningsFilter currentFilter={filter} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {filteredPayments.length === 0 && <p className="text-sm text-gray-500 text-center py-8">No payments found</p>}
                            {filteredPayments.map(payment => (
                                <div
                                    key={payment.id}
                                    className="flex items-center justify-between p-4 rounded-lg border hover:shadow-sm transition-shadow"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${payment.status === 'completed' ? 'bg-green-100' : 'bg-amber-100'
                                            }`}>
                                            {payment.status === 'completed'
                                                ? <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                : <Clock className="w-5 h-5 text-amber-600" />
                                            }
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">{payment.eventName}</h4>
                                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Building2 className="w-3 h-3" />
                                                    {payment.venue || 'TBD'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(payment.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-gray-900">
                                            {formatCurrency(payment.quotedAmount || payment.budget)}
                                        </p>
                                        <Badge className={
                                            payment.status === 'completed'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-amber-100 text-amber-700'
                                        }>
                                            {payment.status === 'completed' ? 'Received' : 'Pending'}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
