/**
 * Base Entity
 * 
 * Abstract base class for all domain entities.
 * Similar to JPA's @MappedSuperclass.
 */

export interface BaseEntityData {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

export abstract class BaseEntity {
    readonly id: string;
    readonly createdAt: Date;
    updatedAt: Date;

    constructor(data: { id: string; createdAt?: Date | string; updatedAt?: Date | string }) {
        this.id = data.id;
        this.createdAt = data.createdAt instanceof Date
            ? data.createdAt
            : new Date(data.createdAt || Date.now());
        this.updatedAt = data.updatedAt instanceof Date
            ? data.updatedAt
            : new Date(data.updatedAt || Date.now());
    }

    /**
     * Mark entity as updated
     */
    protected touch(): void {
        this.updatedAt = new Date();
    }

    /**
     * Convert entity to plain object
     */
    abstract toJSON(): unknown;

    /**
     * Check if this entity equals another
     */
    equals(other: BaseEntity): boolean {
        return this.id === other.id;
    }
}
