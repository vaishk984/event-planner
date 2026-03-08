/**
 * Event Domain Model
 * 
 * Business logic and validation for Event entity.
 * Based on: docs/ARCHITECTURE.md (Section 2.3)
 */

import type { Event, EventStatus, ClientSubmission, EventType, VenueType, Intake } from '@/types/domain';

// ============================================
// STATE MACHINE
// ============================================

/**
 * Valid state transitions for Event
 */
export const EVENT_STATE_TRANSITIONS: Record<EventStatus, EventStatus[]> = {
    submission: ['draft'],                    // Convert to event
    draft: ['planning', 'archived'],          // Start planning or cancel
    planning: ['proposed', 'draft'],          // Send proposal or go back
    proposed: ['approved', 'planning'],       // Client approves or revision
    approved: ['live'],                       // Event day starts (auto)
    live: ['completed'],                      // All tasks done
    completed: ['archived'],                  // Close out
    archived: [],                             // Terminal state
};

/**
 * Check if transition is valid
 */
export function canTransitionTo(from: EventStatus, to: EventStatus): boolean {
    return EVENT_STATE_TRANSITIONS[from]?.includes(to) ?? false;
}

// ============================================
// VALIDATION RULES
// ============================================

export const EventValidation = {
    /**
     * Can the event be edited
     */
    canEdit: (event: Event): boolean => {
        return !['approved', 'live', 'completed', 'archived'].includes(event.status);
    },

    /**
     * Can vendors be added/removed
     */
    canModifyVendors: (event: Event): boolean => {
        return ['draft', 'planning'].includes(event.status);
    },

    /**
     * Can proposal be sent
     */
    canSendProposal: (event: Event): boolean => {
        return event.status === 'planning';
    },

    /**
     * Can client approve
     */
    canApprove: (event: Event): boolean => {
        return event.status === 'proposed';
    },

    /**
     * Is event locked (no changes allowed)
     */
    isLocked: (event: Event): boolean => {
        return ['approved', 'live', 'completed', 'archived'].includes(event.status);
    },

    /**
     * Validate event data
     */
    validate: (event: Partial<Event>): { valid: boolean; errors: string[] } => {
        const errors: string[] = [];

        if (!event.clientName?.trim()) {
            errors.push('Client name is required');
        }

        if (!event.clientPhone?.trim()) {
            errors.push('Client phone is required');
        }

        if (!event.type) {
            errors.push('Event type is required');
        }

        if (!event.city) {
            errors.push('City is required');
        }

        if (event.guestCount && event.guestCount < 1) {
            errors.push('Guest count must be at least 1');
        }

        if (event.budgetMin && event.budgetMax && event.budgetMin > event.budgetMax) {
            errors.push('Minimum budget cannot exceed maximum');
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    },
};

// ============================================
// FACTORY FUNCTIONS
// ============================================

/**
 * Create event from client submission
 */
export function createEventFromSubmission(submission: Intake, plannerId: string): Omit<Event, 'id' | 'createdAt' | 'updatedAt'> {
    const eventType = submission.eventType || 'other';
    const venueType = submission.venueType || 'showroom';

    return {
        plannerId,
        submissionId: submission.id,

        status: 'draft',
        type: eventType,
        name: `${submission.clientName}'s ${formatEventType(eventType)}`,

        date: submission.eventDate || '',
        endDate: submission.eventEndDate,
        isDateFlexible: submission.isDateFlexible,

        city: submission.city || '',
        venueType: venueType,
        venueName: submission.personalVenue?.name,
        venueAddress: submission.personalVenue?.address,

        guestCount: submission.guestCount,
        budgetMin: submission.budgetMin,
        budgetMax: submission.budgetMax,

        clientName: submission.clientName,
        clientPhone: submission.phone,
        clientEmail: submission.email,

        source: submission.source,
        notes: submission.specialRequests,
    };
}

/**
 * Create empty event (for manual creation)
 */
export function createEmptyEvent(plannerId: string): Omit<Event, 'id' | 'createdAt' | 'updatedAt'> {
    return {
        plannerId,
        status: 'draft',
        type: 'wedding',
        name: 'New Event',
        date: '',
        isDateFlexible: false,
        city: '',
        venueType: 'showroom',
        guestCount: 100,
        budgetMin: 500000,
        budgetMax: 1000000,
        clientName: '',
        clientPhone: '',
        source: 'website',
    };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format event type for display
 */
export function formatEventType(type: EventType): string {
    const labels: Record<EventType, string> = {
        wedding: 'Wedding',
        birthday: 'Birthday Party',
        corporate: 'Corporate Event',
        baby_shower: 'Baby Shower',
        graduation: 'Graduation',
        anniversary: 'Anniversary',
        engagement: 'Engagement',
        other: 'Event',
    };
    return labels[type] || 'Event';
}

/**
 * Get status display info
 */
export function getEventStatusInfo(status: EventStatus): { label: string; color: string; icon: string } {
    const statusInfo: Record<EventStatus, { label: string; color: string; icon: string }> = {
        submission: { label: 'New Submission', color: 'blue', icon: 'inbox' },
        draft: { label: 'Draft', color: 'gray', icon: 'file' },
        planning: { label: 'Planning', color: 'yellow', icon: 'palette' },
        proposed: { label: 'Proposed', color: 'orange', icon: 'send' },
        approved: { label: 'Approved', color: 'green', icon: 'check' },
        live: { label: 'Live', color: 'red', icon: 'zap' },
        completed: { label: 'Completed', color: 'emerald', icon: 'check-circle' },
        archived: { label: 'Archived', color: 'slate', icon: 'archive' },
    };
    return statusInfo[status] || { label: status, color: 'gray', icon: 'help' };
}

/**
 * Calculate days until event
 */
export function getDaysUntilEvent(event: Event): number | null {
    if (!event.date) return null;
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = eventDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if event is upcoming (within 7 days)
 */
export function isUpcoming(event: Event): boolean {
    const days = getDaysUntilEvent(event);
    return days !== null && days >= 0 && days <= 7;
}

/**
 * Check if event is today
 */
export function isToday(event: Event): boolean {
    const days = getDaysUntilEvent(event);
    return days === 0;
}
