'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { FunctionsPanel } from '@/components/events/functions-panel'
import { Loader2 } from 'lucide-react'
import type { Event } from '@/types/domain'
import { getEvent } from '@/lib/actions/event-actions'

export default function FunctionsPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const [event, setEvent] = useState<Event | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadEvent = async () => {
            const eventData = await getEvent(id)
            if (!eventData) {
                router.push('/planner/events')
                return
            }
            setEvent(eventData)
            setLoading(false)
        }
        loadEvent()
    }, [id, router])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        )
    }

    if (!event) {
        return null
    }

    return <FunctionsPanel event={event} />
}
