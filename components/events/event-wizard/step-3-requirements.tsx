'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Step2RequirementsProps {
    defaultValues?: {
        budget?: number
        guestCount?: number
        requirements?: string
    }
}

export function Step2Requirements({ defaultValues }: Step2RequirementsProps) {
    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="budget">Budget (₹)</Label>
                    <Input
                        id="budget"
                        name="budget"
                        type="number"
                        placeholder="500000"
                        defaultValue={defaultValues?.budget}
                    />
                    <p className="text-sm text-muted-foreground">
                        Estimated total budget for the event
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="guestCount">Expected Guests</Label>
                    <Input
                        id="guestCount"
                        name="guestCount"
                        type="number"
                        placeholder="200"
                        defaultValue={defaultValues?.guestCount}
                    />
                    <p className="text-sm text-muted-foreground">
                        Approximate number of attendees
                    </p>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="requirements">Special Requirements</Label>
                <Textarea
                    id="requirements"
                    name="requirements"
                    placeholder="List any specific requirements, preferences, or must-haves for this event..."
                    rows={6}
                    defaultValue={defaultValues?.requirements}
                />
                <p className="text-sm text-muted-foreground">
                    Services needed, dietary restrictions, accessibility requirements, etc.
                </p>
            </div>
        </div>
    )
}
