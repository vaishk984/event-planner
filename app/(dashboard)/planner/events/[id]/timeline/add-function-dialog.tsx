'use client'

import { useState } from 'react'
import { CalendarPlus, Loader2 } from 'lucide-react'
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { createEventFunction } from '@/actions/timeline'
import { useToast } from '@/components/ui/use-toast'

interface AddFunctionDialogProps {
    eventId: string
}

const EVENT_TYPES = [
    'mehendi', 'haldi', 'sangeet', 'wedding', 'reception',
    'cocktail', 'after_party', 'brunch', 'ceremony', 'conference', 'dinner', 'custom'
]

export function AddFunctionDialog({ eventId }: AddFunctionDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        formData.append('eventId', eventId)

        const result = await createEventFunction(formData)

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
                description: 'Day/Function added successfully',
            })
            setOpen(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary">
                    <CalendarPlus className="w-4 h-4 mr-2" />
                    Add Event Function
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Event Function</DialogTitle>
                    <DialogDescription>
                        Create a new day or main event function (e.g. Wedding, Mehendi).
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Function Name*</Label>
                        <Input id="name" name="name" placeholder="e.g. Wedding Ceremony" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Type*</Label>
                            <Select name="type" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {EVENT_TYPES.map((t) => (
                                        <SelectItem key={t} value={t} className="capitalize">
                                            {t.replace('_', ' ')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="date">Date*</Label>
                            <Input id="date" name="date" type="date" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startTime">Start Time</Label>
                            <Input id="startTime" name="startTime" type="time" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="venueName">Venue</Label>
                            <Input id="venueName" name="venueName" placeholder="Hotel Name" />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Create Function
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
