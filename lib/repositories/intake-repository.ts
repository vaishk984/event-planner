/**
 * Intake Repository
 * 
 * Data access layer for Intake entity.
 * Supports dual access pattern:
 * - By ID: for planner internal access
 * - By Token: for client external access
 * 
 * Based on: docs/ARCHITECTURE.md (Section 2.1)
 */

import { BaseRepository } from './base-repository';
import type { Intake, IntakeStatus, ActionResult } from '@/types/domain';

class IntakeRepositoryClass extends BaseRepository<Intake> {
    protected storageKey = 'planner-os-intakes';
    protected entityName = 'intake';

    /**
     * Generate unique access token for client
     */
    generateAccessToken(): string {
        return `int_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 8)}`;
    }

    /**
     * Find intake by access token (for client access)
     */
    async findByToken(token: string): Promise<Intake | null> {
        const items = this.getAll();
        return items.find(intake => intake.token === token) || null;
    }

    /**
     * Find intakes by planner ID
     */
    async findByPlannerId(plannerId: string): Promise<Intake[]> {
        return this.findMany({ plannerId } as Partial<Intake>);
    }

    /**
     * Find intakes by status
     */
    async findByStatus(status: IntakeStatus): Promise<Intake[]> {
        return this.findMany({ status } as Partial<Intake>);
    }

    /**
     * Find submitted intakes (not yet converted)
     */
    async findPending(): Promise<Intake[]> {
        return this.findMany({ status: 'submitted' } as Partial<Intake>);
    }

    /**
     * Find by client phone
     */
    async findByPhone(phone: string): Promise<Intake[]> {
        const normalizedPhone = phone.replace(/\D/g, '').slice(-10);
        const items = this.getAll();
        return items.filter(intake => {
            const intakePhone = intake.phone?.replace(/\D/g, '').slice(-10);
            return intakePhone === normalizedPhone;
        });
    }

    /**
     * Update intake status
     */
    async updateStatus(id: string, status: IntakeStatus): Promise<ActionResult<Intake>> {
        const updates: Partial<Intake> = { status };
        if (status === 'submitted') {
            updates.submittedAt = new Date().toISOString();
        }
        return this.update(id, updates);
    }

    /**
     * Mark as converted to event
     */
    async markAsConverted(id: string, eventId: string): Promise<ActionResult<Intake>> {
        return this.update(id, {
            status: 'converted' as IntakeStatus,
            convertedEventId: eventId,
        });
    }

    /**
     * Get recent intakes (last 7 days)
     */
    async findRecent(): Promise<Intake[]> {
        const items = this.getAll();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        return items.filter(intake => {
            const createdAt = new Date(intake.createdAt);
            return createdAt >= sevenDaysAgo;
        }).sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    /**
     * Check if token exists
     */
    async tokenExists(token: string): Promise<boolean> {
        const intake = await this.findByToken(token);
        return intake !== null;
    }

    /**
     * Get status counts
     */
    async getStatusCounts(): Promise<Record<IntakeStatus, number>> {
        const items = this.getAll();
        const counts: Record<string, number> = {
            draft: 0,
            in_progress: 0,
            submitted: 0,
            converted: 0,
        };

        items.forEach(intake => {
            if (counts[intake.status] !== undefined) {
                counts[intake.status]++;
            }
        });

        return counts as Record<IntakeStatus, number>;
    }
}

// Export singleton instance
export const intakeRepository = new IntakeRepositoryClass();
