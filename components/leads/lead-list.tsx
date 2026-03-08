import Link from 'next/link'
import { LeadScoreBadge } from './lead-score-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { formatDate } from '@/lib/utils/format'

interface Lead {
    id: string
    name: string
    email: string
    phone?: string
    event_type: string
    event_date?: string
    budget?: number
    status: string
    score: number
    created_at: string
}

interface LeadListProps {
    leads: Lead[]
}

export function LeadList({ leads }: LeadListProps) {
    if (leads.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">No leads found</p>
                <Link href="/planner/leads/new">
                    <Button className="mt-4">Create First Lead</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Score</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Event Type</TableHead>
                        <TableHead>Event Date</TableHead>
                        <TableHead>Budget</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {leads.map((lead) => (
                        <TableRow key={lead.id}>
                            <TableCell>
                                <LeadScoreBadge score={lead.score} />
                            </TableCell>
                            <TableCell className="font-medium">
                                <div>
                                    <div>{lead.name}</div>
                                    <div className="text-sm text-muted-foreground">{lead.email}</div>
                                </div>
                            </TableCell>
                            <TableCell className="capitalize">{lead.event_type}</TableCell>
                            <TableCell>
                                {lead.event_date ? formatDate(lead.event_date) : '-'}
                            </TableCell>
                            <TableCell>
                                {lead.budget ? `₹${lead.budget.toLocaleString('en-IN')}` : '-'}
                            </TableCell>
                            <TableCell>
                                <Badge variant={getStatusVariant(lead.status)}>
                                    {lead.status}
                                </Badge>
                            </TableCell>
                            <TableCell>{formatDate(lead.created_at)}</TableCell>
                            <TableCell className="text-right">
                                <Link href={`/planner/leads/${lead.id}`}>
                                    <Button variant="ghost" size="sm">
                                        View
                                    </Button>
                                </Link>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

function getStatusVariant(status: string): 'default' | 'secondary' | 'success' | 'warning' {
    switch (status) {
        case 'CONVERTED':
            return 'success'
        case 'QUALIFIED':
            return 'success'
        case 'CONTACTED':
            return 'warning'
        case 'LOST':
            return 'secondary'
        default:
            return 'default'
    }
}
