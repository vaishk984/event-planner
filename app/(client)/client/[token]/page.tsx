'use client'

import { use } from 'react'
import { ClientIntakeProvider } from '@/components/providers/client-intake-provider'
import { useClientIntake } from '@/components/providers/client-intake-provider'
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

// Content component that uses the context
function ClientPortalContent() {
    const { data } = useClientIntake()

    // 10 tabs for complete flow:
    // 1: Start, 2: Event, 3: Venue (if personal), 4: Food, 5: Decor, 
    // 6: Entertainment, 7: Photo, 8: Services, 9: Browse, 10: Done
    const hasPersonalVenue = data.venueType === 'personal'
    const totalTabs = hasPersonalVenue ? 10 : 9

    // Get display tab number (for progress)
    const getDisplayTab = () => {
        if (hasPersonalVenue) return data.currentTab
        // Without venue photo tab, shift tabs after 2
        if (data.currentTab <= 2) return data.currentTab
        return data.currentTab - 1
    }

    // Render current tab content based on internal tab number
    const renderTabContent = () => {
        if (hasPersonalVenue) {
            // Full 10-tab flow with venue photos
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
            // 9-tab flow without venue photos
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

// Wrapper with provider and layout
function ClientPortalWrapper({ token }: { token: string }) {
    return (
        <ClientIntakeProvider token={token}>
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
                    <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">P</span>
                            </div>
                            <div>
                                <h1 className="font-bold text-gray-900">PlannerOS</h1>
                                <p className="text-xs text-gray-500">Event Planning Made Easy</p>
                            </div>
                        </div>
                        <div className="text-sm text-gray-400">
                            Need help? <a href="tel:+919876543210" className="text-indigo-600 font-medium">Call us</a>
                        </div>
                    </div>
                </header>

                {/* Main */}
                <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
                    <ClientPortalContent />
                </main>

                {/* Footer */}
                <footer className="border-t bg-white/50 py-6">
                    <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-400">
                        <p>© 2025 PlannerOS • Making your events unforgettable</p>
                    </div>
                </footer>
            </div>
        </ClientIntakeProvider>
    )
}

// Page component - unwrap params promise with React.use()
export default function ClientIntakePage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params)
    return <ClientPortalWrapper token={token} />
}
