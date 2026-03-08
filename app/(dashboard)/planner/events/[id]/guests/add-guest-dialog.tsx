'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { UserPlus } from 'lucide-react'
import { createGuest } from '@/actions/guests'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'

interface AddGuestDialogProps {
    eventId: string
}

export function AddGuestDialog({ eventId }: AddGuestDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [plusOne, setPlusOne] = useState(false)
    const [category, setCategory] = useState('friends')
    const [rsvpStatus, setRsvpStatus] = useState('pending')
    const router = useRouter()
    const { toast } = useToast()

    function handleOpenChange(val: boolean) {
        setOpen(val)
        if (!val) {
            // Reset state on close
            setPlusOne(false)
            setCategory('friends')
            setRsvpStatus('pending')
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        formData.append('eventId', eventId)
        // Inject controlled select values since Radix Select doesn't always serialize into FormData
        formData.set('category', category)
        formData.set('rsvpStatus', rsvpStatus)
        if (!plusOne) formData.delete('plusOneName')

        try {
            const result = await createGuest(formData)
            if (result.success) {
                toast({ title: 'Guest added!', description: `Guest has been added to the event.` })
                handleOpenChange(false)
                router.refresh()
            } else {
                toast({ title: 'Error', description: result.error || 'Failed to add guest', variant: 'destructive' })
            }
        } catch (error) {
            console.error(error)
            toast({ title: 'Error', description: 'Something went wrong. Please try again.', variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }

    const selectContentClass = "bg-white border border-gray-200 shadow-xl z-[300]"
    const selectItemClass = "hover:bg-gray-100 cursor-pointer"

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                    <UserPlus className="w-4 h-4" /> Add Guest
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Guest</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    {/* Name + Category */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name *</Label>
                            <Input id="name" name="name" required placeholder="e.g. Rahul Sharma" />
                        </div>
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent position="popper" side="bottom" className={selectContentClass}>
                                    <SelectItem value="vip" className={selectItemClass}>⭐ VIP</SelectItem>
                                    <SelectItem value="family" className={selectItemClass}>👨‍👩‍👧 Family</SelectItem>
                                    <SelectItem value="friends" className={selectItemClass}>👥 Friends</SelectItem>
                                    <SelectItem value="colleagues" className={selectItemClass}>💼 Colleagues</SelectItem>
                                    <SelectItem value="bride_side" className={selectItemClass}>👰 Bride Side</SelectItem>
                                    <SelectItem value="groom_side" className={selectItemClass}>🤵 Groom Side</SelectItem>
                                    <SelectItem value="other" className={selectItemClass}>Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Email + Phone */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="rahul@example.com" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" name="phone" placeholder="+91 98765 43210" />
                        </div>
                    </div>

                    {/* RSVP Status + Table Number */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>RSVP Status</Label>
                            <Select value={rsvpStatus} onValueChange={setRsvpStatus}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent position="popper" side="bottom" className={selectContentClass}>
                                    <SelectItem value="pending" className={selectItemClass}>🕐 Pending</SelectItem>
                                    <SelectItem value="confirmed" className={selectItemClass}>✅ Confirmed</SelectItem>
                                    <SelectItem value="declined" className={selectItemClass}>❌ Declined</SelectItem>
                                    <SelectItem value="maybe" className={selectItemClass}>🤔 Maybe</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tableNumber">Table No.</Label>
                            <Input id="tableNumber" name="tableNumber" type="number" min="1" placeholder="e.g. 5" />
                        </div>
                    </div>

                    {/* Plus One */}
                    <div className="flex items-center space-x-3 border p-3 rounded-md bg-gray-50">
                        <Checkbox
                            id="plusOne"
                            checked={plusOne}
                            onCheckedChange={(c) => setPlusOne(!!c)}
                        />
                        <div className="flex-1">
                            <Label htmlFor="plusOne" className="font-medium cursor-pointer">Bringing a Plus One?</Label>
                            <p className="text-xs text-gray-500">Check if this guest is bringing a partner/companion</p>
                        </div>
                    </div>

                    {plusOne && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <Label htmlFor="plusOneName">Partner's Name *</Label>
                            <Input id="plusOneName" name="plusOneName" placeholder="e.g. Priya Sharma" required={plusOne} />
                        </div>
                    )}

                    {/* Dietary Preferences */}
                    <div className="space-y-2">
                        <Label htmlFor="dietaryPreferences">Dietary Preferences</Label>
                        <Textarea
                            id="dietaryPreferences"
                            name="dietaryPreferences"
                            placeholder="e.g. Vegetarian, Jain, Nut allergy, Diabetic..."
                            className="h-16 resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
                            {loading ? 'Adding...' : 'Add Guest'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
