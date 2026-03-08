/**
 * Intake Service
 * 
 * Business logic for Intake operations.
 * Handles both planner capture and client self-service flows.
 * 
 * Based on: docs/ARCHITECTURE.md (Section 2.2)
 */

import { supabaseIntakeRepository as intakeRepository } from '@/lib/repositories/supabase-intake-repository';
import { supabaseEventRepository as eventRepository } from '@/lib/repositories/supabase-event-repository';
import { createEventFromSubmission } from '@/lib/domain/event';
import type {
    Intake,
    IntakeStatus,
    IntakeCreator,
    EventType,
    ActionResult
} from '@/types/domain';

// Default empty intake data
export const DEFAULT_INTAKE: Omit<Intake, 'id' | 'token' | 'createdAt' | 'updatedAt'> = {
    createdBy: 'planner',
    status: 'draft',
    currentTab: 1,

    clientName: '',
    phone: '',
    email: '',
    source: undefined,

    eventType: undefined,
    eventDate: '',
    eventEndDate: '',
    isDateFlexible: false,
    guestCount: 150,
    budgetMin: 1000000,
    budgetMax: 5000000,
    city: '',
    venueType: undefined,

    personalVenue: {
        name: '',
        address: '',
        capacity: 0,
        type: '',
        parking: '',
        photos: [],
        photosSkipped: false,
    },
    food: {
        cuisines: [],
        dietary: [],
        servingStyle: '',
        budgetLevel: '',
        specialRequests: '',
        likedVendors: [],
    },
    decor: {
        style: '',
        colorMood: '',
        intensity: '',
        lighting: '',
        flowers: [],
        specialRequests: '',
        likedVendors: [],
    },
    entertainment: {
        type: '',
        genres: [],
        specialRequests: '',
        likedVendors: [],
    },
    photography: {
        package: '',
        drone: false,
        preWedding: false,
        specialRequests: '',
        likedVendors: [],
    },
    services: {
        makeup: false,
        mehendi: false,
        anchor: false,
        valet: false,
        pandit: false,
        specialRequests: '',
    },

    likedVendors: [],
    specialRequests: '',
};

export class IntakeService {
    // ============================================
    // QUERY OPERATIONS
    // ============================================

    /**
     * Get intake by ID (for planner)
     */
    async getIntake(id: string): Promise<Intake | null> {
        return intakeRepository.findById(id);
    }

    /**
     * Get intake by token (for client)
     */
    async getIntakeByToken(token: string): Promise<Intake | null> {
        return intakeRepository.findByToken(token);
    }

    /**
     * Get all intakes for a planner
     */
    async getIntakesByPlanner(plannerId: string): Promise<Intake[]> {
        return intakeRepository.findByPlannerId(plannerId);
    }

    /**
     * Get pending intakes (submitted but not converted)
     */
    async getPendingIntakes(): Promise<Intake[]> {
        return intakeRepository.findPending();
    }

    /**
     * Get all intakes
     */
    async getAllIntakes(): Promise<Intake[]> {
        return intakeRepository.findMany();
    }

    /**
     * Get status counts for dashboard
     */
    async getStatusCounts(): Promise<Record<IntakeStatus, number>> {
        return intakeRepository.getStatusCounts();
    }

    // ============================================
    // MUTATION OPERATIONS
    // ============================================

    /**
     * Create new intake (from planner capture or for client link)
     */
    async createIntake(
        data: Partial<Intake>,
        createdBy: IntakeCreator,
        plannerId?: string
    ): Promise<ActionResult<Intake>> {
        const intakeData = {
            ...DEFAULT_INTAKE,
            ...data,
            createdBy,
            plannerId,
            token: intakeRepository.generateAccessToken(),
            status: 'draft' as IntakeStatus,
            currentTab: 1,
        };

        return intakeRepository.create(intakeData);
    }

    /**
     * Generate shareable link for client
     */
    async generateShareLink(intakeId: string): Promise<ActionResult<{ token: string; url: string }>> {
        const intake = await intakeRepository.findById(intakeId);
        if (!intake) {
            return { success: false, error: 'Intake not found', code: 'NOT_FOUND' };
        }

        const url = `/intake/${intake.token}`;
        return {
            success: true,
            data: {
                token: intake.token,
                url
            }
        };
    }

    /**
     * Update intake data
     */
    async updateIntake(id: string, data: Partial<Intake>): Promise<ActionResult<Intake>> {
        const intake = await intakeRepository.findById(id);
        if (!intake) {
            return { success: false, error: 'Intake not found', code: 'NOT_FOUND' };
        }

        // Can't update converted intakes
        if (intake.status === 'converted') {
            return { success: false, error: 'Intake already converted', code: 'CONFLICT' };
        }

        // Auto-update status to in_progress if draft
        const newStatus = intake.status === 'draft' ? 'in_progress' : intake.status;

        return intakeRepository.update(id, {
            ...data,
            status: data.status || newStatus,
        });
    }

    /**
     * Update intake by token (for client access)
     */
    async updateIntakeByToken(token: string, data: Partial<Intake>): Promise<ActionResult<Intake>> {
        const intake = await intakeRepository.findByToken(token);
        if (!intake) {
            return { success: false, error: 'Intake not found', code: 'NOT_FOUND' };
        }

        return this.updateIntake(intake.id, data);
    }

    /**
     * Submit intake (mark as complete)
     */
    async submitIntake(id: string): Promise<ActionResult<Intake>> {
        const intake = await intakeRepository.findById(id);
        if (!intake) {
            return { success: false, error: 'Intake not found', code: 'NOT_FOUND' };
        }

        // Validate required fields
        if (!intake.clientName || !intake.phone) {
            return {
                success: false,
                error: 'Client name and phone are required',
                code: 'VALIDATION_ERROR'
            };
        }

        return intakeRepository.updateStatus(id, 'submitted');
    }

    /**
     * Submit intake by token
     */
    async submitIntakeByToken(token: string): Promise<ActionResult<Intake>> {
        const intake = await intakeRepository.findByToken(token);
        if (!intake) {
            return { success: false, error: 'Intake not found', code: 'NOT_FOUND' };
        }

        return this.submitIntake(intake.id);
    }

    /**
     * Convert intake to event
     */
    async convertToEvent(intakeId: string, plannerId: string): Promise<ActionResult<{ intake: Intake; eventId: string }>> {
        const intake = await intakeRepository.findById(intakeId);
        if (!intake) {
            return { success: false, error: 'Intake not found', code: 'NOT_FOUND' };
        }

        if (intake.status === 'converted') {
            return { success: false, error: 'Intake already converted', code: 'CONFLICT' };
        }

        // Create event from intake
        const eventData = createEventFromSubmission(intake, plannerId);
        const eventResult = await eventRepository.create(eventData);

        if (!eventResult.success) {
            return { success: false, error: eventResult.error, code: eventResult.code };
        }

        // Mark intake as converted
        const updateResult = await intakeRepository.markConverted(intakeId, eventResult.data.id);
        if (!updateResult.success) {
            // Rollback event creation would go here in a real system
            return { success: false, error: updateResult.error, code: updateResult.code };
        }

        return {
            success: true,
            data: {
                intake: updateResult.data,
                eventId: eventResult.data.id
            }
        };
    }

    /**
     * Delete intake (only drafts)
     */
    async deleteIntake(id: string): Promise<ActionResult<void>> {
        const intake = await intakeRepository.findById(id);
        if (!intake) {
            return { success: false, error: 'Intake not found', code: 'NOT_FOUND' };
        }

        if (intake.status !== 'draft') {
            return {
                success: false,
                error: 'Only draft intakes can be deleted',
                code: 'FORBIDDEN'
            };
        }

        return intakeRepository.delete(id);
    }
}

// Export singleton instance
export const intakeService = new IntakeService();
