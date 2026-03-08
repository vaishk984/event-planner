'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, Calendar, Users, MapPin, ChevronRight, ChevronLeft, Check, Loader2 } from 'lucide-react'
import { ClientIntakeProvider, useClientIntake } from '@/components/providers/client-intake-provider'
import { intakeRepository } from '@/lib/repositories/intake-repository'
import type { Intake } from '@/types/domain'

// Import tab components
import { Tab1Start } from '@/components/client-portal/tabs/tab-1-start'
import { Tab2Event } from '@/components/client-portal/tabs/tab-2-event'
import { Tab2bVenuePhotos } from '@/components/client-portal/tabs/tab-2b-venue-photos'
import { Tab3Style } from '@/components/client-portal/tabs/tab-3-style'
import { Tab4Food } from '@/components/client-portal/tabs/tab-4-food'
import { Tab5Decor } from '@/components/client-portal/tabs/tab-5-decor'
import { Tab6Entertainment } from '@/components/client-portal/tabs/tab-6-entertainment'
import { Tab7Photography } from '@/components/client-portal/tabs/tab-7-photography'
import { Tab8Services } from '@/components/client-portal/tabs/tab-8-services'
import { Tab5Done } from '@/components/client-portal/tabs/tab-5-done'

// Tab configuration matching existing components
const TABS = [
    { id: 1, name: 'About You', icon: Sparkles },
    { id: 2, name: 'Event Details', icon: Calendar },
    { id: 3, name: 'Style & Theme', icon: Sparkles },
    { id: 4, name: 'Food & Catering', icon: Users },
    { id: 5, name: 'Decor', icon: Sparkles },
    { id: 6, name: 'Entertainment', icon: Users },
    { id: 7, name: 'Photography', icon: Users },
    { id: 8, name: 'Additional Services', icon: Users },
    { id: 9, name: 'Review & Submit', icon: Check },
]

function IntakeContent() {
    const { data, goToTab } = useClientIntake()
    const currentTab = data.currentTab

    // Determine which tabs to show based on venue type
    const showVenuePhotos = data.venueType === 'personal'

    const getTabComponent = () => {
        switch (currentTab) {
            case 1: return <Tab1Start />
            case 2: return <Tab2Event />
            case 2.75: return showVenuePhotos ? <Tab2bVenuePhotos /> : null
            case 3: return <Tab3Style />
            case 4: return <Tab4Food />
            case 5: return <Tab5Decor />
            case 6: return <Tab6Entertainment />
            case 7: return <Tab7Photography />
            case 8: return <Tab8Services />
            case 9: return <Tab5Done />
            default: return <Tab1Start />
        }
    }

    const getCurrentTabIndex = () => {
        const tabMap: Record<number, number> = { 1: 0, 2: 1, 2.75: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9 }
        return tabMap[currentTab] || 0
    }

    const getTotalTabs = () => showVenuePhotos ? 10 : 9

    const getNextTab = () => {
        switch (currentTab) {
            case 1: return 2
            case 2: return data.venueType === 'personal' ? 2.75 : 3
            case 2.75: return 3
            case 3: return 4
            case 4: return 5
            case 5: return 6
            case 6: return 7
            case 7: return 8
            case 8: return 9
            default: return currentTab
        }
    }

    const getPrevTab = () => {
        switch (currentTab) {
            case 2: return 1
            case 2.75: return 2
            case 3: return data.venueType === 'personal' ? 2.75 : 2
            case 4: return 3
            case 5: return 4
            case 6: return 5
            case 7: return 6
            case 8: return 7
            case 9: return 8
            default: return currentTab
        }
    }

    const progress = Math.round((getCurrentTabIndex() / (getTotalTabs() - 1)) * 100)

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-orange-100">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="font-bold text-gray-900">Share Your Vision</h1>
                                <p className="text-xs text-gray-500">Tell us about your dream event</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-medium text-orange-600">{progress}% Complete</p>
                            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                                <div
                                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <Card className="bg-white/90 backdrop-blur border-orange-100 shadow-lg">
                    <div className="p-6 md:p-8">
                        {getTabComponent()}
                    </div>
                </Card>

                {/* Navigation */}
                {currentTab !== 6 && (
                    <div className="flex justify-between mt-6">
                        <Button
                            variant="outline"
                            onClick={() => goToTab(getPrevTab())}
                            disabled={currentTab === 1}
                            className="gap-2"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Back
                        </Button>
                        <Button
                            onClick={() => goToTab(getNextTab())}
                            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 gap-2"
                        >
                            Continue
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-orange-100 py-3">
                <div className="max-w-4xl mx-auto px-4">
                    <p className="text-xs text-center text-gray-400">
                        Powered by <span className="font-semibold text-orange-600">PlannerOS</span>
                    </p>
                </div>
            </div>
        </div>
    )
}

function IntakeLoader({ token }: { token: string }) {
    const [intake, setIntake] = useState<Intake | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadIntake()
    }, [token])

    const loadIntake = async () => {
        setLoading(true)
        try {
            const found = await intakeRepository.findByToken(token)
            if (!found) {
                setError('This link is invalid or has expired.')
                return
            }
            if (found.status === 'converted') {
                setError('This intake has already been submitted and processed.')
                return
            }
            setIntake(found)
        } catch (err) {
            setError('Failed to load intake form.')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
                    <p className="text-gray-600">Loading your form...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="p-8 max-w-md text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Oops!</h2>
                    <p className="text-gray-600">{error}</p>
                </Card>
            </div>
        )
    }

    if (!intake) return null

    return (
        <ClientIntakeProvider token={token}>
            <IntakeContent />
        </ClientIntakeProvider>
    )
}

export default function IntakePage() {
    const params = useParams()
    const token = params?.token as string

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="p-8 max-w-md text-center">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Link</h2>
                    <p className="text-gray-600">This link appears to be invalid.</p>
                </Card>
            </div>
        )
    }

    return <IntakeLoader token={token} />
}
