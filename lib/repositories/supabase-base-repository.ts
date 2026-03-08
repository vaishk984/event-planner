/**
 * Supabase Base Repository
 * 
 * Abstract base class for Supabase-backed data access.
 * Handles snake_case <-> camelCase transformation automatically.
 */

import { createClient } from '@/lib/supabase/server'
import { toCamelCaseKeys, toSnakeCaseKeys } from '@/lib/utils/case-transform'
import type { ActionResult } from '@/types/domain'

export abstract class SupabaseBaseRepository<T extends { id: string }> {
    protected abstract tableName: string
    protected abstract entityName: string

    /**
     * Get Supabase client
     */
    protected async getClient() {
        return await createClient()
    }

    /**
     * Transform DB row to TypeScript type (snake_case -> camelCase)
     */
    protected fromDb(row: any): T {
        if (!row) return row
        return toCamelCaseKeys(row) as T
    }

    /**
     * Transform DB rows to TypeScript types
     */
    protected fromDbArray(rows: any[]): T[] {
        if (!rows) return []
        return rows.map(row => this.fromDb(row))
    }

    /**
     * Transform TypeScript object to DB format (camelCase -> snake_case)
     */
    protected toDb(data: any): any {
        if (!data) return data
        return toSnakeCaseKeys(data)
    }

    /**
     * Find by ID
     */
    async findById(id: string): Promise<T | null> {
        const supabase = await this.getClient()

        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('id', id)
            .single()

        if (error || !data) return null
        return this.fromDb(data)
    }

    /**
     * Find many with optional filter
     */
    async findMany(filter?: Partial<T>): Promise<T[]> {
        const supabase = await this.getClient()

        let query = supabase.from(this.tableName).select('*')

        if (filter) {
            const dbFilter = this.toDb(filter)
            Object.entries(dbFilter).forEach(([key, value]) => {
                if (value !== undefined) {
                    query = query.eq(key, value)
                }
            })
        }

        const { data, error } = await query.order('created_at', { ascending: false })

        if (error) {
            console.error(`Error fetching ${this.entityName}:`, error)
            return []
        }

        return this.fromDbArray(data || [])
    }

    /**
     * Create new item
     */
    async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<ActionResult<T>> {
        const supabase = await this.getClient()
        const dbData = this.toDb(data)

        const { data: created, error } = await supabase
            .from(this.tableName)
            .insert(dbData)
            .select()
            .single()

        if (error) {
            console.error(`Error creating ${this.entityName}:`, error)
            return {
                success: false,
                error: error.message,
                code: 'CREATE_FAILED'
            }
        }

        return { success: true, data: this.fromDb(created) }
    }

    /**
     * Update existing item
     */
    async update(id: string, data: Partial<T>): Promise<ActionResult<T>> {
        const supabase = await this.getClient()

        // Remove id from update data and convert to snake_case
        const { id: _, createdAt, updatedAt, ...updateFields } = data as any
        const dbData = this.toDb(updateFields)

        const { data: updated, error } = await supabase
            .from(this.tableName)
            .update(dbData)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error(`Error updating ${this.entityName}:`, error)
            return {
                success: false,
                error: error.message,
                code: 'UPDATE_FAILED'
            }
        }

        return { success: true, data: this.fromDb(updated) }
    }

    /**
     * Delete item
     */
    async delete(id: string): Promise<ActionResult<void>> {
        const supabase = await this.getClient()

        const { error } = await supabase
            .from(this.tableName)
            .delete()
            .eq('id', id)

        if (error) {
            console.error(`Error deleting ${this.entityName}:`, error)
            return {
                success: false,
                error: error.message,
                code: 'DELETE_FAILED'
            }
        }

        return { success: true, data: undefined }
    }

    /**
     * Count items
     */
    async count(filter?: Partial<T>): Promise<number> {
        const supabase = await this.getClient()

        let query = supabase
            .from(this.tableName)
            .select('*', { count: 'exact', head: true })

        if (filter) {
            const dbFilter = this.toDb(filter)
            Object.entries(dbFilter).forEach(([key, value]) => {
                if (value !== undefined) {
                    query = query.eq(key, value)
                }
            })
        }

        const { count, error } = await query

        if (error) {
            console.error(`Error counting ${this.entityName}:`, error)
            return 0
        }

        return count || 0
    }

    /**
     * Check if exists
     */
    async exists(id: string): Promise<boolean> {
        const supabase = await this.getClient()

        const { count, error } = await supabase
            .from(this.tableName)
            .select('*', { count: 'exact', head: true })
            .eq('id', id)

        return !error && (count || 0) > 0
    }
}
