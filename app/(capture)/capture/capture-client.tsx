'use client'

import Link from 'next/link'
import { ClientIntakeProvider, useClientIntake } from '@/components/providers/client-intake-provider'
import { Tab1Start } from '@/components/client-portal/tabs/tab-1-start'
import { Tab2Event } from '@/components/client-portal/tabs/tab-2-event'
import { Tab2bVenuePhotos } from '@/components/client-portal/tabs/tab-2b-venue-photos'
import { Tab4Food } from '@/components/client-portal/tabs/tab-4-food'
import { Tab5Decor } from '@/components/client-portal/tabs/tab-5-decor'
import { Tab6Entertainment } from '@/components/client-portal/tabs/tab-6-entertainment'
import { Tab7Photography } from '@/components/client-portal/tabs/tab-7-photography'
import { Tab8Services } from '@/components/client-portal/tabs/tab-8-services'
import { Tab4Browse } from '@/components/client-portal/tabs/tab-4-browse'
import { Tab5Done } from '@/components/client-portal/tabs/tab-5-done'
import { ClientTabNavigation } from '@/components/client-portal/client-tab-navigation'
import { X, ClipboardCheck } from 'lucide-react'

// Content component that uses the context
function CaptureContent() {
    const { data } = useClientIntake()

    // Same logic as client portal
    const hasPersonalVenue = data.venueType === 'personal'
    const totalTabs = hasPersonalVenue ? 10 : 9

    const getDisplayTab = () => {
        if (hasPersonalVenue) return data.currentTab
        if (data.currentTab <= 2) return data.currentTab
        return data.currentTab - 1
    }

    const renderTabContent = () => {
        if (hasPersonalVenue) {
            switch (data.currentTab) {
                case 1: return <Tab1Start />
                case 2: return <Tab2Event />
                case 3: return <Tab2bVenuePhotos />
                case 4: return <Tab4Food />
                case 5: return <Tab5Decor />
                case 6: return <Tab6Entertainment />
                case 7: return <Tab7Photography />
                case 8: return <Tab8Services />
                case 9: return <Tab4Browse />
                case 10: return <Tab5Done />
                default: return <Tab1Start />
            }
        } else {
            switch (data.currentTab) {
                case 1: return <Tab1Start />
                case 2: return <Tab2Event />
                case 3: return <Tab4Food />
                case 4: return <Tab5Decor />
                case 5: return <Tab6Entertainment />
                case 6: return <Tab7Photography />
                case 7: return <Tab8Services />
                case 8: return <Tab4Browse />
                case 9: return <Tab5Done />
                default: return <Tab1Start />
            }
        }
    }

    return (
        <>
            <ClientTabNavigation
                currentTab={getDisplayTab()}
                totalTabs={totalTabs}
                hasPersonalVenue={hasPersonalVenue}
            />
            <div className="animate-in fade-in duration-300">
                {renderTabContent()}
            </div>
        </>
    )
}

export function CaptureClientWrapper({ token, plannerId }: { token: string; plannerId?: string }) {
    return (
        <ClientIntakeProvider token={token} plannerId={plannerId}>
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
                {/* Planner Header */}
                <header className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-50">
                    <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link href="/planner" className="mr-2">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                                    <X className="w-4 h-4 text-gray-600" />
                                </div>
                            </Link>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                                <ClipboardCheck className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="font-bold text-gray-900">Capture Requirements</h1>
                                <p className="text-xs text-gray-500">On-site client intake (same as client portal)</p>
                            </div>
                        </div>
                        <div className="text-sm text-gray-400">
                            Filling as <span className="text-orange-600 font-medium">Planner</span>
                        </div>
                    </div>
                </header>

                {/* Main - Exact same as client portal */}
                <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
                    <CaptureContent />
                </main>

                {/* Footer */}
                <footer className="border-t border-orange-100 bg-white/50 py-6">
                    <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-400">
                        <p>© 2025 PlannerOS • Capturing client requirements on-site</p>
                    </div>
                </footer>
            </div>
        </ClientIntakeProvider>
    )
}
