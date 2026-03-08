'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

// Complete Client Intake Data Structure
export interface ClientIntakeData {
    // Tab 1: About You
    clientName: string
    phone: string
    email: string
    source: 'whatsapp' | 'instagram' | 'phone' | 'referral' | 'website' | 'other' | ''

    // Tab 2: Event Details
    eventType: 'wedding' | 'birthday' | 'corporate' | 'baby_shower' | 'graduation' | 'anniversary' | 'other' | ''
    eventDate: string
    eventEndDate: string
    isDateFlexible: boolean
    guestCount: number
    city: string

    // Tab 3: Venue Type
    venueType: 'personal' | 'showroom' | ''
    personalVenue: {
        name: string
        address: string
        capacity: number
        type: 'indoor' | 'outdoor' | 'both' | ''
        parking: 'yes' | 'no' | 'limited' | ''
        photos: string[]
        photosSkipped: boolean
    }

    // Tab 4: Food & Catering
    food: {
        dietary: string[]           // veg, non-veg, jain, vegan, halal
        cuisines: string[]          // north-indian, south-indian, continental, etc.
        servingStyle: 'buffet' | 'plated' | 'live_counters' | 'mixed' | ''
        budgetLevel: 'standard' | 'premium' | 'luxury' | ''
        specialRequests: string
        likedVendors: string[]
    }

    // Tab 5: Decor & Theme
    decor: {
        style: 'traditional' | 'modern' | 'fusion' | 'luxury' | 'rustic' | 'bohemian' | ''
        colorMood: 'warm' | 'cool' | 'pastel' | 'bold' | 'gold' | ''
        intensity: 'minimal' | 'moderate' | 'grand' | 'maximum' | ''
        flowers: string[]           // marigold, roses, orchids, lilies
        entranceStyle: string
        stageStyle: string
        lighting: 'fairy_lights' | 'chandeliers' | 'minimal' | 'dramatic' | ''
        specialRequests: string
        likedVendors: string[]
    }

    // Tab 6: Music & Entertainment
    entertainment: {
        type: 'dj' | 'live_band' | 'cultural' | 'none' | ''
        genres: string[]            // bollywood, sufi, classical, western
        soundLevel: 'moderate' | 'loud' | 'concert' | ''
        performances: string[]      // dhol, dance-troupe, singer
        specialRequests: string
        likedVendors: string[]
    }

    // Tab 7: Photography & Video
    photography: {
        package: 'basic' | 'full' | 'premium' | 'own' | ''
        style: 'candid' | 'traditional' | 'cinematic' | 'mixed' | ''
        drone: boolean
        preWedding: boolean
        album: 'digital' | 'printed' | 'premium' | ''
        specialRequests: string
        likedVendors: string[]
    }

    // Tab 8: Additional Services
    services: {
        makeup: boolean
        mehendi: boolean
        anchor: boolean
        valet: boolean
        transport: boolean
        pandit: boolean
        fireworks: boolean
        dhol: boolean
        staffCount: number
        furnitureNeeds: string
        specialRequests: string
        likedVendors: string[]
    }

    // Tab 9: General style (already built)
    budgetRange: number
    budgetMin: number
    budgetMax: number
    stylePreference: 'traditional' | 'modern' | 'fusion' | 'minimal' | ''
    colorMood: 'warm' | 'cool' | 'pastel' | 'bold' | ''
    specialRequests: string

    // Browse
    likedVendors: string[]

    // Meta
    currentTab: number
    isComplete: boolean
    submittedAt: string | null
}

export const DEFAULT_INTAKE_DATA: ClientIntakeData = {
    clientName: '',
    phone: '',
    email: '',
    source: '',
    eventType: '',
    eventDate: '',
    eventEndDate: '',
    isDateFlexible: false,
    guestCount: 150,
    city: '',
    venueType: '',
    personalVenue: {
        name: '',
        address: '',
        capacity: 0,
        type: '',
        parking: '',
        photos: [],
        photosSkipped: false
    },
    food: {
        dietary: [],
        cuisines: [],
        servingStyle: '',
        budgetLevel: '',
        specialRequests: '',
        likedVendors: []
    },
    decor: {
        style: '',
        colorMood: '',
        intensity: '',
        flowers: [],
        entranceStyle: '',
        stageStyle: '',
        lighting: '',
        specialRequests: '',
        likedVendors: []
    },
    entertainment: {
        type: '',
        genres: [],
        soundLevel: '',
        performances: [],
        specialRequests: '',
        likedVendors: []
    },
    photography: {
        package: '',
        style: '',
        drone: false,
        preWedding: false,
        album: '',
        specialRequests: '',
        likedVendors: []
    },
    services: {
        makeup: false,
        mehendi: false,
        anchor: false,
        valet: false,
        transport: false,
        pandit: false,
        fireworks: false,
        dhol: false,
        staffCount: 0,
        furnitureNeeds: '',
        specialRequests: '',
        likedVendors: []
    },
    budgetRange: 50,
    budgetMin: 1000000,
    budgetMax: 5000000,
    stylePreference: '',
    colorMood: '',
    specialRequests: '',
    likedVendors: [],
    currentTab: 1,
    isComplete: false,
    submittedAt: null
}

interface ClientIntakeContextType {
    data: ClientIntakeData
    updateData: <K extends keyof ClientIntakeData>(key: K, value: ClientIntakeData[K]) => void
    updateFood: (updates: Partial<ClientIntakeData['food']>) => void
    updateDecor: (updates: Partial<ClientIntakeData['decor']>) => void
    updateEntertainment: (updates: Partial<ClientIntakeData['entertainment']>) => void
    updatePhotography: (updates: Partial<ClientIntakeData['photography']>) => void
    updateServices: (updates: Partial<ClientIntakeData['services']>) => void
    updatePersonalVenue: (updates: Partial<ClientIntakeData['personalVenue']>) => void
    toggleLikedVendor: (vendorId: string) => void
    toggleCategoryLikedVendor: (category: 'food' | 'decor' | 'entertainment' | 'photography' | 'services', vendorId: string) => void
    goToTab: (tab: number) => void
    submitIntake: () => void
    resetIntake: () => void
}

const ClientIntakeContext = createContext<ClientIntakeContextType | undefined>(undefined)

export function ClientIntakeProvider({ children, token, plannerId }: { children: ReactNode; token: string; plannerId?: string }) {
    const [data, setData] = useState<ClientIntakeData>(() => {
        return { ...DEFAULT_INTAKE_DATA }
    })

    const updateData = <K extends keyof ClientIntakeData>(key: K, value: ClientIntakeData[K]) => {
        setData(prev => ({ ...prev, [key]: value }))
    }

    const updateFood = (updates: Partial<ClientIntakeData['food']>) => {
        setData(prev => ({ ...prev, food: { ...prev.food, ...updates } }))
    }

    const updateDecor = (updates: Partial<ClientIntakeData['decor']>) => {
        setData(prev => ({ ...prev, decor: { ...prev.decor, ...updates } }))
    }

    const updateEntertainment = (updates: Partial<ClientIntakeData['entertainment']>) => {
        setData(prev => ({ ...prev, entertainment: { ...prev.entertainment, ...updates } }))
    }

    const updatePhotography = (updates: Partial<ClientIntakeData['photography']>) => {
        setData(prev => ({ ...prev, photography: { ...prev.photography, ...updates } }))
    }

    const updateServices = (updates: Partial<ClientIntakeData['services']>) => {
        setData(prev => ({ ...prev, services: { ...prev.services, ...updates } }))
    }

    const updatePersonalVenue = (updates: Partial<ClientIntakeData['personalVenue']>) => {
        setData(prev => ({
            ...prev,
            personalVenue: { ...prev.personalVenue, ...updates }
        }))
    }

    const toggleLikedVendor = (vendorId: string) => {
        setData(prev => {
            const isLiked = prev.likedVendors.includes(vendorId)
            return {
                ...prev,
                likedVendors: isLiked
                    ? prev.likedVendors.filter(id => id !== vendorId)
                    : [...prev.likedVendors, vendorId]
            }
        })
    }

    const toggleCategoryLikedVendor = (category: 'food' | 'decor' | 'entertainment' | 'photography' | 'services', vendorId: string) => {
        setData(prev => {
            const categoryData = prev[category]
            const likedVendors = categoryData.likedVendors || []
            const isLiked = likedVendors.includes(vendorId)
            return {
                ...prev,
                [category]: {
                    ...categoryData,
                    likedVendors: isLiked
                        ? likedVendors.filter((id: string) => id !== vendorId)
                        : [...likedVendors, vendorId]
                }
            }
        })
    }

    const goToTab = (tab: number) => {
        setData(prev => ({ ...prev, currentTab: tab }))
    }

    const submitIntake = async () => {
        const submittedAt = new Date().toISOString()
        setData(prev => ({
            ...prev,
            isComplete: true,
            submittedAt
        }))

        // Save to intake repository using unified API
        if (typeof window !== 'undefined') {
            const { saveClientSubmission } = await import('@/lib/actions/intake-actions')

            // Map ClientIntakeData to Intake type
            const intakeData = {
                token: token,
                plannerId: plannerId, // <--- Pass explicit planner ID if available
                createdBy: plannerId ? 'planner' : 'client' as const, // infer creator type
                status: 'submitted' as const,
                currentTab: data.currentTab,

                // Client details
                clientName: data.clientName,
                phone: data.phone,
                email: data.email,
                source: data.source || undefined,

                // Event basics
                eventType: data.eventType || undefined,
                eventDate: data.eventDate,
                eventEndDate: data.eventEndDate,
                isDateFlexible: data.isDateFlexible,
                guestCount: data.guestCount,
                budgetMin: data.budgetMin,
                budgetMax: data.budgetMax,
                city: data.city,
                venueType: data.venueType || undefined,

                // Personal venue
                personalVenue: {
                    name: data.personalVenue.name,
                    address: data.personalVenue.address,
                    capacity: data.personalVenue.capacity,
                    type: data.personalVenue.type || '',
                    parking: data.personalVenue.parking || '',
                    photos: data.personalVenue.photos,
                    photosSkipped: data.personalVenue.photosSkipped,
                },

                // Preferences
                food: {
                    cuisines: data.food.cuisines,
                    dietary: data.food.dietary,
                    servingStyle: data.food.servingStyle,
                    budgetLevel: data.food.budgetLevel,
                    specialRequests: data.food.specialRequests,
                    likedVendors: data.food.likedVendors,
                },
                decor: {
                    style: data.decor.style,
                    colorMood: data.decor.colorMood,
                    intensity: data.decor.intensity,
                    lighting: data.decor.lighting,
                    flowers: data.decor.flowers,
                    specialRequests: data.decor.specialRequests,
                    likedVendors: data.decor.likedVendors,
                },
                entertainment: {
                    type: data.entertainment.type,
                    genres: data.entertainment.genres,
                    specialRequests: data.entertainment.specialRequests,
                    likedVendors: data.entertainment.likedVendors,
                },
                photography: {
                    package: data.photography.package,
                    drone: data.photography.drone,
                    preWedding: data.photography.preWedding,
                    specialRequests: data.photography.specialRequests,
                    likedVendors: data.photography.likedVendors,
                },
                services: {
                    makeup: data.services.makeup,
                    mehendi: data.services.mehendi,
                    anchor: data.services.anchor,
                    valet: data.services.valet,
                    pandit: data.services.pandit,
                    specialRequests: data.services.specialRequests,
                },

                // Liked vendors
                likedVendors: data.likedVendors,
                specialRequests: data.specialRequests,

                // Timestamps
                submittedAt,
            }

            const result = await saveClientSubmission(intakeData as any)
            if (result.success) {
                console.log('Intake saved:', result.data)
            } else {
                console.error('Failed to save intake:', result.error)
            }
        }

        console.log('Intake submitted:', data)
    }

    const resetIntake = () => {
        setData(DEFAULT_INTAKE_DATA)
    }

    return (
        <ClientIntakeContext.Provider value={{
            data,
            updateData,
            updateFood,
            updateDecor,
            updateEntertainment,
            updatePhotography,
            updateServices,
            updatePersonalVenue,
            toggleLikedVendor,
            toggleCategoryLikedVendor,
            goToTab,
            submitIntake,
            resetIntake
        }}>
            {children}
        </ClientIntakeContext.Provider>
    )
}

export function useClientIntake() {
    const context = useContext(ClientIntakeContext)
    if (!context) {
        throw new Error('useClientIntake must be used within ClientIntakeProvider')
    }
    return context
}

export function getBudgetFromSlider(value: number): { min: number; max: number; label: string } {
    if (value < 20) return { min: 500000, max: 1000000, label: '₹5-10 Lakhs' }
    if (value < 40) return { min: 1000000, max: 2000000, label: '₹10-20 Lakhs' }
    if (value < 60) return { min: 2000000, max: 3000000, label: '₹20-30 Lakhs' }
    if (value < 80) return { min: 3000000, max: 5000000, label: '₹30-50 Lakhs' }
    return { min: 5000000, max: 10000000, label: '₹50 Lakhs+' }
}
