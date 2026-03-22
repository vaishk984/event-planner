'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    FileText, CheckCircle2, Users, Palette, Package, Send,
    ChevronRight, Loader2, ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

// Panel Components
import { BriefPanel } from '@/components/builder/brief-panel'
import { FeasibilityPanel } from '@/components/builder/feasibility-panel'
import { VendorPanel } from '@/components/builder/vendor-panel'
import { DesignPanel } from '@/components/builder/design-panel'
import { PackagePanel } from '@/components/builder/package-panel'
import { SendPanel } from '@/components/builder/send-panel'

// Types
import type { Event, Intake, Vendor, EventVendor, ProposalItem, VendorCategory } from '@/types/domain'
import { getRequestsForEvent } from '@/actions/booking'
import { getEvent } from '@/lib/actions/event-actions'
import { getIntake } from '@/lib/actions/intake-actions'

interface BuilderState {
    shortlist: {
        confirmed: Vendor[]
        maybe: Vendor[]
    }
    design: {
        moodboard: string[]
        colors: string[]
        notes: string
    }
    packages: {
        silver: ProposalItem[]
        gold: ProposalItem[]
        platinum: ProposalItem[]
    }
}

const PANELS = [
    { id: 'brief', label: 'Brief', icon: FileText, description: 'Client Requirements' },
    { id: 'feasibility', label: 'Feasibility', icon: CheckCircle2, description: 'Validate Viability' },
    { id: 'vendors', label: 'Vendors', icon: Users, description: 'Source & Compare' },
    { id: 'design', label: 'Design', icon: Palette, description: 'Visual Planning' },
    { id: 'package', label: 'Package', icon: Package, description: 'Build Tiers' },
    { id: 'send', label: 'Send', icon: Send, description: 'Finalize & Share' },
]

export default function ProposalBuilderPage() {
    const params = useParams()
    const eventId = params.id as string

    const [activePanel, setActivePanel] = useState('brief')
    const [loading, setLoading] = useState(true)
    const [event, setEvent] = useState<Event | null>(null)
    const [intake, setIntake] = useState<Intake | null>(null)

    const [builderState, setBuilderState] = useState<BuilderState>({
        shortlist: { confirmed: [], maybe: [] },
        design: { moodboard: [], colors: ['#D4AF37', '#8B0000', '#FFFAF0'], notes: '' },
        packages: { silver: [], gold: [], platinum: [] }
    })

    // Load event data
    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            try {
                // Fetch real booking requests (instead of event_vendors)
                const requests = await getRequestsForEvent(eventId)

                // Map BookingRequests to Vendor objects for the UI
                interface BookingRequestData {
                    status: string
                    vendorId: string
                    vendorName?: string
                    vendorCategory?: string
                    vendorPrice?: number
                    vendorRating?: number
                    vendorImage?: string
                    vendorDescription?: string
                    budget?: number
                    city?: string
                    createdAt?: string
                    updatedAt?: string
                }
                const confirmedVendors: Vendor[] = (requests as unknown as BookingRequestData[])
                    .filter((req) => req.status !== 'declined' && req.status !== 'cancelled')
                    .map((req) => ({
                        id: req.vendorId,
                        name: req.vendorName || 'Unknown Vendor',
                        category: (req.vendorCategory || 'venue') as VendorCategory,
                        basePrice: req.vendorPrice || req.budget || 0,
                        // Default values for required Vendor fields
                        rating: req.vendorRating || 0,
                        reviewCount: 0,
                        city: req.city || 'Unknown',
                        isVerified: false,
                        isActive: true,
                        serviceAreas: [],
                        priceRange: 'mid' as const,
                        currency: 'INR',
                        images: req.vendorImage ? [req.vendorImage] : [],
                        createdAt: req.createdAt || new Date().toISOString(),
                        updatedAt: req.updatedAt || new Date().toISOString(),
                        description: req.vendorDescription || 'Assigned Vendor',
                        phone: '',
                        email: ''
                    }))

                setBuilderState(prev => ({
                    ...prev,
                    shortlist: {
                        ...prev.shortlist,
                        confirmed: confirmedVendors
                    }
                }))

                const mappedEvent = await getEvent(eventId)
                if (!mappedEvent) {
                    setEvent(null)
                    setIntake(null)
                    return
                }

                // Fetch intake if available
                let intakeData: Intake | null = null
                if (mappedEvent.submissionId) {
                    intakeData = await getIntake(mappedEvent.submissionId)
                }

                setEvent(mappedEvent)
                setIntake(intakeData)
            } catch (error) {
                console.error('Failed to load data:', error)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [eventId])

    const updateShortlist = (shortlist: BuilderState['shortlist']) => {
        setBuilderState(prev => ({ ...prev, shortlist }))
    }

    const updateDesign = (design: BuilderState['design']) => {
        setBuilderState(prev => ({ ...prev, design }))
    }

    const updatePackages = (packages: BuilderState['packages']) => {
        setBuilderState(prev => ({ ...prev, packages }))
    }

    const goToNextPanel = () => {
        const currentIndex = PANELS.findIndex(p => p.id === activePanel)
        if (currentIndex < PANELS.length - 1) {
            setActivePanel(PANELS[currentIndex + 1].id)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        )
    }

    if (!event) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Event not found</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/planner/events/${eventId}`}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Proposal Builder</h1>
                        <p className="text-sm text-gray-500">
                            {event.name} • {new Date(event.date).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric'
                            })} • {event.guestCount} guests
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-right mr-4">
                        <p className="text-sm text-gray-500">Budget</p>
                        <p className="font-bold text-green-600">
                            ₹{((event.budgetMax || 0) / 100000).toFixed(1)}L
                        </p>
                    </div>
                    <Button variant="outline">Save Draft</Button>
                    <Button className="bg-orange-500 hover:bg-orange-600">
                        Preview Proposal
                    </Button>
                </div>
            </div>

            {/* Panel Navigation */}
            <div className="bg-white rounded-xl border shadow-sm p-2">
                <div className="flex items-center gap-1">
                    {PANELS.map((panel, index) => {
                        const Icon = panel.icon
                        const isActive = activePanel === panel.id
                        const isPast = PANELS.findIndex(p => p.id === activePanel) > index

                        return (
                            <button
                                key={panel.id}
                                onClick={() => setActivePanel(panel.id)}
                                className={`
                                    flex-1 flex items-center gap-2 px-4 py-3 rounded-lg transition-all
                                    ${isActive
                                        ? 'bg-orange-50 border-2 border-orange-500 text-orange-700'
                                        : isPast
                                            ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                            : 'hover:bg-gray-50 text-gray-500'
                                    }
                                `}
                            >
                                <div className={`
                                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                                    ${isActive
                                        ? 'bg-orange-500 text-white'
                                        : isPast
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-200 text-gray-600'
                                    }
                                `}>
                                    {isPast ? '✓' : index + 1}
                                </div>
                                <div className="text-left hidden lg:block">
                                    <p className="font-medium text-sm">{panel.label}</p>
                                    <p className="text-xs opacity-70">{panel.description}</p>
                                </div>
                                {index < PANELS.length - 1 && (
                                    <ChevronRight className="w-4 h-4 ml-auto text-gray-300 hidden xl:block" />
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Panel Content */}
            <div className="bg-white rounded-xl border shadow-sm min-h-[500px]">
                {activePanel === 'brief' && (
                    <BriefPanel
                        event={event}
                        intake={intake}
                        onNext={goToNextPanel}
                    />
                )}
                {activePanel === 'feasibility' && (
                    <FeasibilityPanel
                        event={event}
                        onNext={goToNextPanel}
                    />
                )}
                {activePanel === 'vendors' && (
                    <VendorPanel
                        event={event}
                        shortlist={builderState.shortlist}
                        onUpdateShortlist={updateShortlist}
                        onNext={goToNextPanel}
                    />
                )}
                {activePanel === 'design' && (
                    <DesignPanel
                        event={event}
                        design={builderState.design}
                        onUpdateDesign={updateDesign}
                        onNext={goToNextPanel}
                    />
                )}
                {activePanel === 'package' && (
                    <PackagePanel
                        event={event}
                        shortlist={builderState.shortlist}
                        packages={builderState.packages}
                        onUpdatePackages={updatePackages}
                        onNext={goToNextPanel}
                    />
                )}
                {activePanel === 'send' && (
                    <SendPanel
                        event={event}
                        packages={builderState.packages}
                        design={builderState.design}
                        vendors={builderState.shortlist.confirmed.map((v: Vendor) => ({
                            vendorId: v.id,
                            eventId: event.id,
                            status: 'confirmed' as const,
                            vendorCategory: v.category,
                            vendorName: v.name,
                            agreedAmount: v.basePrice || 0,
                            addedAt: new Date().toISOString(),
                            id: v.id,
                            category: v.category,
                            price: v.basePrice || 0,
                            vendorPhone: '',
                        } as EventVendor))}
                    />
                )}
            </div>
        </div>
    )
}
