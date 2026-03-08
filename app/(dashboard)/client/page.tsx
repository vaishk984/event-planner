import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ClientDashboard() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">My Events</h2>
                <p className="text-muted-foreground">
                    Track your upcoming events and celebrations
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>No Events Yet</CardTitle>
                    <CardDescription>
                        Your planner will create events for you
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Once your planner creates an event, you'll be able to:
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                        <li>• View event details and timeline</li>
                        <li>• Review and approve packages</li>
                        <li>• Track live event progress</li>
                        <li>• Manage your checklist</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    )
}
