/**
 * BookingRepository
 * 
 * Data access for BookingRequest entities.
 */

import { BaseRepository } from './BaseRepository';
import { BookingRequest, BookingRequestRow, BookingStatus } from '../entities';

export class BookingRepository extends BaseRepository<BookingRequest, BookingRequestRow> {
    protected tableName = 'booking_requests';
    protected entityName = 'BookingRequest';

    protected toEntity(row: BookingRequestRow): BookingRequest {
        return BookingRequest.fromRow(row);
    }

    protected toRow(entity: Partial<BookingRequest>): Partial<BookingRequestRow> {
        if (entity instanceof BookingRequest) {
            return entity.toRow();
        }
        return entity as unknown as Partial<BookingRequestRow>;
    }

    /**
     * Get bookings by event
     */
    async getByEvent(eventId: string): Promise<BookingRequest[]> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('event_id', eventId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(row => this.toEntity(row as BookingRequestRow));
    }

    /**
     * Get bookings by vendor
     */
    async getByVendor(vendorId: string): Promise<BookingRequest[]> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('vendor_id', vendorId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(row => this.toEntity(row as BookingRequestRow));
    }

    /**
     * Get bookings by planner
     */
    async getByPlanner(plannerId: string): Promise<BookingRequest[]> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('planner_id', plannerId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(row => this.toEntity(row as BookingRequestRow));
    }

    /**
     * Get bookings by status
     */
    async getByStatus(status: BookingStatus): Promise<BookingRequest[]> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('status', status)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(row => this.toEntity(row as BookingRequestRow));
    }

    /**
     * Get pending requests for vendor
     */
    async getPendingForVendor(vendorId: string): Promise<BookingRequest[]> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('vendor_id', vendorId)
            .eq('status', 'quote_requested')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(row => this.toEntity(row as BookingRequestRow));
    }

    /**
     * Get active bookings
     */
    async getActive(plannerId: string): Promise<BookingRequest[]> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('planner_id', plannerId)
            .in('status', ['confirmed', 'deposit_paid', 'in_progress'])
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(row => this.toEntity(row as BookingRequestRow));
    }

    /**
     * Count by status
     */
    async countByStatus(plannerId: string): Promise<Record<BookingStatus, number>> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('status')
            .eq('planner_id', plannerId);

        if (error) throw error;

        const counts: Record<string, number> = {};
        (data || []).forEach((row: { status: string }) => {
            counts[row.status] = (counts[row.status] || 0) + 1;
        });

        return counts as Record<BookingStatus, number>;
    }
}
