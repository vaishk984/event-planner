/**
 * Submission Repository
 * 
 * Data access layer for Client Submissions.
 * Based on: docs/ARCHITECTURE.md (Section 2.1)
 */

import { BaseRepository } from './base-repository';
import type { ClientSubmission, ActionResult } from '@/types/domain';

class SubmissionRepositoryClass extends BaseRepository<ClientSubmission> {
    protected storageKey = 'client-submissions';
    protected entityName = 'submission';

    /**
     * Find submission by token
     */
    async findByToken(token: string): Promise<ClientSubmission | null> {
        const items = this.getAll();
        return items.find(sub => sub.token === token) || null;
    }

    /**
     * Find pending submissions (not yet converted)
     */
    async findPending(): Promise<ClientSubmission[]> {
        return this.findMany({ status: 'submitted' } as Partial<ClientSubmission>);
    }

    /**
     * Find by planner ID
     */
    async findByPlannerId(plannerId: string): Promise<ClientSubmission[]> {
        return this.findMany({ plannerId } as Partial<ClientSubmission>);
    }

    /**
     * Find by client phone
     */
    async findByPhone(phone: string): Promise<ClientSubmission[]> {
        const normalizedPhone = phone.replace(/\D/g, '').slice(-10);
        const items = this.getAll();
        return items.filter(sub => {
            const subPhone = sub.phone?.replace(/\D/g, '').slice(-10);
            return subPhone === normalizedPhone;
        });
    }

    /**
     * Mark as submitted
     */
    async markAsSubmitted(id: string): Promise<ActionResult<ClientSubmission>> {
        return this.update(id, {
            status: 'submitted',
            submittedAt: new Date().toISOString(),
        } as Partial<ClientSubmission>);
    }

    /**
     * Mark as converted to event
     */
    async markAsConverted(id: string, eventId: string): Promise<ActionResult<ClientSubmission>> {
        return this.update(id, {
            status: 'converted',
            convertedEventId: eventId,
        } as Partial<ClientSubmission>);
    }

    /**
     * Get recent submissions (last 7 days)
     */
    async findRecent(): Promise<ClientSubmission[]> {
        const items = this.getAll();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        return items.filter(sub => {
            const createdAt = new Date(sub.createdAt);
            return createdAt >= sevenDaysAgo;
        }).sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    /**
     * Generate unique token
     */
    generateToken(): string {
        return `sub_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 8)}`;
    }
}

// Export singleton instance
export const submissionRepository = new SubmissionRepositoryClass();
