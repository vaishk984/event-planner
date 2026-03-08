'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Store, Plus } from 'lucide-react'
import { createVendor } from '@/actions/vendors'
import { useRouter } from 'next/navigation'

export function AddVendorDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        // Ensure empty strings are handled if needed, but FormData sends empty string by default

        try {
            const result = await createVendor(formData)
            if (result.success) {
                setOpen(false)
                router.refresh()
            } else {
                alert(result.error)
            }
        } catch (error) {
            console.error(error)
            alert('Failed to add vendor')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                    <Plus className="w-4 h-4" /> Add Vendor
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Vendor</DialogTitle>
                </DialogHeader>

                <form action={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="companyName">Company Name *</Label>
                            <Input id="companyName" name="companyName" required placeholder="Dream Clicks" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">Category *</Label>
                            <Select name="category" required defaultValue="other">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="venue">Venue</SelectItem>
                                    <SelectItem value="catering">Catering</SelectItem>
                                    <SelectItem value="photography">Photography</SelectItem>
                                    <SelectItem value="videography">Videography</SelectItem>
                                    <SelectItem value="decoration">Decoration</SelectItem>
                                    <SelectItem value="music">Music/DJ</SelectItem>
                                    <SelectItem value="makeup">Makeup Artist</SelectItem>
                                    <SelectItem value="transportation">Transportation</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="contactName">Contact Person</Label>
                            <Input id="contactName" name="contactName" placeholder="John Manager" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="contact@vendor.com" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" name="phone" placeholder="+91 98765 43210" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="website">Website</Label>
                            <Input id="website" name="website" placeholder="https://" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Location / City</Label>
                        <Input id="location" name="location" placeholder="Mumbai, India" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="startPrice">Starting Price (₹)</Label>
                            <Input id="startPrice" name="startPrice" type="number" min="0" placeholder="0" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endPrice">Max Price (₹)</Label>
                            <Input id="endPrice" name="endPrice" type="number" min="0" placeholder="0" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description / Notes</Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Services offered, specialties, etc."
                            className="h-20"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Adding...' : 'Add Vendor'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
