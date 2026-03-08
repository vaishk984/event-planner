/**
 * Proposal Repository
 * 
 * Data access layer for Proposal entity.
 * Handles proposal creation, versioning, and status tracking.
 * 
 * Based on: docs/ARCHITECTURE.md (Section 2.1)
 */

import { BaseRepository } from './base-repository';
import type { Proposal, ProposalItem, ProposalStatus, ActionResult } from '@/types/domain';

class ProposalRepositoryClass extends BaseRepository<Proposal> {
    protected storageKey = 'planner-os-proposals';
    protected entityName = 'proposal';

    /**
     * Generate unique access token
     */
    generateToken(): string {
        return `prop_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 8)}`;
    }

    /**
     * Find proposals by event ID
     */
    async findByEventId(eventId: string): Promise<Proposal[]> {
        const items = this.getAll();
        return items
            .filter(p => p.eventId === eventId)
            .sort((a, b) => b.version - a.version);
    }

    /**
     * Find latest proposal for event
     */
    async findLatestByEventId(eventId: string): Promise<Proposal | null> {
        const proposals = await this.findByEventId(eventId);
        return proposals[0] || null;
    }

    /**
     * Find proposal by token (for client access)
     */
    async findByToken(token: string): Promise<Proposal | null> {
        const items = this.getAll();
        return items.find(p => p.token === token) || null;
    }

    /**
     * Find by status
     */
    async findByStatus(status: ProposalStatus): Promise<Proposal[]> {
        return this.findMany({ status } as Partial<Proposal>);
    }

    /**
     * Get next version number for event
     */
    async getNextVersion(eventId: string): Promise<number> {
        const proposals = await this.findByEventId(eventId);
        return proposals.length > 0 ? proposals[0].version + 1 : 1;
    }

    /**
     * Create new proposal
     */
    async createProposal(
        eventId: string,
        title: string,
        items: Omit<ProposalItem, 'id' | 'proposalId'>[],
        discount: number = 0,
        taxRate: number = 0.18,
        tier?: 'silver' | 'gold' | 'platinum' | 'custom'
    ): Promise<ActionResult<Proposal>> {
        const version = await this.getNextVersion(eventId);
        const subtotal = items.reduce((sum, item) => sum + item.total, 0);
        const tax = Math.round((subtotal - discount) * taxRate);
        const total = subtotal - discount + tax;

        const proposalData: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt'> = {
            eventId,
            version,
            status: 'draft',
            title,
            subtotal,
            discount,
            tax,
            total,
            items: items.map((item, index) => ({
                ...item,
                id: `item_${Date.now()}_${index}`,
                proposalId: '', // Will be set after creation
            })),
            token: this.generateToken(),
            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
            tier,
        };

        return this.create(proposalData);
    }

    /**
     * Update proposal status
     */
    async updateStatus(id: string, status: ProposalStatus): Promise<ActionResult<Proposal>> {
        const updates: Partial<Proposal> = { status };

        if (status === 'viewed') {
            updates.viewedAt = new Date().toISOString();
        } else if (status === 'approved' || status === 'rejected') {
            updates.respondedAt = new Date().toISOString();
        }

        return this.update(id, updates);
    }

    /**
     * Mark as sent
     */
    async markAsSent(id: string): Promise<ActionResult<Proposal>> {
        return this.updateStatus(id, 'sent');
    }

    /**
     * Mark as viewed (when client opens)
     */
    async markAsViewed(id: string): Promise<ActionResult<Proposal>> {
        const proposal = await this.findById(id);
        if (!proposal) {
            return { success: false, error: 'Proposal not found', code: 'NOT_FOUND' };
        }
        // Only update if not already viewed
        if (!proposal.viewedAt) {
            return this.updateStatus(id, 'viewed');
        }
        return { success: true, data: proposal };
    }

    /**
     * Client approves proposal
     */
    async approve(id: string, clientNotes?: string): Promise<ActionResult<Proposal>> {
        return this.update(id, {
            status: 'approved',
            respondedAt: new Date().toISOString(),
            clientNotes,
        });
    }

    /**
     * Client rejects proposal
     */
    async reject(id: string, clientNotes?: string): Promise<ActionResult<Proposal>> {
        return this.update(id, {
            status: 'rejected',
            respondedAt: new Date().toISOString(),
            clientNotes,
        });
    }

    /**
     * Find pending proposals (sent but not responded)
     */
    async findPending(): Promise<Proposal[]> {
        const items = this.getAll();
        return items.filter(p => p.status === 'sent' || p.status === 'viewed');
    }
}

// Export singleton instance
export const proposalRepository = new ProposalRepositoryClass();
