import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
    Phone, Mail, Calendar, IndianRupee, Users,
    Search, Plus, AlertTriangle, Star,
    TrendingUp, PhoneCall, MessageSquare
} from 'lucide-react'
import { getLeads } from '@/actions/leads'
import { LeadsClient } from './leads-client'

export default async function LeadsPage() {
    const result = await getLeads()

    if (result.error) {
        return (
            <div className="flex items-center justify-center h-96">
                <Card className="p-8 text-center">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Error Loading Leads</h2>
                    <p className="text-gray-600">{result.error}</p>
                </Card>
            </div>
        )
    }

    const leads = result.data || []

    // Calculate stats
    const neverContacted = leads.filter(l => !l.updated_at ||
        new Date(l.updated_at).getTime() === new Date(l.created_at).getTime()
    ).length

    const hotLeads = leads.filter(l => (l.score || 0) >= 70).length
    const qualifiedLeads = leads.filter(l => l.status === 'active').length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
                    <p className="text-gray-500">{leads.length} total leads</p>
                </div>
                <Link href="/planner/leads/new">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                        <Plus className="w-4 h-4" /> New Lead
                    </Button>
                </Link>
            </div>

            {/* Follow-up Alert Banner */}
            {neverContacted > 0 && (
                <Card className="p-4 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-500 rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-orange-900">Follow-up Required</h3>
                                <p className="text-sm text-orange-700">
                                    <span className="font-bold">{neverContacted} leads need immediate attention</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="text-2xl font-bold text-gray-900">{leads.length}</div>
                    <div className="text-sm text-gray-500">Total Leads</div>
                </Card>
                <Card className="p-4 border-red-200 bg-red-50">
                    <div className="text-2xl font-bold text-red-600">{neverContacted}</div>
                    <div className="text-sm text-red-600">Never Contacted</div>
                </Card>
                <Card className="p-4">
                    <div className="text-2xl font-bold text-green-600">{hotLeads}</div>
                    <div className="text-sm text-gray-500">Hot Leads</div>
                </Card>
                <Card className="p-4">
                    <div className="text-2xl font-bold text-purple-600">{qualifiedLeads}</div>
                    <div className="text-sm text-gray-500">Qualified</div>
                </Card>
            </div>

            {/* Client Component for Interactivity */}
            <LeadsClient leads={leads} />
        </div>
    )
}
