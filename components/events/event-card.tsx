import Link from 'next/link'
import { EventStatusBadge } from './event-status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils/format'

interface Event {
    id: string
    name: string
    event_type: string
    event_date: string
    venue?: string
    budget?: number
    guest_count?: number
    status: string
    created_at: string
}

interface EventCardProps {
    event: Event
}

export function EventCard({ event }: EventCardProps) {
    // Calculate days until event
    const daysUntil = Math.floor(
        (new Date(event.event_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="capitalize">{event.name}</CardTitle>
                        <CardDescription className="capitalize">
                            {event.event_type} • {formatDate(event.event_date)}
                        </CardDescription>
                    </div>
                    <EventStatusBadge status={event.status} />
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-2 text-sm">
                    {event.venue && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Venue:</span>
                            <span className="font-medium">{event.venue}</span>
                        </div>
                    )}
                    {event.budget && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Budget:</span>
                            <span className="font-medium">₹{event.budget.toLocaleString('en-IN')}</span>
                        </div>
                    )}
                    {event.guest_count && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Guests:</span>
                            <span className="font-medium">{event.guest_count}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Days Until:</span>
                        <span className={`font-medium ${daysUntil < 30 ? 'text-orange-600' : ''}`}>
                            {daysUntil > 0 ? `${daysUntil} days` : daysUntil === 0 ? 'Today!' : 'Past'}
                        </span>
                    </div>
                </div>

                <Link href={`/planner/events/${event.id}`}>
                    <Button className="w-full" variant="outline">
                        View Details
                    </Button>
                </Link>
            </CardContent>
        </Card>
    )
}
