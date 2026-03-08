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
import { createBudgetItem } from '@/actions/budget'
import { useToast } from '@/components/ui/use-toast'

interface AddExpenseDialogProps {
    eventId: string
    vendors: any[]
}

const CATEGORIES = [
    'venue', 'catering', 'decoration', 'photography', 'entertainment',
    'attire', 'makeup', 'transport', 'invitations', 'gifts', 'miscellaneous'
]

// Map budget expense categories → vendor categories stored in DB
const CATEGORY_TO_VENDOR_CATEGORY: Record<string, string[]> = {
    venue: ['venue'],
    catering: ['catering', 'food'],
    decoration: ['decor', 'decoration'],
    photography: ['photography', 'videography'],
    entertainment: ['entertainment', 'music'],
    attire: ['attire', 'bridal'],
    makeup: ['makeup'],
    transport: ['transport', 'transportation'],
    invitations: [],
    gifts: [],
    miscellaneous: [],
}

export function AddExpenseDialog({ eventId, vendors }: AddExpenseDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<string>('')
    const [selectedVendorId, setSelectedVendorId] = useState<string>('')
    const { toast } = useToast()

    // Filter vendors based on selected category
    const filteredVendors = selectedCategory
        ? vendors.filter(v => {
            const allowed = CATEGORY_TO_VENDOR_CATEGORY[selectedCategory] || []
            return allowed.length === 0
                ? false // categories like invitations/gifts have no vendor type
                : allowed.includes((v.category || '').toLowerCase())
        })
        : vendors

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        formData.append('eventId', eventId)

        const result = await createBudgetItem(formData)

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
                description: 'Expense added to budget',
            })
            setOpen(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Expense
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add Expense</DialogTitle>
                    <DialogDescription>
                        Track estimated or actual costs for the event.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">Category*</Label>
                            <Select
                                name="category"
                                required
                                value={selectedCategory}
                                onValueChange={(val) => {
                                    setSelectedCategory(val)
                                    setSelectedVendorId('') // reset vendor when category changes
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent
                                    position="popper"
                                    side="bottom"
                                    className="bg-white border border-gray-200 shadow-xl z-[300]"
                                >
                                    {CATEGORIES.map((c) => (
                                        <SelectItem key={c} value={c} className="capitalize hover:bg-gray-100 cursor-pointer">
                                            {c}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="estimatedAmount">Estimated Cost*</Label>
                            <Input id="estimatedAmount" name="estimatedAmount" type="number" min="0" step="0.01" required placeholder="0.00" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description / Item Name*</Label>
                        <Input id="description" name="description" placeholder="e.g. Main Hall Rental" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="actualAmount">Actual Cost (Optional)</Label>
                            <Input id="actualAmount" name="actualAmount" type="number" min="0" step="0.01" placeholder="0.00" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="paidAmount">Amount Paid (Optional)</Label>
                            <Input id="paidAmount" name="paidAmount" type="number" min="0" step="0.01" placeholder="0.00" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="vendorId">Vendor (Optional)</Label>
                        <Select
                            name="vendorId"
                            value={selectedVendorId}
                            onValueChange={setSelectedVendorId}
                            disabled={!selectedCategory || filteredVendors.length === 0}
                        >
                            <SelectTrigger>
                                <SelectValue
                                    placeholder={
                                        !selectedCategory
                                            ? 'Select a category first'
                                            : filteredVendors.length === 0
                                                ? 'No vendors for this category'
                                                : 'Select vendor (optional)'
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent
                                position="popper"
                                side="bottom"
                                className="bg-white border border-gray-200 shadow-xl z-[300] max-h-52 overflow-y-auto"
                            >
                                {filteredVendors.map((v) => (
                                    <SelectItem key={v.id} value={v.id} className="hover:bg-gray-100 cursor-pointer py-2">
                                        <span className="flex flex-col gap-0.5">
                                            <span className="font-medium">{v.companyName}</span>
                                            <span className="text-xs text-gray-500 capitalize">
                                                {v.category}{v.priceRange?.min ? ` · From ₹${v.priceRange.min.toLocaleString('en-IN')}` : ''}
                                            </span>
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea id="notes" name="notes" placeholder="Invoice details, payment terms..." />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Add Expense
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
