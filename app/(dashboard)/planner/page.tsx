import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Calendar, AlertTriangle, Phone, CheckCircle2,
    Clock, Users, ArrowRight, Bell
} from 'lucide-react'
import Link from 'next/link'
import { getDashboardData } from '@/actions/dashboard'

export default async function PlannerDashboard() {
    const data = await getDashboardData()
    const { stats, todayEvents, leads, tasks, vendors, user } = data

    const hasUrgentItems = tasks.length > 0 || leads.some(l => l.priority === 'hot')

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Good Morning, {user.name}! 👋</h1>
                    <p className="text-gray-500">{user.date}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" className="relative">
                        <Bell className="w-5 h-5" />
                        {hasUrgentItems && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                        )}
                    </Button>
                    <Link href="/planner/events/new">
                        <Button className="bg-indigo-600 hover:bg-indigo-700">+ New Event</Button>
                    </Link>
                </div>
            </div>

            {/* Today's Focus Section */}
            <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    🎯 Today's Focus
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Today's Events */}
                    <Card className="p-4 bg-white">
                        <div className="flex items-center gap-2 text-indigo-600 mb-3">
                            <Calendar className="w-5 h-5" />
                            <span className="font-semibold">Today's Events</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-2">
                            {todayEvents.length}
                        </div>
                        {todayEvents.length > 0 ? (
                            todayEvents.map(event => (
                                <div key={event.id} className="text-sm text-gray-600 flex items-center gap-2">
                                    <Clock className="w-3 h-3" />
                                    {event.time} - {event.name}
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-gray-400 italic">No events today</div>
                        )}
                        <Link href="/planner/events" className="text-xs text-indigo-600 mt-2 flex items-center gap-1 hover:underline">
                            View all <ArrowRight className="w-3 h-3" />
                        </Link>
                    </Card>

                    {/* Leads to Follow */}
                    <Card className="p-4 bg-white">
                        <div className="flex items-center gap-2 text-orange-600 mb-3">
                            <Phone className="w-5 h-5" />
                            <span className="font-semibold">Leads to Follow</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-2">
                            {stats.openLeads}
                        </div>
                        {leads.length > 0 ? (
                            leads.slice(0, 2).map(lead => (
                                <div key={lead.id} className="text-sm text-gray-600 flex items-center justify-between">
                                    <span className="truncate max-w-[100px]">{lead.name}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${lead.priority === 'hot' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {lead.priority}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-gray-400 italic">No open leads</div>
                        )}
                        <Link href="/planner/leads" className="text-xs text-orange-600 mt-2 flex items-center gap-1 hover:underline">
                            View all <ArrowRight className="w-3 h-3" />
                        </Link>
                    </Card>

                    {/* Tasks at Risk */}
                    <Card className="p-4 bg-white border-red-100">
                        <div className="flex items-center gap-2 text-red-600 mb-3">
                            <AlertTriangle className="w-5 h-5" />
                            <span className="font-semibold">Tasks at Risk</span>
                        </div>
                        <div className="text-3xl font-bold text-red-600 mb-2">
                            {tasks.length}
                        </div>
                        {tasks.length > 0 ? (
                            tasks.slice(0, 2).map(task => (
                                <div key={task.id} className="text-sm text-gray-600">
                                    <div className="font-medium truncate">{task.task}</div>
                                    <div className="text-xs text-red-500">{task.dueIn}</div>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-gray-400 italic">All tasks on track</div>
                        )}
                        <Link href="/planner/tasks" className="text-xs text-red-600 mt-2 flex items-center gap-1 hover:underline">
                            View all <ArrowRight className="w-3 h-3" />
                        </Link>
                    </Card>

                    {/* Vendor Confirmations */}
                    <Card className="p-4 bg-white">
                        <div className="flex items-center gap-2 text-purple-600 mb-3">
                            <Users className="w-5 h-5" />
                            <span className="font-semibold">Vendor Pending</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-2">
                            {vendors.length}
                        </div>
                        {vendors.length > 0 ? (
                            vendors.slice(0, 2).map(vendor => (
                                <div key={vendor.id} className="text-sm text-gray-600">
                                    <div className="font-medium">{vendor.vendor}</div>
                                    <div className="text-xs text-gray-400">{vendor.awaiting}</div>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-gray-400 italic">No pending actions</div>
                        )}
                        <Link href="/showroom" className="text-xs text-purple-600 mt-2 flex items-center gap-1 hover:underline">
                            View all <ArrowRight className="w-3 h-3" />
                        </Link>
                    </Card>
                </div>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-6">
                    <div className="text-sm text-gray-500 mb-1">Active Events</div>
                    <div className="text-3xl font-bold text-gray-900">{stats.activeEvents}</div>
                    <div className="text-xs text-green-600 mt-1">+3 this month</div>
                </Card>
                <Card className="p-6">
                    <div className="text-sm text-gray-500 mb-1">Open Leads</div>
                    <div className="text-3xl font-bold text-gray-900">{stats.openLeads}</div>
                    <div className="text-xs text-blue-600 mt-1">8 hot leads</div>
                </Card>
                <Card className="p-6">
                    <div className="text-sm text-gray-500 mb-1">Revenue</div>
                    <div className="text-3xl font-bold text-gray-900">
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(stats.revenue)}
                    </div>
                    <div className="text-xs text-green-600 mt-1">↑ 12% vs last month</div>
                </Card>
                <Card className="p-6">
                    <div className="text-sm text-gray-500 mb-1">Pending Payments</div>
                    <div className="text-3xl font-bold text-gray-900">
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(stats.pendingPayments)}
                    </div>
                    <div className="text-xs text-orange-600 mt-1">3 overdue</div>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                    <Link href="/planner/leads/new">
                        <Button variant="outline" className="gap-2">
                            <Phone className="w-4 h-4" /> Add New Lead
                        </Button>
                    </Link>
                    <Link href="/planner/events/new">
                        <Button variant="outline" className="gap-2">
                            <Calendar className="w-4 h-4" /> Create Event
                        </Button>
                    </Link>
                    <Link href="/planner/tasks">
                        <Button variant="outline" className="gap-2">
                            <CheckCircle2 className="w-4 h-4" /> View Tasks
                        </Button>
                    </Link>
                    <Link href="/showroom">
                        <Button variant="outline" className="gap-2">
                            <Users className="w-4 h-4" /> Browse Showroom
                        </Button>
                    </Link>
                    <Link href="/planner/quotes">
                        <Button variant="outline" className="gap-2">
                            📄 View Quotes
                        </Button>
                    </Link>
                    <Link href="/planner/invoices">
                        <Button variant="outline" className="gap-2">
                            💰 Invoices
                        </Button>
                    </Link>
                </div>
            </Card>
        </div>
    )
}
