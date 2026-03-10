import { getTasksData } from '@/lib/data/queries'
export const dynamic = 'force-dynamic'
import { TasksClient } from './tasks-client'
import { Card } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

export default async function TasksPage({
    searchParams
}: {
    searchParams: { event?: string; status?: string; priority?: string }
}) {
    // Await searchParams before using them
    const params = await searchParams
    const result = await getTasksData({ eventId: params.event, status: params.status, priority: params.priority })

    if (result.error) {
        return (
            <div className="flex items-center justify-center h-96">
                <Card className="p-8 text-center text-red-600 bg-red-50">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
                    <h2 className="text-lg font-bold">Error Loading Tasks</h2>
                    <p>{result.error}</p>
                </Card>
            </div>
        )
    }

    const tasks = result.data || []

    return <TasksClient initialTasks={tasks} />
}
