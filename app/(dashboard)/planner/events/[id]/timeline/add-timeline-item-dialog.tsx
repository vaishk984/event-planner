'use client'

import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { createTimelineItem } from '@/actions/timeline'
import { useToast } from '@/components/ui/use-toast'

interface AddTimelineItemDialogProps {
    eventId: string
    functions: any[]
    vendors: any[]
}

export function AddTimelineItemDialog({ eventId, functions, vendors }: AddTimelineItemDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        formData.append('eventId', eventId)

        const result = await createTimelineItem(formData)

        setLoading(false)

        if (result.error) {
            toast({
                title: 'Error',
                description: result.error,
                variant: 'destructive',
            })
        } else {
            toast({
                title: 'Success',
                description: 'Timeline item added successfully',
            })
            setOpen(false)
            // Optional: reset form
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add to Timeline</DialogTitle>
                    <DialogDescription>
                        Schedule an activity for the event run sheet.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startTime">Start Time*</Label>
                            <Input id="startTime" name="startTime" type="time" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endTime">End Time</Label>
                            <Input id="endTime" name="endTime" type="time" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title">Activity Title*</Label>
                        <Input id="title" name="title" placeholder="e.g. Cake Cutting" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="functionId">Event Function (Day)</Label>
                        <Select name="functionId">
                            <SelectTrigger>
                                <SelectValue placeholder="Select function" />
                            </SelectTrigger>
                            <SelectContent>
                                {functions.map((f) => (
                                    <SelectItem key={f.id} value={f.id}>
                                        {f.name} ({new Date(f.date).toLocaleDateString()})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="vendorId">Assign Vendor (Optional)</Label>
                        <Select name="vendorId">
                            <SelectTrigger>
                                <SelectValue placeholder="Select vendor" />
                            </SelectTrigger>
                            <SelectContent>
                                {vendors.map((v) => (
                                    <SelectItem key={v.id} value={v.id}>
                                        {v.companyName} ({v.category})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" name="location" placeholder="e.g. Main Hall" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Notes / Description</Label>
                        <Textarea id="description" name="description" placeholder="Details for the team..." />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Add Item
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
