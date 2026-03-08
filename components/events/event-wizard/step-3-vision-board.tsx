'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Step3VisionBoardProps {
    defaultValues?: {
        theme?: string
        visionDescription?: string
    }
}

export function Step3VisionBoard({ defaultValues }: Step3VisionBoardProps) {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="theme">Event Theme</Label>
                <Input
                    id="theme"
                    name="theme"
                    placeholder="e.g., Rustic Garden, Modern Minimalist, Traditional Indian"
                    defaultValue={defaultValues?.theme}
                />
                <p className="text-sm text-muted-foreground">
                    Overall theme or style for the event
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="visionDescription">Vision & Mood</Label>
                <Textarea
                    id="visionDescription"
                    name="visionDescription"
                    placeholder="Describe the atmosphere, colors, mood, and overall vision for this event..."
                    rows={6}
                    defaultValue={defaultValues?.visionDescription}
                />
                <p className="text-sm text-muted-foreground">
                    Help us understand the look and feel you're going for
                </p>
            </div>

            <div className="rounded-lg border border-dashed p-6 text-center">
                <p className="text-sm text-muted-foreground">
                    📸 Image uploads will be available after event creation
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                    You'll be able to add inspiration images to your vision board from the event detail page
                </p>
            </div>
        </div>
    )
}
