import { getTasks } from '@/actions/tasks'
import { TasksClient } from './tasks-client'
import { Card } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

export default async function TasksPage() {
    const result = await getTasks()

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
