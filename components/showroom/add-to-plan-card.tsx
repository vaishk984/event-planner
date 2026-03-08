'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Vendor } from '@/lib/types/vendor'
import { useQuote } from '@/components/providers/quote-provider'
import { useEventContext } from '@/components/providers/event-provider'
import { AvailabilityChecker } from './availability-checker'
import { Check, ShoppingBag, CalendarCheck } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { addVendorToEvent as addVendorToEventAction } from '@/lib/actions/event-vendor-actions'
import { VendorCategory } from '@/types/domain'

export function AddToPlanCard({ vendor }: { vendor: Vendor }) {
    const { addToQuote, items } = useQuote()
    const { activeEvent, addVendorToEvent } = useEventContext()
    const router = useRouter()
    const searchParams = useSearchParams()

    const eventId = searchParams.get('eventId')

    const [isAdded, setIsAdded] = useState(false)
    const [isAddedToEvent, setIsAddedToEvent] = useState(false)
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null)

    // Hydration check for button state
    useEffect(() => {
        setIsAdded(items.some(i => i.vendorId === vendor.id))
        if (activeEvent) {
            setIsAddedToEvent(activeEvent.selectedVendors.some(v => v.id === vendor.id))
        }
    }, [items, vendor.id, activeEvent])

    // Add to quote (old flow)
    const handleAddToQuote = () => {
        if (isAdded) {
            router.push('/planner/quotes')
        } else {
            addToQuote(vendor)
        }
    }

    const [isSaving, setIsSaving] = useState(false)

    // Add to current event (new flow)
    const handleAddToEvent = async () => {
        // Determine the target event ID (URL param or active context)
        const targetEventId = eventId || activeEvent?.id

        if (isAddedToEvent && targetEventId) {
            router.push(`/planner/events/${targetEventId}/design`)
        } else if (targetEventId) {
            setIsSaving(true)
            try {
                // Call server action
                const result = await addVendorToEventAction(
                    targetEventId,
                    vendor.id,
                    vendor.category as VendorCategory,
                    vendor.startPrice || 0,
                    { name: vendor.name, imageUrl: vendor.imageUrl }
                )

                if (result.success) {
                    setIsAddedToEvent(true)
                    // Optional: Update local context optimistically if needed, 
                    // but revalidation will handle it on redirect
                    setTimeout(() => {
                        router.push(`/planner/events/${targetEventId}/design`)
                    }, 500)
                } else {
                    alert(`Failed to add vendor: ${result.error}`)
                }
            } catch (error) {
                console.error('Error adding vendor:', error)
                alert('An unexpected error occurred')
            } finally {
                setIsSaving(false)
            }
        }
    }

    const showEventFlow = !!eventId || !!activeEvent

    return (
        <Card className="p-6 sticky top-24 bg-white shadow-xl border-t-4 border-indigo-600">
            <div className="text-center mb-6">
                <h3 className="font-bold text-xl mb-2">Interested?</h3>
                <p className="text-sm text-gray-500">
                    {showEventFlow
                        ? `Add to: ${activeEvent?.name || 'Current Event'}`
                        : 'Check availability and add to your proposal.'
                    }
                </p>
            </div>

            {/* Availability Checker */}
            <div className="mb-4 flex justify-center">
                <AvailabilityChecker
                    vendorId={vendor.id}
                    vendorName={vendor.name}
                    onAvailabilityConfirmed={setIsAvailable}
                />
            </div>

            <div className="space-y-3">
                {/* If coming from an event, show "Add to Event" button */}
                {showEventFlow && (
                    <Button
                        className={`w-full h-12 text-lg transition-all ${isAddedToEvent
                            ? 'bg-green-600 hover:bg-green-700'
                            : isAvailable === false
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                        onClick={handleAddToEvent}
                        disabled={isAvailable === false || isSaving}
                    >
                        {isSaving ? (
                            'Adding to Plan...'
                        ) : isAddedToEvent ? (
                            <>
                                <Check className="w-5 h-5 mr-2" /> Added! Back to Design
                            </>
                        ) : isAvailable === false ? (
                            'Vendor Unavailable'
                        ) : (
                            <>
                                <CalendarCheck className="w-5 h-5 mr-2" /> Add to Event
                            </>
                        )}
                    </Button>
                )}

                {/* Standard quote flow button */}
                <Button
                    className={`w-full h-12 transition-all ${showEventFlow ? 'text-md' : 'text-lg'} ${isAdded
                        ? 'bg-green-600 hover:bg-green-700'
                        : isAvailable === false
                            ? 'bg-gray-400 cursor-not-allowed'
                            : showEventFlow
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                    variant={showEventFlow ? 'outline' : 'default'}
                    onClick={handleAddToQuote}
                    disabled={isAvailable === false}
                >
                    {isAdded ? (
                        <>
                            <Check className="w-5 h-5 mr-2" /> View in Quote
                        </>
                    ) : isAvailable === false ? (
                        'Vendor Unavailable'
                    ) : (
                        'Add to General Quote'
                    )}
                </Button>

                <Button variant="outline" className="w-full">
                    Compare
                </Button>
            </div>

            <div className="mt-6 pt-6 border-t text-center flex justify-center gap-2 items-center text-gray-400">
                <ShoppingBag className="w-4 h-4" />
                <span className="text-xs">
                    {showEventFlow && activeEvent
                        ? `${activeEvent.selectedVendors.length} vendors in event`
                        : `${items.length} items in draft`
                    }
                </span>
            </div>
        </Card>
    )
}
