/**
 * Vendor Entity
 * 
 * Domain model for vendors/service providers.
 */

import { BaseEntity } from './BaseEntity';

export type VendorCategory =
    | 'photography'
    | 'videography'
    | 'catering'
    | 'decoration'
    | 'music'
    | 'venue'
    | 'makeup'
    | 'transportation'
    | 'other';


export interface VendorData {
    id: string;
    userId?: string; // Optional for CRM vendors
    plannerId?: string; // Owner if CRM vendor
    companyName: string;
    contactName?: string;
    email?: string;
    phone?: string;
    website?: string;
    category: VendorCategory;
    description?: string;
    location: string;
    priceRange: { min: number; max: number };
    rating: number;
    reviewCount: number;
    isVerified: boolean;
    imageUrl?: string;
    portfolioUrls?: string[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export class Vendor extends BaseEntity {
    readonly userId?: string;
    readonly plannerId?: string;
    companyName: string;
    contactName?: string;
    email?: string;
    phone?: string;
    website?: string;
    category: VendorCategory;
    description?: string;
    location: string;
    priceRange: { min: number; max: number };
    private _rating: number;
    private _reviewCount: number;
    isVerified: boolean;
    imageUrl?: string;
    portfolioUrls: string[];

    constructor(data: VendorData) {
        super(data);
        this.userId = data.userId;
        this.plannerId = data.plannerId;
        this.companyName = data.companyName;
        this.contactName = data.contactName;
        this.email = data.email;
        this.phone = data.phone;
        this.website = data.website;
        this.category = data.category;
        this.description = data.description;
        this.location = data.location;
        this.priceRange = data.priceRange;
        this._rating = data.rating;
        this._reviewCount = data.reviewCount;
        this.isVerified = data.isVerified;
        this.imageUrl = data.imageUrl;
        this.portfolioUrls = data.portfolioUrls || [];
    }

    // ============================================
    // GETTERS
    // ============================================

    get rating(): number {
        return this._rating;
    }

    get reviewCount(): number {
        return this._reviewCount;
    }

    get averagePrice(): number {
        return (this.priceRange.min + this.priceRange.max) / 2;
    }

    get priceLevel(): 'budget' | 'mid-range' | 'premium' {
        if (this.averagePrice < 5000) return 'budget';
        if (this.averagePrice < 20000) return 'mid-range';
        return 'premium';
    }

    get displayRating(): string {
        return this._rating.toFixed(1);
    }

    // ============================================
    // BUSINESS METHODS
    // ============================================

    /**
     * Add a new review and update rating
     */
    addReview(reviewRating: number): void {
        const totalRating = this._rating * this._reviewCount + reviewRating;
        this._reviewCount += 1;
        this._rating = totalRating / this._reviewCount;
        this.touch();
    }

    /**
     * Check if vendor matches search criteria
     */
    matchesCriteria(criteria: {
        category?: VendorCategory;
        location?: string;
        maxPrice?: number;
        minRating?: number;
    }): boolean {
        if (criteria.category && this.category !== criteria.category) return false;
        if (criteria.location && !this.location.toLowerCase().includes(criteria.location.toLowerCase())) return false;
        if (criteria.maxPrice && this.priceRange.min > criteria.maxPrice) return false;
        if (criteria.minRating && this._rating < criteria.minRating) return false;
        return true;
    }

    // ============================================
    // SERIALIZATION
    // ============================================

    toJSON(): VendorData {
        return {
            id: this.id,
            userId: this.userId,
            plannerId: this.plannerId,
            companyName: this.companyName,
            contactName: this.contactName,
            email: this.email,
            phone: this.phone,
            website: this.website,
            category: this.category,
            description: this.description,
            location: this.location,
            priceRange: this.priceRange,
            rating: this._rating,
            reviewCount: this._reviewCount,
            isVerified: this.isVerified,
            imageUrl: this.imageUrl,
            portfolioUrls: this.portfolioUrls,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
        };
    }

    static fromDatabase(row: Record<string, unknown>): Vendor {
        return new Vendor({
            id: row.id as string,
            userId: row.user_id as string | undefined, // Now optional
            plannerId: row.planner_id as string | undefined,
            companyName: row.company_name as string,
            contactName: row.contact_name as string | undefined,
            email: row.email as string | undefined,
            phone: row.phone as string | undefined,
            website: row.website as string | undefined,
            category: row.category as VendorCategory || 'other',
            description: row.description as string | undefined,
            location: row.location as string || '',
            priceRange: {
                min: Number(row.start_price || row.price_min || 0),
                max: Number(row.end_price || row.price_max || 0),
            },
            rating: Number(row.rating || row.quality_score || 0),
            reviewCount: Number(row.review_count || 0),
            isVerified: Boolean(row.is_verified || false),
            imageUrl: row.image_url as string | undefined,
            portfolioUrls: (row.portfolio_urls as string[]) || [], // Handles JSONB array
            createdAt: row.created_at as string,
            updatedAt: row.updated_at as string,
        });
    }
}
