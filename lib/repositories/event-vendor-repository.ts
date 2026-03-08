/**
 * Event Vendor Repository
 * 
 * Manages the junction between Events and Vendors.
 * Handles "Add to Plan" functionality from showroom.
 * 
 * Based on: docs/ARCHITECTURE.md (Section 2.1)
 */

import { BaseRepository } from './base-repository';
import type { EventVendor, VendorCategory, ActionResult } from '@/types/domain';

class EventVendorRepositoryClass extends BaseRepository<EventVendor> {
    protected storageKey = 'planner-os-event-vendors';
    protected entityName = 'event-vendor';

    /**
     * Find all vendors for an event
     */
    async findByEventId(eventId: string): Promise<EventVendor[]> {
        return this.findMany({ eventId } as Partial<EventVendor>);
    }

    /**
     * Find all events for a vendor
     */
    async findByVendorId(vendorId: string): Promise<EventVendor[]> {
        return this.findMany({ vendorId } as Partial<EventVendor>);
    }

    /**
     * Find by event and category
     */
    async findByEventAndCategory(eventId: string, category: VendorCategory): Promise<EventVendor[]> {
        const items = this.getAll();
        return items.filter(ev => ev.eventId === eventId && ev.category === category);
    }

    /**
     * Check if vendor is already added to event
     */
    async isVendorInEvent(eventId: string, vendorId: string): Promise<boolean> {
        const items = this.getAll();
        return items.some(ev => ev.eventId === eventId && ev.vendorId === vendorId);
    }

    /**
     * Add vendor to event plan
     */
    async addVendorToEvent(
        eventId: string,
        vendorId: string,
        category: VendorCategory,
        price?: number
    ): Promise<ActionResult<EventVendor>> {
        // Check if already exists
        const exists = await this.isVendorInEvent(eventId, vendorId);
        if (exists) {
            return { success: false, error: 'Vendor already in event plan', code: 'CONFLICT' };
        }

        const eventVendor: Omit<EventVendor, 'id'> = {
            eventId,
            vendorId,
            category,
            status: 'shortlisted',
            price,
            addedAt: new Date().toISOString(),
        };

        return this.create(eventVendor);
    }

    /**
     * Update vendor status in event
     */
    async updateStatus(
        id: string,
        status: EventVendor['status']
    ): Promise<ActionResult<EventVendor>> {
        return this.update(id, { status });
    }

    /**
     * Remove vendor from event
     */
    async removeFromEvent(eventId: string, vendorId: string): Promise<ActionResult<void>> {
        const items = this.getAll();
        const eventVendor = items.find(ev => ev.eventId === eventId && ev.vendorId === vendorId);

        if (!eventVendor) {
            return { success: false, error: 'Vendor not in event', code: 'NOT_FOUND' };
        }

        return this.delete(eventVendor.id);
    }

    /**
     * Get confirmed vendors for an event
     */
    async getConfirmedVendors(eventId: string): Promise<EventVendor[]> {
        const items = this.getAll();
        return items.filter(ev => ev.eventId === eventId && ev.status === 'confirmed');
    }

    /**
     * Get vendor counts by status for an event
     */
    async getVendorStatusCounts(eventId: string): Promise<Record<EventVendor['status'], number>> {
        const vendors = await this.findByEventId(eventId);
        const counts: Record<string, number> = {
            shortlisted: 0,
            contacted: 0,
            confirmed: 0,
            rejected: 0,
        };

        vendors.forEach(v => {
            if (counts[v.status] !== undefined) {
                counts[v.status]++;
            }
        });

        return counts as Record<EventVendor['status'], number>;
    }
}

// Export singleton instance
export const eventVendorRepository = new EventVendorRepositoryClass();
