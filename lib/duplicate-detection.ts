// Duplicate Detection for Client Capture
// Checks if client with similar details already exists

import { getSubmissions, ClientSubmission } from './client-submissions'

export interface DuplicateMatch {
    submission: ClientSubmission
    matchType: 'phone' | 'email' | 'name' | 'event_date'
    confidence: 'high' | 'medium' | 'low'
}

// Normalize phone number for comparison
function normalizePhone(phone: string): string {
    return phone.replace(/\D/g, '').slice(-10) // Last 10 digits
}

// Fuzzy name matching (simple version)
function namesMatch(name1: string, name2: string): boolean {
    const n1 = name1.toLowerCase().trim()
    const n2 = name2.toLowerCase().trim()

    // Exact match
    if (n1 === n2) return true

    // One contains the other
    if (n1.includes(n2) || n2.includes(n1)) return true

    // First name match
    const firstName1 = n1.split(' ')[0]
    const firstName2 = n2.split(' ')[0]
    if (firstName1 === firstName2 && firstName1.length > 2) return true

    return false
}

// Check for duplicate clients
export function checkDuplicates(
    phone: string,
    email: string,
    name: string,
    eventDate: string
): DuplicateMatch[] {
    const submissions = getSubmissions()
    const matches: DuplicateMatch[] = []

    const normalizedPhone = normalizePhone(phone)
    const normalizedEmail = email.toLowerCase().trim()

    for (const sub of submissions) {
        // Phone match (HIGH confidence)
        if (phone && normalizePhone(sub.phone) === normalizedPhone) {
            matches.push({
                submission: sub,
                matchType: 'phone',
                confidence: 'high'
            })
            continue
        }

        // Email match (HIGH confidence)
        if (email && sub.email.toLowerCase().trim() === normalizedEmail) {
            matches.push({
                submission: sub,
                matchType: 'email',
                confidence: 'high'
            })
            continue
        }

        // Name + Date match (MEDIUM confidence)
        if (name && eventDate && namesMatch(name, sub.clientName) && sub.eventDate === eventDate) {
            matches.push({
                submission: sub,
                matchType: 'name',
                confidence: 'medium'
            })
            continue
        }

        // Just name match (LOW confidence)
        if (name && namesMatch(name, sub.clientName)) {
            matches.push({
                submission: sub,
                matchType: 'name',
                confidence: 'low'
            })
        }
    }

    // Sort by confidence
    const order = { high: 0, medium: 1, low: 2 }
    return matches.sort((a, b) => order[a.confidence] - order[b.confidence])
}

// Get readable match reason
export function getMatchReason(match: DuplicateMatch): string {
    switch (match.matchType) {
        case 'phone':
            return `Same phone number: ${match.submission.phone}`
        case 'email':
            return `Same email: ${match.submission.email}`
        case 'name':
            return `Similar name: ${match.submission.clientName}`
        case 'event_date':
            return `Same event date`
        default:
            return 'Similar details'
    }
}
