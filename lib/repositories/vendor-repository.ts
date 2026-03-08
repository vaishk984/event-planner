/**
 * Vendor Repository
 * 
 * Manages vendor data access.
 * Currently uses mock data, will connect to Supabase later.
 */

import { BaseRepository } from './base-repository';
import type { Vendor } from '@/types/domain';

// Mock data generator helper
const generateMockVendors = (): Vendor[] => {
    return Array.from({ length: 20 }).map((_, i) => ({
        id: `v${i}`,
        name: `Vendor ${i}`,
        category: i % 3 === 0 ? 'venue' : i % 3 === 1 ? 'catering' : 'photography',
        description: 'Quality service provider',
        phone: '9999999999',
        email: `vendor${i}@example.com`,
        city: 'Mumbai',
        serviceAreas: ['Mumbai'],
        basePrice: 50000,
        priceRange: 'mid',
        currency: 'INR',
        rating: 4.5,
        reviewCount: 10,
        images: [],
        isVerified: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    })) as Vendor[];
};

class VendorRepositoryClass extends BaseRepository<Vendor> {
    protected storageKey = 'planner-os-vendors';
    protected entityName = 'vendor';

    constructor() {
        super();
        // Seed some mock data if empty
        if (typeof window !== 'undefined' && !localStorage.getItem(this.storageKey)) {
            const mocks = generateMockVendors();
            localStorage.setItem(this.storageKey, JSON.stringify(mocks));
        }
    }

    async findByCategory(category: string): Promise<Vendor[]> {
        return this.findMany({ category: category as any });
    }

    async findAll(): Promise<Vendor[]> {
        return this.getAll();
    }
}

export const vendorRepository = new VendorRepositoryClass();
