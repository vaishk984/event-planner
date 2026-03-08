// Client Submissions Store
// Connects client portal submissions to planner workspace
// Uses localStorage for demo - replace with Supabase in production

export interface ClientSubmission {
    id: string
    token: string
    submittedAt: string
    status: 'pending' | 'in_progress' | 'completed'

    // Client Info
    clientName: string
    phone: string
    email: string
    source: string

    // Event Details
    eventType: string
    eventDate: string
    eventEndDate: string
    isDateFlexible: boolean
    guestCount: number
    city: string
    budgetMin: number
    budgetMax: number
    budgetRange: number

    // Venue
    venueType: 'personal' | 'showroom' | ''
    personalVenue: {
        name: string
        address: string
        capacity: number
        type: string
        hasParking: boolean
        photos: string[]
    }

    // Food
    food: {
        dietary: string[]
        cuisines: string[]
        servingStyle: string
        budgetLevel: string
        specialRequests: string
    }

    // Decor
    decor: {
        style: string
        colorMood: string
        intensity: string
        flowers: string[]
        entranceStyle: string
        stageStyle: string
        lighting: string
        specialRequests: string
    }

    // Entertainment
    entertainment: {
        type: string
        genres: string[]
        soundLevel: string
        performances: string[]
        specialRequests: string
    }

    // Photography
    photography: {
        package: string
        style: string
        drone: boolean
        preWedding: boolean
        album: string
        specialRequests: string
    }

    // Services
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
    }

    // Liked Vendors
    likedVendors: string[]
    likedVendorsByCategory: Record<string, string[]>

    // Special Requests
    specialRequests: string
}

const STORAGE_KEY = 'planner_os_client_submissions'

// Get all submissions
export function getSubmissions(): ClientSubmission[] {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
}

// Get a single submission by token
export function getSubmissionByToken(token: string): ClientSubmission | null {
    const submissions = getSubmissions()
    return submissions.find(s => s.token === token) || null
}

// Get a single submission by ID
export function getSubmissionById(id: string): ClientSubmission | null {
    const submissions = getSubmissions()
    return submissions.find(s => s.id === id) || null
}

// Save a new submission (called when client completes portal)
export function saveSubmission(submission: ClientSubmission): void {
    const submissions = getSubmissions()
    const existingIndex = submissions.findIndex(s => s.token === submission.token)

    if (existingIndex >= 0) {
        submissions[existingIndex] = submission
    } else {
        submissions.unshift(submission) // Add to beginning
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions))

    // Dispatch event for real-time updates
    window.dispatchEvent(new CustomEvent('submission-updated', { detail: submission }))
}

// Update submission status
export function updateSubmissionStatus(token: string, status: ClientSubmission['status']): void {
    const submissions = getSubmissions()
    const submission = submissions.find(s => s.token === token)

    if (submission) {
        submission.status = status
        localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions))
    }
}

// Create a pending submission when planner generates a link
export function createPendingSubmission(token: string, clientName: string, phone: string): ClientSubmission {
    const submission: ClientSubmission = {
        id: `sub_${Date.now()}`,
        token,
        submittedAt: '',
        status: 'pending',
        clientName,
        phone,
        email: '',
        source: 'planner_invite',
        eventType: '',
        eventDate: '',
        eventEndDate: '',
        isDateFlexible: false,
        guestCount: 150,
        city: '',
        budgetMin: 500000,
        budgetMax: 2500000,
        budgetRange: 50,
        venueType: '',
        personalVenue: {
            name: '',
            address: '',
            capacity: 0,
            type: '',
            hasParking: false,
            photos: [],
        },
        food: { dietary: [], cuisines: [], servingStyle: '', budgetLevel: '', specialRequests: '' },
        decor: { style: '', colorMood: '', intensity: '', flowers: [], entranceStyle: '', stageStyle: '', lighting: '', specialRequests: '' },
        entertainment: { type: '', genres: [], soundLevel: '', performances: [], specialRequests: '' },
        photography: { package: '', style: '', drone: false, preWedding: false, album: '', specialRequests: '' },
        services: { makeup: false, mehendi: false, anchor: false, valet: false, transport: false, pandit: false, fireworks: false, dhol: false, staffCount: 0, furnitureNeeds: '', specialRequests: '' },
        likedVendors: [],
        likedVendorsByCategory: {},
        specialRequests: '',
    }

    saveSubmission(submission)
    return submission
}

// Delete a submission
export function deleteSubmission(token: string): void {
    const submissions = getSubmissions().filter(s => s.token !== token)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions))
}

// Convert to event format for display
export function submissionToEvent(submission: ClientSubmission) {
    return {
        id: submission.id,
        name: `${submission.clientName}'s ${submission.eventType || 'Event'}`,
        event_type: submission.eventType,
        event_date: submission.eventDate,
        venue: submission.personalVenue.name || null,
        budget: submission.budgetMax,
        guest_count: submission.guestCount,
        status: submission.status === 'pending' ? 'lead' : submission.status === 'in_progress' ? 'planning' : 'completed',
        client_name: submission.clientName,
        client_phone: submission.phone,
        client_email: submission.email,
        created_at: submission.submittedAt,
    }
}
