import { SupabaseBaseRepository } from './supabase-base-repository'
import type { VendorAvailability } from '@/types/domain'

export class SupabaseVendorAvailabilityRepository extends SupabaseBaseRepository<VendorAvailability> {
    protected tableName = 'vendor_availability'
    protected entityName = 'VendorAvailability'

    /**
     * Find availability for a specific vendor within a date range
     */
    async findByVendorId(vendorId: string, startDate?: string, endDate?: string): Promise<VendorAvailability[]> {
        const supabase = await this.getClient()

        let query = supabase
            .from(this.tableName)
            .select('*')
            .eq('vendor_id', vendorId)

        if (startDate) {
            query = query.gte('date', startDate)
        }
        if (endDate) {
            query = query.lte('date', endDate)
        }

        const { data, error } = await query.order('date', { ascending: true })

        if (error) {
            console.error(`Error fetching ${this.entityName}:`, error)
            return []
        }

        return this.fromDbArray(data || [])
    }

    /**
     * Set availability (Upsert)
     */
    async setAvailability(data: Partial<VendorAvailability>): Promise<VendorAvailability | null> {
        const supabase = await this.getClient()
        const dbData = this.toDb(data)

        // Upsert based on vendor_id and date unique constraint
        const { data: result, error } = await supabase
            .from(this.tableName)
            .upsert(dbData, { onConflict: 'vendor_id,date' })
            .select()
            .single()

        if (error) {
            console.error(`Error setting ${this.entityName}:`, error)
            return null
        }

        return this.fromDb(result)
    }

    /**
     * Delete availability by date (reset to default)
     */
    async deleteByDate(vendorId: string, date: string): Promise<boolean> {
        const supabase = await this.getClient()

        const { error } = await supabase
            .from(this.tableName)
            .delete()
            .match({ vendor_id: vendorId, date: date })

        if (error) {
            console.error(`Error deleting ${this.entityName}:`, error)
            return false
        }

        return true
    }

    protected toDb(entity: Partial<VendorAvailability>): any {
        const row = super.toDb(entity)

        if (entity.vendorId) {
            row.vendor_id = entity.vendorId
            delete row.vendorId
        }
        if (entity.eventId) {
            row.event_id = entity.eventId
            delete row.eventId
        }

        return row
    }

    protected fromDb(row: any): VendorAvailability {
        const obj = super.fromDb(row)
        return {
            ...obj,
            vendorId: obj.vendorId || row.vendor_id,
            eventId: obj.eventId || row.event_id
        } as VendorAvailability
    }
}

export const supabaseVendorAvailabilityRepository = new SupabaseVendorAvailabilityRepository()
