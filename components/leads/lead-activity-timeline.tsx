'use client'

import { useState } from 'react'
import { addActivity } from '@/actions/leads/add-activity'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { formatRelativeTime } from '@/lib/utils/format'

interface Activity {
    id: string
    activity_type: string
    description: string
    created_at: string
}

interface LeadActivityTimelineProps {
    leadId: string
    activities: Activity[]
}

export function LeadActivityTimeline({ leadId, activities }: LeadActivityTimelineProps) {
    const [loading, setLoading] = useState(false)
    const [showForm, setShowForm] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        await addActivity(formData)
        setLoading(false)
        setShowForm(false)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Activity Timeline</h3>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'Cancel' : '+ Add Activity'}
                </Button>
            </div>

            {showForm && (
                <form action={handleSubmit} className="space-y-4 p-4 border rounded-lg">
                    <input type="hidden" name="leadId" value={leadId} />

                    <div className="space-y-2">
                        <Label htmlFor="activityType">Activity Type</Label>
                        <select
                            id="activityType"
                            name="activityType"
                            required
                            disabled={loading}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            <option value="call">Phone Call</option>
                            <option value="email">Email</option>
                            <option value="meeting">Meeting</option>
                            <option value="note">Note</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="What happened?"
                            required
                            disabled={loading}
                        />
                    </div>

                    <Button type="submit" disabled={loading}>
                        {loading ? 'Adding...' : 'Add Activity'}
                    </Button>
                </form>
            )}

            <div className="space-y-4">
                {activities.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No activities yet</p>
                ) : (
                    activities.map((activity) => (
                        <div key={activity.id} className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <div className="w-2 h-2 rounded-full bg-primary" />
                                <div className="w-px h-full bg-border" />
                            </div>
                            <div className="flex-1 pb-4">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium capitalize">{activity.activity_type}</span>
                                    <span className="text-sm text-muted-foreground">
                                        {formatRelativeTime(activity.created_at)}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {activity.description}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
