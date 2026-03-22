import { Skeleton, CardSkeleton } from '@/components/ui/loading'

export default function Loading() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-8 w-40" />
            <div className="flex gap-2 mb-4">
                {['All', 'Pending', 'Confirmed', 'Completed'].map((t) => (
                    <Skeleton key={t} className="h-9 w-24 rounded-lg" />
                ))}
            </div>
            <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                    <CardSkeleton key={i} />
                ))}
            </div>
        </div>
    )
}
