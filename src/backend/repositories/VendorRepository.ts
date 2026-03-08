/**
 * Vendor Repository
 * 
 * Data access layer for Vendor entities.
 */

import { BaseRepository, FindOptions, FindResult } from './BaseRepository';
import { Vendor, VendorCategory } from '../entities';
import { createLogger } from '../utils';

const logger = createLogger('VendorRepository');

interface VendorRow {
    id: string;
    user_id: string;
    company_name: string;
    category: string;
    description?: string;
    location: string;
    price_min: number;
    price_max: number;
    quality_score: number;
    review_count: number;
    is_verified: boolean;
    image_url?: string;
    portfolio_urls?: string[];
    created_at: string;
    updated_at: string;
}

export interface VendorSearchCriteria {
    category?: VendorCategory;
    location?: string;
    maxPrice?: number;
    minRating?: number;
    isVerified?: boolean;
}

export class VendorRepository extends BaseRepository<Vendor, VendorRow> {
    protected tableName = 'vendors';
    protected entityName = 'Vendor';

    protected toEntity(row: VendorRow): Vendor {
        return Vendor.fromDatabase(row as unknown as Record<string, unknown>);
    }

    protected toRow(entity: Partial<Vendor>): Partial<VendorRow> {
        const row: Partial<VendorRow> = {};

        if (entity.userId) row.user_id = entity.userId;
        if (entity.companyName) row.company_name = entity.companyName;
        if (entity.category) row.category = entity.category;
        if (entity.description !== undefined) row.description = entity.description;
        if (entity.location) row.location = entity.location;
        if (entity.priceRange) {
            row.price_min = entity.priceRange.min;
            row.price_max = entity.priceRange.max;
        }
        if (entity.isVerified !== undefined) row.is_verified = entity.isVerified;
        if (entity.imageUrl !== undefined) row.image_url = entity.imageUrl;
        if (entity.portfolioUrls) row.portfolio_urls = entity.portfolioUrls;

        return row;
    }

    // ============================================
    // CUSTOM QUERIES
    // ============================================

    /**
     * Search vendors with criteria
     */
    async search(criteria: VendorSearchCriteria, options: FindOptions = {}): Promise<FindResult<Vendor>> {
        const { page = 1, limit = 20, sortBy = 'quality_score', sortOrder = 'desc' } = options;
        const offset = (page - 1) * limit;

        let query = this.supabase.from(this.tableName).select('*', { count: 'exact' });

        if (criteria.category) {
            query = query.eq('category', criteria.category);
        }
        if (criteria.location) {
            query = query.ilike('location', `%${criteria.location}%`);
        }
        if (criteria.maxPrice) {
            query = query.lte('price_min', criteria.maxPrice);
        }
        if (criteria.minRating) {
            query = query.gte('quality_score', criteria.minRating);
        }
        if (criteria.isVerified !== undefined) {
            query = query.eq('is_verified', criteria.isVerified);
        }

        const { data, count, error } = await query
            .order(sortBy, { ascending: sortOrder === 'asc' })
            .range(offset, offset + limit - 1);

        if (error) {
            logger.error('Failed to search vendors', error, { criteria });
            throw error;
        }

        return {
            data: (data as VendorRow[]).map(row => this.toEntity(row)),
            total: count || 0,
            page,
            limit,
        };
    }

    /**
     * Find vendors by category
     */
    async findByCategory(category: VendorCategory): Promise<Vendor[]> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('category', category)
            .order('quality_score', { ascending: false });

        if (error) {
            logger.error('Failed to find vendors by category', error, { category });
            throw error;
        }

        return (data as VendorRow[]).map(row => this.toEntity(row));
    }

    /**
     * Find verified vendors
     */
    async findVerified(): Promise<Vendor[]> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('is_verified', true)
            .order('quality_score', { ascending: false });

        if (error) {
            logger.error('Failed to find verified vendors', error);
            throw error;
        }

        return (data as VendorRow[]).map(row => this.toEntity(row));
    }

    /**
     * Find vendor by user ID
     */
    async findByUserId(userId: string): Promise<Vendor | null> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            logger.error('Failed to find vendor by user ID', error, { userId });
            throw error;
        }

        return data ? this.toEntity(data as VendorRow) : null;
    }
}

// Export singleton instance
export const vendorRepository = new VendorRepository();
