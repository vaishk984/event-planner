/**
 * Supabase Vendor Package Repository
 * 
 * Handles CRUD operations for vendor packages.
 */

import { SupabaseBaseRepository } from './supabase-base-repository'
import type { VendorPackage } from '@/types/domain'

class SupabaseVendorPackageRepositoryClass extends SupabaseBaseRepository<VendorPackage> {
    protected tableName = 'vendor_packages'
    protected entityName = 'vendor_package'

    /**
     * Map DB row to Domain entity
     */
    protected fromDb(row: any): VendorPackage {
        if (!row) return row
        const obj = super.fromDb(row) as any

        return {
            ...obj,
            vendorId: obj.vendorId || obj.vendor_id,
            isPopular: obj.isPopular || obj.is_popular || false,
            isActive: obj.isActive || obj.is_active || true,
            inclusions: obj.inclusions || []
        } as VendorPackage
    }

    /**
     * Map Domain entity to DB row
     */
    protected toDb(entity: Partial<VendorPackage>): any {
        const row = super.toDb(entity)

        if (entity.vendorId) {
            row.vendor_id = entity.vendorId
            delete row.vendorId
        }
        if (typeof entity.isPopular !== 'undefined') {
            row.is_popular = entity.isPopular
            delete row.isPopular
        }
        if (typeof entity.isActive !== 'undefined') {
            row.is_active = entity.isActive
            delete row.isActive
        }

        return row
    }

    /**
     * Find packages by vendor ID
     */
    async findByVendorId(vendorId: string): Promise<VendorPackage[]> {
        const supabase = await this.getClient()

        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('vendor_id', vendorId)
            .order('price', { ascending: true })

        if (error) return []
        return this.fromDbArray(data || [])
    }
}

export const supabaseVendorPackageRepository = new SupabaseVendorPackageRepositoryClass()
