'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { createProposal } from '@/lib/actions/proposal-actions'
import { Loader2, Package, Check, DollarSign } from 'lucide-react'
import { toast } from 'sonner'

interface ProposalItemMock {
    id: string
    name: string
    category: string
    price: number
    description: string
}

// Mock items based on typical event needs
const AVAILABLE_ITEMS: ProposalItemMock[] = [
    { id: '1', name: 'Grand Ballroom Venue', category: 'Venue', price: 200000, description: 'Main hall rental' },
    { id: '2', name: 'Premium Catering (Buffet)', category: 'Catering', price: 1500, description: 'Per plate cost' },
    { id: '3', name: 'Luxury Decor Setup', category: 'Decor', price: 75000, description: 'Floral arrangements & stage' },
    { id: '4', name: 'Basic Decor Setup', category: 'Decor', price: 30000, description: 'Minimal floral' },
    { id: '5', name: 'Candid Photography', category: 'Photography', price: 60000, description: '2 days coverage' },
    { id: '6', name: 'Traditional Photography', category: 'Photography', price: 30000, description: 'Standard coverage' },
    { id: '7', name: 'DJ & Sound System', category: 'Entertainment', price: 25000, description: 'Evening party' },
    { id: '8', name: 'Live Band', category: 'Entertainment', price: 50000, description: '3-piece band' },
]

interface PackageBuilderProps {
    eventId: string
    onSuccess?: () => void
}

export function PackageBuilder({ eventId, onSuccess }: PackageBuilderProps) {
    const [loading, setLoading] = useState(false)

    // Matrix of selected items: [itemId]: { silver: boolean, gold: boolean, platinum: boolean }
    const [selections, setSelections] = useState<Record<string, { silver: boolean, gold: boolean, platinum: boolean }>>({})

    // Guest count for calculation
    const [guestCount, setGuestCount] = useState(100)

    const toggleSelection = (itemId: string, tier: 'silver' | 'gold' | 'platinum') => {
        setSelections(prev => {
            const current = prev[itemId] || { silver: false, gold: false, platinum: false }
            return {
                ...prev,
                [itemId]: {
                    ...current,
                    [tier]: !current[tier]
                }
            }
        })
    }

    const calculateTotal = (tier: 'silver' | 'gold' | 'platinum') => {
        let total = 0
        AVAILABLE_ITEMS.forEach(item => {
            if (selections[item.id]?.[tier]) {
                if (item.category === 'Catering') {
                    total += item.price * guestCount
                } else {
                    total += item.price
                }
            }
        })
        return total
    }

    const handleCreatePackages = async () => {
        setLoading(true)
        try {
            const tiers: ('silver' | 'gold' | 'platinum')[] = ['silver', 'gold', 'platinum']

            // Loop through each tier and create a proposal if it has items
            for (const tier of tiers) {
                const tierItems = AVAILABLE_ITEMS.filter(item => selections[item.id]?.[tier])

                if (tierItems.length === 0) continue

                const proposalItems = tierItems.map(item => ({
                    vendorId: 'mock_vendor', // In real app, this comes from item
                    category: item.category as any,
                    name: item.name,
                    description: item.description,
                    quantity: item.category === 'Catering' ? guestCount : 1,
                    unitPrice: item.price,
                    total: item.category === 'Catering' ? item.price * guestCount : item.price
                }))

                // Capitalize first letter
                const title = `${tier.charAt(0).toUpperCase() + tier.slice(1)} Package`

                await createProposal(eventId, title, proposalItems, 0, tier)
            }

            toast.success('Packages created successfully!')
            if (onSuccess) onSuccess()

        } catch (error) {
            console.error(error)
            toast.error('Failed to create packages')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                    <Package className="w-5 h-5 text-indigo-600" />
                    Package Lab
                </CardTitle>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Guests:</span>
                    <Input
                        type="number"
                        value={guestCount}
                        onChange={(e) => setGuestCount(Number(e.target.value))}
                        className="w-20 h-8"
                    />
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left p-3 font-medium text-gray-500 w-[40%]">Service / Item</th>
                                <th className="text-center p-3 font-medium text-gray-600 bg-gray-100 w-[20%]">Silver</th>
                                <th className="text-center p-3 font-medium text-amber-600 bg-amber-50 w-[20%]">Gold</th>
                                <th className="text-center p-3 font-medium text-indigo-600 bg-indigo-50 w-[20%]">Platinum</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {AVAILABLE_ITEMS.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50/50">
                                    <td className="p-3">
                                        <div className="font-medium">{item.name}</div>
                                        <div className="text-xs text-gray-500">
                                            {item.category === 'Catering'
                                                ? `₹${item.price}/plate`
                                                : `₹${item.price.toLocaleString()}`}
                                        </div>
                                    </td>
                                    {(['silver', 'gold', 'platinum'] as const).map(tier => (
                                        <td key={tier} className={`text-center p-3 border-l ${tier === 'gold' ? 'bg-amber-50/30' :
                                            tier === 'platinum' ? 'bg-indigo-50/30' : ''
                                            }`}>
                                            <Checkbox
                                                checked={selections[item.id]?.[tier] || false}
                                                onCheckedChange={() => toggleSelection(item.id, tier)}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            {/* Totals Row */}
                            <tr className="bg-gray-100 font-bold">
                                <td className="p-3 text-right">Total Est.</td>
                                <td className="p-3 text-center">₹{calculateTotal('silver').toLocaleString()}</td>
                                <td className="p-3 text-center text-amber-700 bg-amber-100/50">₹{calculateTotal('gold').toLocaleString()}</td>
                                <td className="p-3 text-center text-indigo-700 bg-indigo-100/50">₹{calculateTotal('platinum').toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="mt-6 flex justify-end">
                    <Button
                        onClick={handleCreatePackages}
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-indigo-700"
                    >
                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                        Generate Packages
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
