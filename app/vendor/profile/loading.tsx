import { Skeleton, CardSkeleton } from '@/components/ui/loading'

export default function Loading() {
    return (
        <div className="container max-w-6xl mx-auto py-6 space-y-8">
            <CardSkeleton />
            <CardSkeleton />
            <div className="border rounded-lg p-6 space-y-4">
                <Skeleton className="h-6 w-40" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-lg" />
                    ))}
                </div>
            </div>
        </div>
    )
}
