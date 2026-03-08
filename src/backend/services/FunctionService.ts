/**
 * FunctionService
 * 
 * Business logic for EventFunction operations.
 */

import { EventFunction, FunctionType } from '../entities';
import { FunctionRepository } from '../repositories';
import { CreateFunctionDto, UpdateFunctionDto } from '../dto/request';
import { NotFoundException } from '../exceptions';

export class FunctionService {
    private repository: FunctionRepository;

    constructor(repository?: FunctionRepository) {
        this.repository = repository || new FunctionRepository();
    }

    /**
     * Get function by ID
     */
    async getById(id: string): Promise<EventFunction> {
        const fn = await this.repository.findById(id);
        if (!fn) throw new NotFoundException('Function', id);
        return fn;
    }

    /**
     * Get all functions for an event
     */
    async getByEvent(eventId: string): Promise<EventFunction[]> {
        return this.repository.getByEvent(eventId);
    }

    /**
     * Create a new function
     */
    async create(dto: CreateFunctionDto): Promise<EventFunction> {
        const sortOrder = await this.repository.getNextSortOrder(dto.eventId);

        const fn = new EventFunction({
            id: crypto.randomUUID(),
            eventId: dto.eventId,
            name: dto.name,
            type: dto.type as FunctionType,
            date: dto.date || null,
            startTime: dto.startTime || null,
            endTime: dto.endTime || null,
            venueName: dto.venueName || null,
            venueAddress: dto.venueAddress || null,
            guestCount: dto.guestCount || null,
            budget: dto.budget || null,
            notes: dto.notes || null,
            sortOrder,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return this.repository.create(fn);
    }

    /**
     * Update a function
     */
    async update(id: string, dto: UpdateFunctionDto): Promise<EventFunction> {
        const fn = await this.getById(id);

        if (dto.name !== undefined) fn.name = dto.name;
        if (dto.type !== undefined) fn.type = dto.type as FunctionType;
        if (dto.date !== undefined) fn.date = dto.date;
        if (dto.startTime !== undefined) fn.startTime = dto.startTime;
        if (dto.endTime !== undefined) fn.endTime = dto.endTime;
        if (dto.venueName !== undefined) fn.venueName = dto.venueName;
        if (dto.venueAddress !== undefined) fn.venueAddress = dto.venueAddress;
        if (dto.guestCount !== undefined) fn.guestCount = dto.guestCount;
        if (dto.budget !== undefined) fn.budget = dto.budget;
        if (dto.notes !== undefined) fn.notes = dto.notes;

        return this.repository.update(id, fn);
    }

    /**
     * Delete a function
     */
    async delete(id: string): Promise<void> {
        await this.getById(id); // Ensure exists
        await this.repository.delete(id);
    }

    /**
     * Reorder functions
     */
    async reorder(items: Array<{ id: string; sortOrder: number }>): Promise<void> {
        await this.repository.reorder(items);
    }

    /**
     * Get function count for event
     */
    async getCount(eventId: string): Promise<number> {
        return this.repository.countByEvent(eventId);
    }

    /**
     * Get available function types
     */
    getAvailableTypes(): Array<{ value: FunctionType; label: string }> {
        return [
            { value: 'wedding', label: 'Wedding Ceremony' },
            { value: 'reception', label: 'Reception' },
            { value: 'sangeet', label: 'Sangeet' },
            { value: 'mehendi', label: 'Mehendi' },
            { value: 'haldi', label: 'Haldi' },
            { value: 'cocktail', label: 'Cocktail Party' },
            { value: 'after_party', label: 'After Party' },
            { value: 'ceremony', label: 'Ceremony' },
            { value: 'conference', label: 'Conference' },
            { value: 'dinner', label: 'Dinner' },
            { value: 'custom', label: 'Custom' },
        ];
    }
}

// Singleton instance
export const functionService = new FunctionService();
