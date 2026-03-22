'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { EventDayDashboard } from '@/components/events/event-day-dashboard'
import { Loader2, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { Event } from '@/types/domain'
import { getEvent } from '@/lib/actions/event-actions'

export default function ExecutePage() {
    const params = useParams()
    const id = params.id as string

    const [event, setEvent] = useState<Event | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        const loadEvent = async () => {
            try {
                const eventData = await getEvent(id)

                if (!eventData) {
                    setError(true)
                } else {
                    setEvent(eventData)
                }
            } catch (err) {
                console.error('Failed to load event for execution:', err)
                setError(true)
            } finally {
                setLoading(false)
            }
        }
        loadEvent()
    }, [id])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        )
    }

    if (error || !event) {
        return (
            <Card className="max-w-lg mx-auto mt-12">
                <CardContent className="p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Event Day Dashboard</h3>
                    <p className="text-gray-500 mb-2">
                        The event day execution dashboard will be available once the event is approved and live.
                    </p>
                    <p className="text-sm text-gray-400">
                        This panel helps manage the event on the actual day — tracking vendor arrivals, timeline progress, and real-time updates.
                    </p>
                </CardContent>
            </Card>
        )
    }

    return <EventDayDashboard event={event} />
}
