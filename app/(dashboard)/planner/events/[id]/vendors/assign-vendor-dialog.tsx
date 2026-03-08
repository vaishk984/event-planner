'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus } from 'lucide-react'
import { createBookingRequest } from '@/actions/bookings'
import { useRouter } from 'next/navigation'
import { VendorData } from '@/src/backend/entities/Vendor'
import { useToast } from '@/components/ui/use-toast'

interface AssignVendorDialogProps {
    eventId: string
    availableVendors: VendorData[]
}

export function AssignVendorDialog({ eventId, availableVendors }: AssignVendorDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [selectedVendorId, setSelectedVendorId] = useState('')
    const [serviceCategory, setServiceCategory] = useState('other')
    const [status, setStatus] = useState('pending')
    const router = useRouter()
    const { toast } = useToast()

    const selectedVendor = availableVendors.find(v => v.id === selectedVendorId)

    function handleVendorChange(vendorId: string) {
        setSelectedVendorId(vendorId)
        const vendor = availableVendors.find(v => v.id === vendorId)
        if (vendor?.category) setServiceCategory(vendor.category)
    }

    function handleOpenChange(val: boolean) {
        setOpen(val)
        if (!val) {
            setSelectedVendorId('')
            setServiceCategory('other')
            setStatus('pending')
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!selectedVendorId) {
            toast({ title: 'Select a vendor', description: 'Please choose a vendor first.', variant: 'destructive' })
            return
        }
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        // Inject Radix Select values manually — they don't serialize into FormData natively
        formData.set('vendorId', selectedVendorId)
        formData.set('serviceCategory', serviceCategory)
        formData.set('status', status)
        formData.set('eventId', eventId)

        try {
            const result = await createBookingRequest(formData)
            if (result.error) {
                toast({ title: 'Error', description: result.error, variant: 'destructive' })
            } else {
                toast({ title: 'Vendor assigned!', description: `${selectedVendor?.companyName} has been added to this event.` })
                handleOpenChange(false)
                router.refresh()
            }
        } catch (error) {
            console.error(error)
            toast({ title: 'Error', description: 'Failed to assign vendor. Please try again.', variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                    <Plus className="w-4 h-4" /> Assign Vendor
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Assign Vendor to Event</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <Label>Select Vendor *</Label>
                        <Select value={selectedVendorId} onValueChange={handleVendorChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a vendor..." />
                            </SelectTrigger>
                            <SelectContent position="popper" side="bottom">
                                {availableVendors.map(v => (
                                    <SelectItem key={v.id} value={v.id}>
                                        {v.companyName} <span className="text-gray-400 capitalize">({v.category})</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Service Category</Label>
                        <Select value={serviceCategory} onValueChange={setServiceCategory} key={selectedVendorId}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent position="popper" side="bottom">
                                <SelectItem value="venue">Venue</SelectItem>
                                <SelectItem value="catering">Catering</SelectItem>
                                <SelectItem value="photography">Photography</SelectItem>
                                <SelectItem value="videography">Videography</SelectItem>
                                <SelectItem value="decoration">Decoration</SelectItem>
                                <SelectItem value="music">Music / DJ</SelectItem>
                                <SelectItem value="makeup">Makeup Artist</SelectItem>
                                <SelectItem value="transportation">Transportation</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Initial Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent position="popper" side="bottom">
                                <SelectItem value="pending">Pending — Awaiting vendor response</SelectItem>
                                <SelectItem value="quote_requested">Quote Requested — Asked for pricing</SelectItem>
                                <SelectItem value="confirmed">Confirmed — Booking locked in</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes <span className="text-gray-400 font-normal text-xs">(Optional)</span></Label>
                        <Textarea
                            id="notes"
                            name="notes"
                            placeholder="Specific requirements, timing, special instructions..."
                            className="h-20 resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading || !selectedVendorId} className="bg-indigo-600 hover:bg-indigo-700">
                            {loading ? 'Assigning...' : 'Assign Vendor'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
