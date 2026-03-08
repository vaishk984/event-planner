/**
 * Event Repository
 * 
 * Data access layer for Event entity.
 * Based on: docs/ARCHITECTURE.md (Section 2.1)
 */

import { BaseRepository } from './base-repository';
import type { Event, EventStatus, ActionResult } from '@/types/domain';

class EventRepositoryClass extends BaseRepository<Event> {
    protected storageKey = 'planner-os-events';
    protected entityName = 'event';

    constructor() {
        super();
        // Seed mock data on first load
        if (typeof window !== 'undefined') {
            this.seedMockData();
        }
    }

    /**
     * Seed mock data for testing
     */
    private seedMockData(): void {
        const existing = this.getAll();
        if (existing.length > 0) return; // Don't seed if data exists

        const mockEvents: Event[] = [
            {
                id: 'event_sharma_wedding',
                plannerId: 'user_planner',
                name: 'Sharma Wedding',
                clientName: 'Rahul Sharma',
                clientPhone: '+91 98765 43210',
                clientEmail: 'rahul@example.com',
                date: '2025-02-15',
                type: 'wedding',
                status: 'planning',
                venueType: 'showroom',
                venueName: 'Grand Ballroom',
                city: 'Mumbai',
                guestCount: 250,
                budgetMin: 1000000,
                budgetMax: 1500000,
                isDateFlexible: false,
                notes: 'Traditional wedding with modern touches',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: 'event_mehta_sangeet',
                plannerId: 'user_planner',
                name: 'Mehta Sangeet',
                clientName: 'Priya Mehta',
                clientPhone: '+91 87654 32109',
                clientEmail: 'priya@example.com',
                date: '2025-01-25',
                type: 'engagement',
                status: 'proposed',
                venueType: 'showroom',
                venueName: 'The Garden Hall',
                city: 'Delhi',
                guestCount: 150,
                budgetMin: 500000,
                budgetMax: 800000,
                isDateFlexible: true,
                notes: 'Bollywood theme sangeet night',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: 'event_jain_birthday',
                plannerId: 'user_planner',
                name: 'Arun 50th Birthday',
                clientName: 'Arun Jain',
                clientPhone: '+91 99887 76655',
                clientEmail: 'arun@example.com',
                date: '2025-01-10',
                type: 'birthday',
                status: 'approved',
                venueType: 'personal',
                venueName: 'Jain Residence',
                city: 'Bangalore',
                guestCount: 100,
                budgetMin: 200000,
                budgetMax: 300000,
                isDateFlexible: false,
                notes: 'Surprise party - coordinate with family',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        ];

        this.saveAll(mockEvents);
    }

    /**
     * Find events by planner ID
     */
    async findByPlannerId(plannerId: string): Promise<Event[]> {
        return this.findMany({ plannerId } as Partial<Event>);
    }

    /**
     * Find events by status
     */
    async findByStatus(status: EventStatus): Promise<Event[]> {
        return this.findMany({ status } as Partial<Event>);
    }

    /**
     * Find events by client phone
     */
    async findByClientPhone(phone: string): Promise<Event[]> {
        const normalizedPhone = phone.replace(/\D/g, '').slice(-10);
        const items = this.getAll();
        return items.filter(event => {
            const eventPhone = event.clientPhone?.replace(/\D/g, '').slice(-10);
            return eventPhone === normalizedPhone;
        });
    }

    /**
     * Find upcoming events (next 30 days)
     */
    async findUpcoming(): Promise<Event[]> {
        const items = this.getAll();
        const now = new Date();
        const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        return items.filter(event => {
            if (!event.date) return false;
            const eventDate = new Date(event.date);
            return eventDate >= now && eventDate <= thirtyDaysLater;
        }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    /**
     * Find today's events
     */
    async findToday(): Promise<Event[]> {
        const items = this.getAll();
        const today = new Date().toISOString().split('T')[0];

        return items.filter(event => event.date?.startsWith(today));
    }

    /**
     * Update event status
     */
    async updateStatus(id: string, status: EventStatus): Promise<ActionResult<Event>> {
        return this.update(id, { status } as Partial<Event>);
    }

    /**
     * Find events linked to a submission
     */
    async findBySubmissionId(submissionId: string): Promise<Event | null> {
        const items = this.getAll();
        return items.find(event => event.submissionId === submissionId) || null;
    }

    /**
     * Get event counts by status
     */
    async getStatusCounts(): Promise<Record<EventStatus, number>> {
        const items = this.getAll();
        const counts: Record<string, number> = {
            submission: 0,
            draft: 0,
            planning: 0,
            proposed: 0,
            approved: 0,
            live: 0,
            completed: 0,
            archived: 0,
        };

        items.forEach(event => {
            if (counts[event.status] !== undefined) {
                counts[event.status]++;
            }
        });

        return counts as Record<EventStatus, number>;
    }
}

// Export singleton instance
export const eventRepository = new EventRepositoryClass();
