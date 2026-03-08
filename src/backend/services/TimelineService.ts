/**
 * Timeline Service
 * 
 * Business logic for timeline/run sheet operations.
 */

import { TimelineRepository, timelineRepository } from '../repositories/TimelineRepository';
import { TimelineItem } from '../entities/TimelineItem';
import { NotFoundException, BusinessException } from '../exceptions';
import { createLogger } from '../utils';
import type { CreateTimelineItemDto, UpdateTimelineItemDto, UpdateTimelineStatusDto } from '../dto/request/timeline.dto';

const logger = createLogger('TimelineService');

// ============================================
// TEMPLATES
// ============================================

interface TemplateItem {
    startTime: string;
    title: string;
    owner: string;
    duration?: number;
    description?: string;
}

const TEMPLATES: Record<string, TemplateItem[]> = {
    wedding_ceremony: [
        { startTime: '06:00', title: 'Decor setup begins', owner: 'Decorator', duration: 180 },
        { startTime: '09:00', title: 'Sound check', owner: 'DJ Team', duration: 60 },
        { startTime: '10:00', title: 'Catering setup', owner: 'Caterer', duration: 120 },
        { startTime: '11:00', title: 'Groom arrival', owner: 'Coordinator', duration: 30 },
        { startTime: '11:30', title: 'Baraat procession', owner: 'Coordinator', duration: 60 },
        { startTime: '12:30', title: 'Wedding ceremony', owner: 'Pandit', duration: 90 },
        { startTime: '14:00', title: 'Lunch service', owner: 'Caterer', duration: 120 },
        { startTime: '16:00', title: 'Afternoon break', owner: 'Coordinator', duration: 120 },
        { startTime: '18:00', title: 'Reception setup', owner: 'Decorator', duration: 90 },
        { startTime: '19:30', title: 'Couple entry', owner: 'Anchor', duration: 30 },
        { startTime: '20:00', title: 'Dinner service', owner: 'Caterer', duration: 120 },
    ],
    reception: [
        { startTime: '16:00', title: 'Venue preparation', owner: 'Decorator', duration: 120 },
        { startTime: '18:00', title: 'Sound & lighting check', owner: 'DJ Team', duration: 60 },
        { startTime: '19:00', title: 'Guest arrival begins', owner: 'Coordinator', duration: 60 },
        { startTime: '19:30', title: 'Couple entry', owner: 'Anchor', duration: 30 },
        { startTime: '20:00', title: 'Welcome speech', owner: 'Anchor', duration: 15 },
        { startTime: '20:15', title: 'First dance', owner: 'DJ Team', duration: 15 },
        { startTime: '20:30', title: 'Dinner service', owner: 'Caterer', duration: 90 },
        { startTime: '22:00', title: 'DJ set & dancing', owner: 'DJ Team', duration: 120 },
        { startTime: '00:00', title: 'Event wrap-up', owner: 'Coordinator', duration: 60 },
    ],
    sangeet: [
        { startTime: '16:00', title: 'Venue & stage setup', owner: 'Decorator', duration: 180 },
        { startTime: '18:00', title: 'Sound check & AV setup', owner: 'DJ Team', duration: 60 },
        { startTime: '19:00', title: 'Guest arrival', owner: 'Coordinator', duration: 60 },
        { startTime: '19:30', title: 'Welcome drinks', owner: 'Caterer', duration: 30 },
        { startTime: '20:00', title: 'Dance performances begin', owner: 'Choreographer', duration: 90 },
        { startTime: '21:30', title: 'Dinner', owner: 'Caterer', duration: 60 },
        { startTime: '22:30', title: 'Open dancing', owner: 'DJ Team', duration: 90 },
    ],
    mehendi: [
        { startTime: '10:00', title: 'Venue setup', owner: 'Decorator', duration: 120 },
        { startTime: '12:00', title: 'Mehendi artists arrive', owner: 'Mehendi Team', duration: 30 },
        { startTime: '12:30', title: 'Guest arrival & mehendi begins', owner: 'Coordinator', duration: 240 },
        { startTime: '14:00', title: 'Lunch service', owner: 'Caterer', duration: 120 },
        { startTime: '16:30', title: 'Bride\'s mehendi session', owner: 'Mehendi Team', duration: 180 },
        { startTime: '19:30', title: 'Evening snacks & music', owner: 'Caterer', duration: 90 },
    ],
    haldi: [
        { startTime: '08:00', title: 'Venue setup', owner: 'Decorator', duration: 60 },
        { startTime: '09:00', title: 'Haldi ceremony begins', owner: 'Coordinator', duration: 120 },
        { startTime: '11:00', title: 'Brunch service', owner: 'Caterer', duration: 90 },
        { startTime: '12:30', title: 'Photo session', owner: 'Photographer', duration: 60 },
        { startTime: '13:30', title: 'Wrap-up', owner: 'Coordinator', duration: 30 },
    ],
};

// ============================================
// SERVICE CLASS
// ============================================

export class TimelineService {
    constructor(private repository: TimelineRepository = timelineRepository) { }

    /**
     * Get all timeline items for a function
     */
    async getByFunction(functionId: string): Promise<TimelineItem[]> {
        return this.repository.findByFunction(functionId);
    }

    /**
     * Get all timeline items for an event
     */
    async getByEvent(eventId: string): Promise<TimelineItem[]> {
        return this.repository.findByEvent(eventId);
    }

    /**
     * Get single item by ID
     */
    async getById(id: string): Promise<TimelineItem> {
        const item = await this.repository.findById(id);
        if (!item) {
            throw new NotFoundException('TimelineItem', id);
        }
        return item;
    }

    /**
     * Create a new timeline item
     */
    async create(dto: CreateTimelineItemDto): Promise<TimelineItem> {
        // Get next sort order
        const maxOrder = await this.repository.getMaxSortOrder(dto.functionId);

        const item = new TimelineItem({
            id: crypto.randomUUID(),
            eventId: dto.eventId,
            functionId: dto.functionId,
            startTime: dto.startTime,
            endTime: dto.endTime ?? null,
            duration: dto.duration ?? null,
            title: dto.title,
            description: dto.description ?? null,
            location: dto.location ?? null,
            owner: dto.owner,
            vendorId: dto.vendorId ?? null,
            status: 'pending',
            notes: dto.notes ?? null,
            dependsOn: dto.dependsOn ?? null,
            sortOrder: maxOrder + 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await this.repository.create(item);
        logger.info('Timeline item created', { id: item.id, title: item.title });

        return item;
    }

    /**
     * Update a timeline item
     */
    async update(id: string, dto: UpdateTimelineItemDto): Promise<TimelineItem> {
        const item = await this.getById(id);

        item.updateDetails({
            title: dto.title,
            description: dto.description,
            location: dto.location,
            owner: dto.owner,
            vendorId: dto.vendorId,
            notes: dto.notes,
        });

        item.updateTiming({
            startTime: dto.startTime,
            endTime: dto.endTime,
            duration: dto.duration,
        });

        if (dto.dependsOn !== undefined) {
            item.setDependencies(dto.dependsOn ?? []);
        }

        await this.repository.update(id, item);
        logger.info('Timeline item updated', { id: item.id });

        return item;
    }

    /**
     * Update item status
     */
    async updateStatus(id: string, dto: UpdateTimelineStatusDto): Promise<TimelineItem> {
        const item = await this.getById(id);

        if (!item.canTransitionTo(dto.status)) {
            throw new BusinessException(
                `Cannot transition from '${item.status}' to '${dto.status}'`
            );
        }

        item.transitionTo(dto.status);

        if (dto.notes) {
            item.updateDetails({ notes: dto.notes });
        }

        await this.repository.update(id, item);
        logger.info('Timeline item status updated', { id: item.id, status: dto.status });

        return item;
    }

    /**
     * Reorder timeline items
     */
    async reorder(items: Array<{ id: string; sortOrder: number }>): Promise<void> {
        await this.repository.updateSortOrders(items);
        logger.info('Timeline items reordered', { count: items.length });
    }

    /**
     * Delete a timeline item
     */
    async delete(id: string): Promise<void> {
        const item = await this.getById(id);
        await this.repository.delete(id);
        logger.info('Timeline item deleted', { id: item.id });
    }

    /**
     * Apply a template to a function
     */
    async applyTemplate(
        eventId: string,
        functionId: string,
        templateName: string,
        clearExisting: boolean = false
    ): Promise<TimelineItem[]> {
        const template = TEMPLATES[templateName];
        if (!template) {
            throw new BusinessException(`Template '${templateName}' not found`);
        }

        // Clear existing items if requested
        if (clearExisting) {
            await this.repository.deleteByFunction(functionId);
        }

        // Get starting sort order
        const maxOrder = clearExisting ? -1 : await this.repository.getMaxSortOrder(functionId);

        // Create items from template
        const createdItems: TimelineItem[] = [];

        for (let i = 0; i < template.length; i++) {
            const t = template[i];
            const item = new TimelineItem({
                id: crypto.randomUUID(),
                eventId,
                functionId,
                startTime: t.startTime,
                endTime: null,
                duration: t.duration ?? null,
                title: t.title,
                description: t.description ?? null,
                location: null,
                owner: t.owner,
                vendorId: null,
                status: 'pending',
                notes: null,
                dependsOn: null,
                sortOrder: maxOrder + 1 + i,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            await this.repository.create(item);
            createdItems.push(item);
        }

        logger.info('Template applied', {
            templateName,
            functionId,
            itemCount: createdItems.length
        });

        return createdItems;
    }

    /**
     * Get timeline overview for dashboard
     */
    async getOverview(functionId: string) {
        const stats = await this.repository.getOverview(functionId);
        const nextItem = await this.repository.getNextPending(functionId);

        return {
            ...stats,
            nextItem,
            completionPercent: stats.total > 0
                ? Math.round((stats.completed / stats.total) * 100)
                : 0,
        };
    }

    /**
     * Get available template names
     */
    getTemplateNames(): string[] {
        return Object.keys(TEMPLATES);
    }
}

// Singleton instance
export const timelineService = new TimelineService();
