'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Check, X, Calendar } from 'lucide-react'

interface AvailabilityCheckerProps {
    vendorId: string
    vendorName: string
    eventDate?: string
    onAvailabilityConfirmed?: (available: boolean) => void
}

export function AvailabilityChecker({
    vendorId,
    vendorName,
    eventDate,
    onAvailabilityConfirmed
}: AvailabilityCheckerProps) {
    const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle')

    async function checkAvailability() {
        setStatus('checking')

        // Simulate API call (1.5 second delay)
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Mock availability logic (80% chance available)
        const isAvailable = Math.random() > 0.2

        setStatus(isAvailable ? 'available' : 'unavailable')
        onAvailabilityConfirmed?.(isAvailable)
    }

    if (status === 'idle') {
        return (
            <Button
                variant="outline"
                size="sm"
                onClick={checkAvailability}
                className="gap-2 text-gray-600 hover:text-indigo-600 hover:border-indigo-300"
            >
                <Calendar className="w-4 h-4" />
                Check Availability
            </Button>
        )
    }

    if (status === 'checking') {
        return (
            <Button
                variant="outline"
                size="sm"
                disabled
                className="gap-2"
            >
                <Loader2 className="w-4 h-4 animate-spin" />
                Checking...
            </Button>
        )
    }

    if (status === 'available') {
        return (
            <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                    <Check className="w-4 h-4" />
                    <span className="font-medium">Available</span>
                </div>
                <button
                    onClick={() => setStatus('idle')}
                    className="text-gray-400 hover:text-gray-600 text-xs underline"
                >
                    Recheck
                </button>
            </div>
        )
    }

    // unavailable
    return (
        <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1.5 rounded-full">
                <X className="w-4 h-4" />
                <span className="font-medium">Unavailable</span>
            </div>
            <button
                onClick={() => setStatus('idle')}
                className="text-gray-400 hover:text-gray-600 text-xs underline"
            >
                Recheck
            </button>
        </div>
    )
}
