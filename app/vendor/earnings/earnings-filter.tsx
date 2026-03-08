'use client'

import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams } from 'next/navigation'

export function EarningsFilter({ currentFilter }: { currentFilter: string }) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const setFilter = (filter: string) => {
        const params = new URLSearchParams(searchParams)
        if (filter === 'all') {
            params.delete('filter')
        } else {
            params.set('filter', filter)
        }
        router.push(`?${params.toString()}`)
    }

    return (
        <div className="flex gap-2">
            <Button
                variant={currentFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
            >
                All
            </Button>
            <Button
                variant={currentFilter === 'received' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('received')}
                className={currentFilter === 'received' ? 'bg-green-600' : ''}
            >
                Received
            </Button>
            <Button
                variant={currentFilter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('pending')}
                className={currentFilter === 'pending' ? 'bg-amber-600' : ''}
            >
                Pending
            </Button>
        </div>
    )
}
