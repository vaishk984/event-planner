// Availability Check for Event Dates
// Checks vendor availability and conflicts

interface VendorAvailability {
    vendorId: string
    vendorName: string
    category: string
    available: boolean
    bookedEvents?: number
}

interface AvailabilityResult {
    date: string
    isAvailable: boolean
    conflicts: VendorAvailability[]
    suggestions: string[]
}

// Mock booked dates (in production, this would come from database)
const MOCK_BOOKED_DATES: Record<string, string[]> = {
    // Format: 'YYYY-MM-DD': ['vendorId1', 'vendorId2']
    '2025-02-14': ['photographer_1', 'decorator_1', 'caterer_1'], // Valentine's Day
    '2025-02-15': ['photographer_1', 'decorator_2'],
    '2025-03-08': ['photographer_2', 'caterer_1'], // Holi weekend
    '2025-03-09': ['photographer_1', 'decorator_1', 'caterer_2', 'dj_1'],
    '2025-11-03': ['photographer_1', 'decorator_1', 'caterer_1', 'caterer_2'], // Diwali
    '2025-11-04': ['photographer_1', 'photographer_2', 'decorator_1'],
    '2025-12-25': ['photographer_1', 'caterer_1'], // Christmas
    '2025-12-31': ['photographer_1', 'photographer_2', 'dj_1', 'dj_2', 'decorator_1'], // New Year
}

// Mock vendor names
const VENDOR_NAMES: Record<string, { name: string; category: string }> = {
    'photographer_1': { name: 'Royal Captures', category: 'Photography' },
    'photographer_2': { name: 'Memories Studio', category: 'Photography' },
    'decorator_1': { name: 'Dream Décor', category: 'Decor' },
    'decorator_2': { name: 'Floral Fantasy', category: 'Decor' },
    'caterer_1': { name: 'Flavours of India', category: 'Catering' },
    'caterer_2': { name: 'Royal Kitchen', category: 'Catering' },
    'dj_1': { name: 'DJ Beats', category: 'Entertainment' },
    'dj_2': { name: 'Sound Masters', category: 'Entertainment' },
}

// Check date availability
export function checkDateAvailability(date: string): AvailabilityResult {
    const bookedVendors = MOCK_BOOKED_DATES[date] || []

    const conflicts: VendorAvailability[] = bookedVendors.map(vendorId => ({
        vendorId,
        vendorName: VENDOR_NAMES[vendorId]?.name || vendorId,
        category: VENDOR_NAMES[vendorId]?.category || 'Unknown',
        available: false,
        bookedEvents: Math.floor(Math.random() * 3) + 1,
    }))

    // Check how many categories have conflicts
    const conflictCategories = new Set(conflicts.map(c => c.category))
    const isAvailable = conflictCategories.size < 2 // Available if less than 2 categories have conflicts

    // Generate suggestions
    const suggestions: string[] = []
    if (!isAvailable) {
        // Find nearby available dates
        const dateObj = new Date(date)
        for (let i = 1; i <= 7; i++) {
            const nextDate = new Date(dateObj)
            nextDate.setDate(nextDate.getDate() + i)
            const nextDateStr = nextDate.toISOString().split('T')[0]

            const nextBookings = MOCK_BOOKED_DATES[nextDateStr] || []
            if (nextBookings.length < 2) {
                suggestions.push(nextDateStr)
                if (suggestions.length >= 3) break
            }
        }
    }

    return {
        date,
        isAvailable,
        conflicts,
        suggestions,
    }
}

// Get availability status text
export function getAvailabilityStatus(result: AvailabilityResult): {
    status: 'available' | 'limited' | 'busy'
    message: string
    color: string
} {
    if (result.conflicts.length === 0) {
        return {
            status: 'available',
            message: 'Great choice! All vendors available',
            color: 'green',
        }
    }

    if (result.isAvailable) {
        return {
            status: 'limited',
            message: `${result.conflicts.length} vendor(s) booked, but alternatives available`,
            color: 'yellow',
        }
    }

    return {
        status: 'busy',
        message: `High demand date - ${result.conflicts.length} vendors already booked`,
        color: 'red',
    }
}

// Check if date is a special occasion
export function isSpecialDate(date: string): string | null {
    const specialDates: Record<string, string> = {
        '02-14': "Valentine's Day",
        '11-03': 'Diwali (Estimated)',
        '11-04': 'Diwali (Estimated)',
        '12-25': 'Christmas',
        '12-31': "New Year's Eve",
        '01-01': "New Year's Day",
        '03-08': 'Holi (Estimated)',
        '03-09': 'Holi (Estimated)',
    }

    const monthDay = date.slice(5) // Get MM-DD
    return specialDates[monthDay] || null
}
