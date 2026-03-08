// Shared booking request store
// In a real app, this would be in a database

import { createAssignment } from './vendor-assignment-store'
import type { BudgetCategoryType } from '@/types/domain'

export interface BookingRequest {
    id: string
    eventId: string
    functionId?: string  // Optional: which function this vendor is for
    eventName: string
    eventDate: string
    venue: string
    city: string
    guestCount: number
    category: string
    service: string
    budget: number
    vendorId: string
    vendorName: string
    vendorPhone?: string
    plannerId: string
    plannerName: string
    clientName: string
    notes?: string
    status: 'pending' | 'accepted' | 'declined'
    createdAt: string
    updatedAt: string
}

// In-memory store (would be database in production)
let bookingRequests: BookingRequest[] = [
    // Sample data - requests that already exist
    {
        id: 'req_1',
        eventId: 'evt_sharma',
        eventName: 'Sharma Wedding',
        eventDate: '2025-01-15',
        venue: 'Royal Heritage Palace',
        city: 'Jaipur',
        guestCount: 350,
        category: 'Photography',
        service: 'Full Day Photography + Video',
        budget: 120000,
        vendorId: 'vendor-001',
        vendorName: 'Capture Studios',
        plannerId: 'planner-001',
        plannerName: 'Elite Dream Planners',
        clientName: 'Rahul Sharma',
        status: 'accepted',
        createdAt: '2024-12-15',
        updatedAt: '2024-12-16'
    },
    {
        id: 'req_2',
        eventId: 'evt_patel',
        eventName: 'Patel Engagement',
        eventDate: '2025-01-22',
        venue: 'Garden View Resorts',
        city: 'Ahmedabad',
        guestCount: 150,
        category: 'Photography',
        service: 'Full Day Photography',
        budget: 45000,
        vendorId: 'vendor-001',
        vendorName: 'Capture Studios',
        plannerId: 'planner-001',
        plannerName: 'Elite Dream Planners',
        clientName: 'Rohan Patel',
        status: 'accepted',
        createdAt: '2024-12-10',
        updatedAt: '2024-12-11'
    },
    {
        id: 'req_3',
        eventId: 'evt_mehta',
        eventName: 'Mehta Wedding',
        eventDate: '2025-02-20',
        venue: 'Taj Palace',
        city: 'Mumbai',
        guestCount: 500,
        category: 'Photography',
        service: 'Full Day Photography + Video',
        budget: 150000,
        vendorId: 'vendor-001',
        vendorName: 'Capture Studios',
        plannerId: 'planner-001',
        plannerName: 'Elite Dream Planners',
        clientName: 'Rahul Mehta',
        notes: 'Looking for candid coverage with emphasis on emotions. Need drone shots for baraat.',
        status: 'pending',
        createdAt: '2024-12-29',
        updatedAt: '2024-12-29'
    },
    {
        id: 'req_4',
        eventId: 'evt_corp',
        eventName: 'Corporate Annual Meet',
        eventDate: '2025-01-28',
        venue: 'Convention Center',
        city: 'Bangalore',
        guestCount: 200,
        category: 'Photography',
        service: 'Event Coverage',
        budget: 50000,
        vendorId: 'vendor-001',
        vendorName: 'Capture Studios',
        plannerId: 'planner-001',
        plannerName: 'Elite Dream Planners',
        clientName: 'TechCorp India',
        notes: 'Need professional headshots of speakers as well.',
        status: 'pending',
        createdAt: '2024-12-28',
        updatedAt: '2024-12-28'
    },
    {
        id: 'req_5',
        eventId: 'evt_joshi',
        eventName: 'Joshi Sangeet',
        eventDate: '2025-02-10',
        venue: 'Private Farmhouse',
        city: 'Pune',
        guestCount: 150,
        category: 'Photography',
        service: 'Candid Photography',
        budget: 75000,
        vendorId: 'vendor-001',
        vendorName: 'Capture Studios',
        plannerId: 'planner-001',
        plannerName: 'Elite Dream Planners',
        clientName: 'Priya Joshi',
        status: 'pending',
        createdAt: '2024-12-26',
        updatedAt: '2024-12-26'
    },
]

// Get all requests for a vendor
export function getRequestsForVendor(vendorId: string): BookingRequest[] {
    return bookingRequests.filter(r => r.vendorId === vendorId)
}

// Get all requests for an event
export function getRequestsForEvent(eventId: string): BookingRequest[] {
    return bookingRequests.filter(r => r.eventId === eventId)
}

// Get all requests by a planner
export function getRequestsForPlanner(plannerId: string): BookingRequest[] {
    return bookingRequests.filter(r => r.plannerId === plannerId)
}

// Create a new booking request
export function createBookingRequest(request: Omit<BookingRequest, 'id' | 'createdAt' | 'updatedAt'>): BookingRequest {
    const newRequest: BookingRequest = {
        ...request,
        id: `req_${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
    }
    bookingRequests.push(newRequest)
    return newRequest
}

// Map category string to BudgetCategoryType
function mapCategoryToBudget(category: string): BudgetCategoryType {
    const map: Record<string, BudgetCategoryType> = {
        'Photography': 'photography',
        'Videography': 'photography',
        'Decoration': 'decor',
        'Decor': 'decor',
        'Catering': 'food',
        'Food': 'food',
        'Entertainment': 'entertainment',
        'Music': 'entertainment',
        'DJ': 'entertainment',
        'Makeup': 'bridal',
        'Bridal': 'bridal',
        'Venue': 'venue',
        'Transport': 'logistics',
        'Logistics': 'logistics',
    }
    return map[category] || 'misc'
}

// Update request status
export function updateRequestStatus(requestId: string, status: 'pending' | 'accepted' | 'declined'): BookingRequest | null {
    const request = bookingRequests.find(r => r.id === requestId)
    if (request) {
        request.status = status
        request.updatedAt = new Date().toISOString().split('T')[0]

        // Auto-create vendor assignment when accepted
        if (status === 'accepted') {
            createAssignment({
                eventId: request.eventId,
                functionId: request.functionId || 'default',
                vendorId: request.vendorId,
                vendorName: request.vendorName,
                vendorCategory: request.category,
                vendorPhone: request.vendorPhone,
                budgetCategory: mapCategoryToBudget(request.category),
                agreedAmount: request.budget,
                notes: request.notes,
            })
        }

        return request
    }
    return null
}

// Get pending requests count for a vendor
export function getPendingRequestsCount(vendorId: string): number {
    return bookingRequests.filter(r => r.vendorId === vendorId && r.status === 'pending').length
}

// Check if a request exists for event + vendor + category
export function getExistingRequest(eventId: string, vendorId: string, category: string): BookingRequest | undefined {
    return bookingRequests.find(r =>
        r.eventId === eventId &&
        r.vendorId === vendorId &&
        r.category === category
    )
}
