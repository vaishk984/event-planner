import { Skeleton, CardSkeleton } from '@/components/ui/loading'

export default function Loading() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-10 w-32 rounded-lg" />
            </div>
            <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <CardSkeleton key={i} />
                ))}
            </div>
        </div>
    )
}
