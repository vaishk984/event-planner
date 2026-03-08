import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LeadScoreBadge } from '@/components/leads/lead-score-badge'
import { LeadActivityTimeline } from '@/components/leads/lead-activity-timeline'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils/format'

export default async function LeadDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()

    // Get lead details
    const { data: lead, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !lead) {
        notFound()
    }

    // Get activities
    const { data: activities } = await supabase
        .from('lead_activities')
        .select('*')
        .eq('lead_id', id)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/planner/leads" className="text-sm text-muted-foreground hover:underline">
                        ← Back to Leads
                    </Link>
                    <h2 className="text-3xl font-bold tracking-tight mt-2">{lead.name}</h2>
                    <p className="text-muted-foreground">{lead.email}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">Edit</Button>
                    <Button>Convert to Client</Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Lead Info Card */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Lead Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Score</div>
                                <div className="mt-1">
                                    <LeadScoreBadge score={lead.score} />
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Status</div>
                                <div className="mt-1">
                                    <Badge>{lead.status}</Badge>
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Phone</div>
                                <div className="mt-1">{lead.phone || '-'}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Source</div>
                                <div className="mt-1 capitalize">{lead.source}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Event Type</div>
                                <div className="mt-1 capitalize">{lead.event_type}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Event Date</div>
                                <div className="mt-1">
                                    {lead.event_date ? formatDate(lead.event_date) : '-'}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Budget</div>
                                <div className="mt-1">
                                    {lead.budget ? `₹${lead.budget.toLocaleString('en-IN')}` : '-'}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Guest Count</div>
                                <div className="mt-1">{lead.guest_count || '-'}</div>
                            </div>
                        </div>

                        {lead.notes && (
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Notes</div>
                                <div className="mt-1 text-sm">{lead.notes}</div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="text-2xl font-bold">{activities?.length || 0}</div>
                            <div className="text-sm text-muted-foreground">Activities</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold">
                                {Math.floor((new Date().getTime() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24))}
                            </div>
                            <div className="text-sm text-muted-foreground">Days as Lead</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">Created</div>
                            <div className="text-sm">{formatDate(lead.created_at)}</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Activity Timeline */}
            <Card>
                <CardContent className="pt-6">
                    <LeadActivityTimeline leadId={lead.id} activities={activities || []} />
                </CardContent>
            </Card>
        </div>
    )
}
