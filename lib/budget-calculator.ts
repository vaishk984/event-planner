// Budget Calculator for Event Planning
// Calculates estimated costs based on selections

interface BudgetBreakdown {
    category: string
    label: string
    amount: number
    perPerson?: boolean
}

// Base prices (per event or per person)
const PRICES = {
    // Venue (mock - would come from showroom)
    venue: {
        showroom: 200000, // Average venue cost
        personal: 0, // Client's own venue
    },

    // Food per person
    food: {
        standard: 800,
        premium: 1500,
        luxury: 2500,
    },

    // Serving style multiplier
    servingStyle: {
        Buffet: 1.0,
        Plated: 1.3,
        'Live Counters': 1.5,
    },

    // Decor intensity
    decor: {
        Minimal: 50000,
        Moderate: 150000,
        Grand: 350000,
        Maximum: 600000,
    },

    // Entertainment
    entertainment: {
        DJ: 25000,
        'Live Band': 75000,
        Cultural: 50000,
        None: 0,
    },

    // Photography packages
    photography: {
        Basic: 50000,
        Standard: 100000,
        Premium: 200000,
        Luxury: 400000,
    },

    // Add-ons
    addons: {
        drone: 15000,
        preWedding: 50000,
    },

    // Services
    services: {
        makeup: 25000,
        mehendi: 15000,
        anchor: 20000,
        valet: 30000,
        pandit: 11000,
    },
}

export interface BudgetResult {
    total: number
    breakdown: BudgetBreakdown[]
    perPerson: number
}

export function calculateBudget(data: {
    guestCount: number
    venueType: string
    foodBudgetLevel: string
    servingStyle: string
    decorIntensity: string
    entertainmentType: string
    photoPackage: string
    wantsDrone: boolean
    wantsPreWedding: boolean
    wantsMakeup: boolean
    wantsMehendi: boolean
    wantsAnchor: boolean
    wantsValet: boolean
    wantsPandit: boolean
}): BudgetResult {
    const breakdown: BudgetBreakdown[] = []
    let total = 0

    // Venue
    const venueCost = data.venueType === 'showroom' ? PRICES.venue.showroom : 0
    if (venueCost > 0) {
        breakdown.push({ category: 'venue', label: 'Venue', amount: venueCost })
        total += venueCost
    }

    // Food
    const foodLevel = data.foodBudgetLevel || 'standard'
    const baseFood = PRICES.food[foodLevel as keyof typeof PRICES.food] || 800
    const styleMultiplier = PRICES.servingStyle[data.servingStyle as keyof typeof PRICES.servingStyle] || 1.0
    const foodCost = Math.round(baseFood * styleMultiplier * data.guestCount)
    breakdown.push({ category: 'food', label: 'Food & Catering', amount: foodCost, perPerson: true })
    total += foodCost

    // Decor
    const decorCost = PRICES.decor[data.decorIntensity as keyof typeof PRICES.decor] || 150000
    breakdown.push({ category: 'decor', label: 'Decor', amount: decorCost })
    total += decorCost

    // Entertainment
    const entCost = PRICES.entertainment[data.entertainmentType as keyof typeof PRICES.entertainment] || 0
    if (entCost > 0) {
        breakdown.push({ category: 'entertainment', label: 'Entertainment', amount: entCost })
        total += entCost
    }

    // Photography
    const photoCost = PRICES.photography[data.photoPackage as keyof typeof PRICES.photography] || 100000
    breakdown.push({ category: 'photography', label: 'Photography', amount: photoCost })
    total += photoCost

    // Add-ons
    if (data.wantsDrone) {
        breakdown.push({ category: 'addon', label: 'Drone Coverage', amount: PRICES.addons.drone })
        total += PRICES.addons.drone
    }
    if (data.wantsPreWedding) {
        breakdown.push({ category: 'addon', label: 'Pre-Wedding Shoot', amount: PRICES.addons.preWedding })
        total += PRICES.addons.preWedding
    }

    // Services
    if (data.wantsMakeup) {
        breakdown.push({ category: 'service', label: 'Makeup & Hair', amount: PRICES.services.makeup })
        total += PRICES.services.makeup
    }
    if (data.wantsMehendi) {
        breakdown.push({ category: 'service', label: 'Mehendi', amount: PRICES.services.mehendi })
        total += PRICES.services.mehendi
    }
    if (data.wantsAnchor) {
        breakdown.push({ category: 'service', label: 'Anchor/Host', amount: PRICES.services.anchor })
        total += PRICES.services.anchor
    }
    if (data.wantsValet) {
        breakdown.push({ category: 'service', label: 'Valet Parking', amount: PRICES.services.valet })
        total += PRICES.services.valet
    }
    if (data.wantsPandit) {
        breakdown.push({ category: 'service', label: 'Pandit/Priest', amount: PRICES.services.pandit })
        total += PRICES.services.pandit
    }

    return {
        total,
        breakdown,
        perPerson: data.guestCount > 0 ? Math.round(total / data.guestCount) : 0,
    }
}

// Format currency
export function formatCurrency(amount: number): string {
    if (amount >= 10000000) {
        return `₹${(amount / 10000000).toFixed(1)} Cr`
    }
    if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(1)} L`
    }
    if (amount >= 1000) {
        return `₹${(amount / 1000).toFixed(1)}K`
    }
    return `₹${amount}`
}
