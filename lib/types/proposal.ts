import { QuoteItem } from "./quote"

// Timeline event for the runsheet
export interface EventTimelineItem {
    id: string
    time: string          // e.g., "18:00", "19:30"
    title: string         // e.g., "Groom Entry on Stage"
    category: 'ceremony' | 'dining' | 'entertainment' | 'ritual' | 'other'
    duration?: string     // e.g., "30 mins"
    description?: string  // Additional details
    vendors?: string[]    // Vendors involved in this item
}

export interface ProposalVersion {
    version: number
    createdAt: string
    items: QuoteItem[]
    total: number
    notes?: string
    changes?: string // What changed from previous version
    // Event timeline for this version
    timeline?: EventTimelineItem[]
}

export interface Proposal {
    id: string
    eventId: string
    eventName: string
    eventDate?: string
    venue?: string
    city?: string
    guestCount?: number
    clientName: string
    clientEmail: string
    clientPhone?: string
    plannerName?: string
    status: 'DRAFT' | 'SENT' | 'REVISION_REQUESTED' | 'APPROVED' | 'REJECTED'
    currentVersion: number
    versions: ProposalVersion[]
    createdAt: string
    updatedAt: string
    approvedAt?: string
    sentAt?: string
    // Note shown to client about in-person meeting after approval
    postApprovalNote?: string
}

// Mock proposals data with event timeline
export const MOCK_PROPOSALS: Proposal[] = [
    {
        id: 'prop-001',
        eventId: 'e1',
        eventName: 'Mehta Sangeet Night',
        eventDate: '2025-02-15',
        venue: 'Grand Hyatt Ballroom',
        city: 'Mumbai',
        guestCount: 250,
        clientName: 'Priya Mehta',
        clientEmail: 'priya.mehta@email.com',
        clientPhone: '+91 98765 43210',
        plannerName: 'Elite Dream Planners',
        status: 'REVISION_REQUESTED',
        currentVersion: 2,
        versions: [
            {
                version: 1,
                createdAt: '2024-12-20T10:00:00Z',
                items: [
                    { vendorId: 'v1', vendorName: 'Grand Hyatt', serviceName: 'Venue', price: 300000, imageUrl: '' },
                    { vendorId: 'v2', vendorName: 'Bloom Florals', serviceName: 'Premium Decor', price: 200000, imageUrl: '' },
                ],
                total: 500000,
                notes: 'Initial proposal based on consultation',
            },
            {
                version: 2,
                createdAt: '2024-12-25T14:30:00Z',
                items: [
                    { vendorId: 'v1', vendorName: 'Grand Hyatt', serviceName: 'Venue', price: 300000, imageUrl: '' },
                    { vendorId: 'v2', vendorName: 'Bloom Florals', serviceName: 'Standard Decor', price: 150000, imageUrl: '' },
                    { vendorId: 'v3', vendorName: 'DJ Aman', serviceName: 'DJ Services', price: 75000, imageUrl: '' },
                ],
                total: 525000,
                changes: 'Changed decor to Standard, Added DJ services as requested',
                timeline: [
                    { id: 't1', time: '18:00', title: 'Guest Arrival & Welcome Drinks', category: 'other', duration: '30 mins' },
                    { id: 't2', time: '18:30', title: 'Groom Entry on Stage', category: 'ceremony', duration: '15 mins', description: 'Grand entry with dhol and sparklers' },
                    { id: 't3', time: '18:45', title: 'Bride Entry', category: 'ceremony', duration: '15 mins', description: 'Bridal party procession' },
                    { id: 't4', time: '19:00', title: 'Sangeet Performances', category: 'entertainment', duration: '90 mins', description: 'Family dance performances' },
                    { id: 't5', time: '20:30', title: 'Cocktail & Appetizers', category: 'dining', duration: '30 mins' },
                    { id: 't6', time: '21:00', title: 'Dinner Service', category: 'dining', duration: '60 mins' },
                    { id: 't7', time: '22:00', title: 'DJ Party & Open Dance Floor', category: 'entertainment', duration: '90 mins' },
                    { id: 't8', time: '23:30', title: 'Dessert & Farewell', category: 'dining', duration: '30 mins' },
                ],
            },
        ],
        createdAt: '2024-12-20T10:00:00Z',
        updatedAt: '2024-12-25T14:30:00Z',
        postApprovalNote: 'After approval, we will schedule an in-person meeting to discuss detailed catering menu, decoration themes, and song preferences for performances.',
    },
    {
        id: 'prop-002',
        eventId: 'e2',
        eventName: 'Sharma Anniversary',
        eventDate: '2025-03-10',
        venue: 'Taj Lands End',
        city: 'Mumbai',
        guestCount: 100,
        clientName: 'Rakesh Sharma',
        clientEmail: 'rakesh.sharma@email.com',
        clientPhone: '+91 99887 76655',
        plannerName: 'Elite Dream Planners',
        status: 'APPROVED',
        currentVersion: 1,
        versions: [
            {
                version: 1,
                createdAt: '2024-12-22T09:00:00Z',
                items: [
                    { vendorId: 'v4', vendorName: 'Taj Lands End', serviceName: 'Venue + Catering', price: 450000, imageUrl: '' },
                    { vendorId: 'v5', vendorName: 'Click Studios', serviceName: 'Photography', price: 125000, imageUrl: '' },
                ],
                total: 575000,
                timeline: [
                    { id: 't1', time: '19:00', title: 'Guest Arrival', category: 'other', duration: '30 mins' },
                    { id: 't2', time: '19:30', title: 'Couple Welcome Speech', category: 'ceremony', duration: '15 mins' },
                    { id: 't3', time: '19:45', title: 'Video Montage - 25 Years Together', category: 'entertainment', duration: '15 mins' },
                    { id: 't4', time: '20:00', title: 'Family Speeches & Toasts', category: 'ceremony', duration: '30 mins' },
                    { id: 't5', time: '20:30', title: 'Dinner Service', category: 'dining', duration: '60 mins' },
                    { id: 't6', time: '21:30', title: 'Cake Cutting Ceremony', category: 'ritual', duration: '15 mins' },
                    { id: 't7', time: '21:45', title: 'Dance & Music', category: 'entertainment', duration: '75 mins' },
                    { id: 't8', time: '23:00', title: 'Thank You & Departure', category: 'other', duration: '30 mins' },
                ],
            },
        ],
        createdAt: '2024-12-22T09:00:00Z',
        updatedAt: '2024-12-24T16:00:00Z',
        approvedAt: '2024-12-24T16:00:00Z',
        postApprovalNote: 'We will meet next week to finalize the menu selection and discuss flower arrangements.',
    },
]
