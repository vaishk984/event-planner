/**
 * Base Repository
 * 
 * Abstract base class for all data access.
 * Similar to Spring Data JPA's JpaRepository.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DatabaseConfig } from '../config';
import { BaseEntity } from '../entities';
import { NotFoundException } from '../exceptions';
import { createLogger } from '../utils';

const logger = createLogger('Repository');

export interface FindOptions {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface FindResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

export abstract class BaseRepository<TEntity extends BaseEntity, TData = Record<string, unknown>> {
    protected abstract tableName: string;
    protected abstract entityName: string;

    private _supabase: SupabaseClient | null = null;

    /**
     * Get Supabase client instance
     */
    protected get supabase(): SupabaseClient {
        if (!this._supabase) {
            this._supabase = createClient(
                DatabaseConfig.supabase.url,
                DatabaseConfig.supabase.anonKey
            );
        }
        return this._supabase;
    }

    /**
     * Convert database row to entity
     */
    protected abstract toEntity(row: TData): TEntity;

    /**
     * Convert entity to database row format
     */
    protected abstract toRow(entity: Partial<TEntity>): Partial<TData>;

    // ============================================
    // CRUD OPERATIONS
    // ============================================

    /**
     * Find entity by ID
     */
    async findById(id: string): Promise<TEntity | null> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            logger.error(`Failed to find ${this.entityName}`, error, { id });
            throw error;
        }

        return data ? this.toEntity(data as TData) : null;
    }

    /**
     * Find entity by ID or throw
     */
    async findByIdOrThrow(id: string): Promise<TEntity> {
        const entity = await this.findById(id);
        if (!entity) {
            throw new NotFoundException(this.entityName, id);
        }
        return entity;
    }

    /**
     * Find all entities with pagination
     */
    async findAll(options: FindOptions = {}): Promise<FindResult<TEntity>> {
        const { page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'desc' } = options;
        const offset = (page - 1) * limit;

        // Get total count
        const { count, error: countError } = await this.supabase
            .from(this.tableName)
            .select('*', { count: 'exact', head: true });

        if (countError) {
            logger.error(`Failed to count ${this.entityName}`, countError);
            throw countError;
        }

        // Get paginated data
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .order(sortBy, { ascending: sortOrder === 'asc' })
            .range(offset, offset + limit - 1);

        if (error) {
            logger.error(`Failed to find all ${this.entityName}`, error);
            throw error;
        }

        return {
            data: (data as TData[]).map(row => this.toEntity(row)),
            total: count || 0,
            page,
            limit,
        };
    }

    /**
     * Create new entity
     */
    async create(entityData: Partial<TEntity>): Promise<TEntity> {
        const row = this.toRow(entityData);

        const { data, error } = await this.supabase
            .from(this.tableName)
            .insert(row)
            .select()
            .single();

        if (error) {
            logger.error(`Failed to create ${this.entityName}`, error);
            throw error;
        }

        logger.info(`Created ${this.entityName}`, { id: data.id });
        return this.toEntity(data as TData);
    }

    /**
     * Update entity
     */
    async update(id: string, entityData: Partial<TEntity>): Promise<TEntity> {
        const row = {
            ...this.toRow(entityData),
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await this.supabase
            .from(this.tableName)
            .update(row)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                throw new NotFoundException(this.entityName, id);
            }
            logger.error(`Failed to update ${this.entityName}`, error, { id });
            throw error;
        }

        logger.info(`Updated ${this.entityName}`, { id });
        return this.toEntity(data as TData);
    }

    /**
     * Delete entity
     */
    async delete(id: string): Promise<void> {
        const { error } = await this.supabase
            .from(this.tableName)
            .delete()
            .eq('id', id);

        if (error) {
            logger.error(`Failed to delete ${this.entityName}`, error, { id });
            throw error;
        }

        logger.info(`Deleted ${this.entityName}`, { id });
    }

    /**
     * Check if entity exists
     */
    async exists(id: string): Promise<boolean> {
        const { count, error } = await this.supabase
            .from(this.tableName)
            .select('id', { count: 'exact', head: true })
            .eq('id', id);

        if (error) {
            logger.error(`Failed to check existence of ${this.entityName}`, error, { id });
            throw error;
        }

        return (count || 0) > 0;
    }

    /**
     * Count all entities
     */
    async count(): Promise<number> {
        const { count, error } = await this.supabase
            .from(this.tableName)
            .select('*', { count: 'exact', head: true });

        if (error) {
            logger.error(`Failed to count ${this.entityName}`, error);
            throw error;
        }

        return count || 0;
    }
}
