// Complete Event Plan Data Structure

export interface EventPlan {
    id?: string

    // Step 1: Basics
    basics: {
        eventName: string
        eventType: 'wedding' | 'corporate' | 'birthday' | 'anniversary' | 'other'
        eventDate: string
        eventTime: string
        guestCount: number
        budget: number
        clientVision: string // Freeform notes from consultation
        referenceImages?: string[]
    }

    // Step 2: Venue
    venue: {
        type: 'platform' | 'custom'
        venueId?: string // If platform venue
        venueName: string
        venueAddress: string
        venueCity: string
        capacity: number
        venueCost: number
        venueFeatures: string[]
        floorPlanUrl?: string
        logisticsNotes: string
    }

    // Step 3: Theme & Decor
    themeDecor: {
        themeName: string // Modern, Traditional, Fusion, Bohemian, etc.
        colorPalette: string[] // Hex colors
        decorStyle: 'floral' | 'minimal' | 'grand' | 'rustic' | 'contemporary'
        decorDescription: string
        moodBoardImages: string[]
        decorVendorId?: string
        decorVendorName?: string
        decorCost: number
    }

    // Step 4: Catering
    catering: {
        cuisineTypes: string[] // Indian, Continental, Chinese, etc.
        menuStyle: 'buffet' | 'plated' | 'live_counters' | 'mixed'
        dietaryOptions: string[] // Veg, Non-veg, Jain, Vegan
        menuHighlights: string[]
        catererVendorId?: string
        catererVendorName?: string
        perPlateCost: number
        cateringCost: number
    }

    // Step 5: Entertainment & Services
    entertainment: {
        entertainmentType: 'dj' | 'live_band' | 'cultural' | 'none'
        entertainmentVendorId?: string
        entertainmentVendorName?: string
        entertainmentCost: number

        photographyPackage: 'basic' | 'premium' | 'luxury' | 'none'
        photographyVendorId?: string
        photographyVendorName?: string
        photographyCost: number

        additionalServices: {
            name: string
            vendorName?: string
            cost: number
        }[]
    }

    // Step 6: Timeline
    timeline: {
        eventDaySchedule: {
            time: string
            activity: string
            responsible: string
            notes?: string
        }[]
        milestones: {
            date: string
            milestone: string
            completed: boolean
        }[]
    }

    // Calculated totals
    totals: {
        venueCost: number
        decorCost: number
        cateringCost: number
        entertainmentCost: number
        photographyCost: number
        additionalServicesCost: number
        subtotal: number
        platformFee: number
        grandTotal: number
    }

    // Metadata
    status: 'draft' | 'proposal_sent' | 'approved' | 'confirmed'
    createdAt: string
    updatedAt: string
}

// Default empty event plan
export const DEFAULT_EVENT_PLAN: EventPlan = {
    basics: {
        eventName: '',
        eventType: 'wedding',
        eventDate: '',
        eventTime: '18:00',
        guestCount: 200,
        budget: 1000000,
        clientVision: '',
    },
    venue: {
        type: 'platform',
        venueName: '',
        venueAddress: '',
        venueCity: '',
        capacity: 0,
        venueCost: 0,
        venueFeatures: [],
        logisticsNotes: '',
    },
    themeDecor: {
        themeName: '',
        colorPalette: ['#6366f1', '#8b5cf6', '#ec4899'],
        decorStyle: 'floral',
        decorDescription: '',
        moodBoardImages: [],
        decorCost: 0,
    },
    catering: {
        cuisineTypes: [],
        menuStyle: 'buffet',
        dietaryOptions: ['veg', 'non-veg'],
        menuHighlights: [],
        perPlateCost: 1500,
        cateringCost: 0,
    },
    entertainment: {
        entertainmentType: 'dj',
        entertainmentCost: 0,
        photographyPackage: 'premium',
        photographyCost: 0,
        additionalServices: [],
    },
    timeline: {
        eventDaySchedule: [],
        milestones: [],
    },
    totals: {
        venueCost: 0,
        decorCost: 0,
        cateringCost: 0,
        entertainmentCost: 0,
        photographyCost: 0,
        additionalServicesCost: 0,
        subtotal: 0,
        platformFee: 0,
        grandTotal: 0,
    },
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
}

// Theme options
export const THEME_OPTIONS = [
    { id: 'modern', name: 'Modern Elegance', description: 'Clean lines, contemporary aesthetics' },
    { id: 'traditional', name: 'Traditional', description: 'Classic, cultural, timeless' },
    { id: 'fusion', name: 'Fusion', description: 'Blend of modern and traditional' },
    { id: 'bohemian', name: 'Bohemian', description: 'Free-spirited, artistic, eclectic' },
    { id: 'rustic', name: 'Rustic', description: 'Natural, organic, earthy tones' },
    { id: 'luxury', name: 'Luxury Grand', description: 'Opulent, grand, extravagant' },
]

// Decor style options
export const DECOR_STYLES = [
    { id: 'floral', name: 'Floral', icon: '🌸' },
    { id: 'minimal', name: 'Minimal', icon: '◽' },
    { id: 'grand', name: 'Grand', icon: '👑' },
    { id: 'rustic', name: 'Rustic', icon: '🌿' },
    { id: 'contemporary', name: 'Contemporary', icon: '✨' },
]

// Color palettes
export const COLOR_PALETTES = [
    { name: 'Royal Purple', colors: ['#6366f1', '#8b5cf6', '#a855f7', '#d8b4fe'] },
    { name: 'Blush Pink', colors: ['#ec4899', '#f472b6', '#fce7f3', '#fdf2f8'] },
    { name: 'Golden Elegance', colors: ['#d97706', '#fbbf24', '#fef3c7', '#451a03'] },
    { name: 'Ocean Blue', colors: ['#0284c7', '#38bdf8', '#bae6fd', '#f0f9ff'] },
    { name: 'Forest Green', colors: ['#059669', '#34d399', '#d1fae5', '#ecfdf5'] },
    { name: 'Sunset Orange', colors: ['#ea580c', '#fb923c', '#fed7aa', '#fff7ed'] },
]

// Cuisine types
export const CUISINE_TYPES = [
    'North Indian', 'South Indian', 'Continental', 'Chinese',
    'Italian', 'Mexican', 'Thai', 'Japanese', 'Mediterranean', 'Fusion'
]

// Photography packages
export const PHOTOGRAPHY_PACKAGES = [
    { id: 'basic', name: 'Basic', description: '1 photographer, 4 hours', price: 50000 },
    { id: 'premium', name: 'Premium', description: '2 photographers + 1 videographer, full day', price: 125000 },
    { id: 'luxury', name: 'Luxury', description: 'Full team, drone, same-day edit, album', price: 250000 },
]
