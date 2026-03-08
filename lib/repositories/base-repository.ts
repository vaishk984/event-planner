/**
 * Base Repository
 * 
 * Abstract base class for all data access.
 * Currently uses localStorage, will migrate to Supabase in Sprint D.
 * 
 * Based on: docs/ARCHITECTURE.md (Section 2.1)
 */

import type { ActionResult } from '@/types/domain';

export abstract class BaseRepository<T extends { id: string }> {
    protected abstract storageKey: string;
    protected abstract entityName: string;

    /**
     * Get all items from storage
     */
    protected getAll(): T[] {
        if (typeof window === 'undefined') return [];
        const stored = localStorage.getItem(this.storageKey);
        if (!stored) return [];
        try {
            return JSON.parse(stored) as T[];
        } catch {
            return [];
        }
    }

    /**
     * Save all items to storage
     */
    protected saveAll(items: T[]): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem(this.storageKey, JSON.stringify(items));
    }

    /**
     * Generate unique ID
     */
    protected generateId(): string {
        return `${this.entityName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Find by ID
     */
    async findById(id: string): Promise<T | null> {
        const items = this.getAll();
        return items.find(item => item.id === id) || null;
    }

    /**
     * Find many with optional filter
     */
    async findMany(filter?: Partial<T>): Promise<T[]> {
        let items = this.getAll();

        if (filter) {
            items = items.filter(item => {
                return Object.entries(filter).every(([key, value]) => {
                    return (item as any)[key] === value;
                });
            });
        }

        return items;
    }

    /**
     * Create new item
     */
    async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<ActionResult<T>> {
        try {
            const now = new Date().toISOString();
            const newItem = {
                ...(data as object),
                id: this.generateId(),
                createdAt: now,
                updatedAt: now,
            } as unknown as T;

            const items = this.getAll();
            items.push(newItem);
            this.saveAll(items);

            return { success: true, data: newItem };
        } catch (error) {
            return {
                success: false,
                error: `Failed to create ${this.entityName}`,
                code: 'CREATE_FAILED'
            };
        }
    }

    /**
     * Update existing item
     */
    async update(id: string, data: Partial<T>): Promise<ActionResult<T>> {
        try {
            const items = this.getAll();
            const index = items.findIndex(item => item.id === id);

            if (index === -1) {
                return {
                    success: false,
                    error: `${this.entityName} not found`,
                    code: 'NOT_FOUND'
                };
            }

            const updatedItem = {
                ...items[index],
                ...data,
                id, // Ensure ID isn't changed
                updatedAt: new Date().toISOString(),
            } as T;

            items[index] = updatedItem;
            this.saveAll(items);

            return { success: true, data: updatedItem };
        } catch (error) {
            return {
                success: false,
                error: `Failed to update ${this.entityName}`,
                code: 'UPDATE_FAILED'
            };
        }
    }

    /**
     * Delete item
     */
    async delete(id: string): Promise<ActionResult<void>> {
        try {
            const items = this.getAll();
            const index = items.findIndex(item => item.id === id);

            if (index === -1) {
                return {
                    success: false,
                    error: `${this.entityName} not found`,
                    code: 'NOT_FOUND'
                };
            }

            items.splice(index, 1);
            this.saveAll(items);

            return { success: true, data: undefined };
        } catch (error) {
            return {
                success: false,
                error: `Failed to delete ${this.entityName}`,
                code: 'DELETE_FAILED'
            };
        }
    }

    /**
     * Count items
     */
    async count(filter?: Partial<T>): Promise<number> {
        const items = await this.findMany(filter);
        return items.length;
    }

    /**
     * Check if exists
     */
    async exists(id: string): Promise<boolean> {
        const item = await this.findById(id);
        return item !== null;
    }
}
