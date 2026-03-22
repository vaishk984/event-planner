import { Skeleton, TableRowSkeleton } from '@/components/ui/loading'

export default function Loading() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-10 w-32 rounded-lg" />
            </div>
            <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b bg-gray-50">
                            {['Name', 'Email', 'Event Type', 'Date', 'Status'].map((h) => (
                                <th key={h} className="p-4 text-left">
                                    <Skeleton className="h-4 w-20" />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <TableRowSkeleton key={i} columns={5} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
