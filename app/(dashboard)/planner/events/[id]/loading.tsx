import { Skeleton, CardSkeleton } from '@/components/ui/loading'

export default function Loading() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="border rounded-lg p-6">
                        <Skeleton className="h-4 w-1/2 mb-2" />
                        <Skeleton className="h-8 w-1/3" />
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CardSkeleton />
                <CardSkeleton />
            </div>
        </div>
    )
}
