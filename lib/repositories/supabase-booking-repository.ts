/**
 * Supabase Booking Repository
 * 
 * Production-ready booking request repository backed by Supabase.
 */

import { SupabaseBaseRepository } from './supabase-base-repository'
import type { ActionResult } from '@/types/domain'

/** Shape of a booking row joined with events from Supabase */
interface BookingRowWithEvents extends Record<string, unknown> {
    events?: {
        name?: string
        event_date?: string
        end_date?: string
        city?: string
        venue?: string
        guest_count?: number
    } | null
    event_name?: string
    event_date?: string
    city?: string
    venue?: string
    guest_count?: number
    status?: string
    quoted_amount?: number
}

/** Shape of a status-only row from Supabase */
interface StatusRow {
    status: string
}

/** Shape of an earnings-only row from Supabase */
interface EarningsRow {
    quoted_amount: number | null
}

// Booking status type
export type BookingStatus =
    | 'pending'
    | 'quoted'
    | 'accepted'
    | 'declined'
    | 'completed'
    | 'cancelled'

// Booking request interface
export interface BookingRequest {
    id: string
    eventId: string
    vendorId: string
    plannerId: string

    // Event details (denormalized for quick access)
    eventName: string
    eventDate: string
    eventEndDate?: string // Multi-day support
    city: string
    venue: string
    guestCount: number

    // Service details
    service: string // Photography, Catering, etc.
    requirements?: string

    // Pricing
    budget: number
    quotedAmount?: number

    // UI Helpers (Joined data)
    plannerName?: string
    clientName?: string

    // Status
    status: BookingStatus

    // Timestamps
    createdAt: string
    updatedAt: string
    quotedAt?: string
    respondedAt?: string
}

class SupabaseBookingRepositoryClass extends SupabaseBaseRepository<BookingRequest> {
    protected tableName = 'booking_requests'
    protected entityName = 'booking'

    /**
     * Find bookings for a vendor with event details
     */
    async findByVendorId(vendorId: string): Promise<BookingRequest[]> {
        const supabase = await this.getClient()

        const { data, error } = await supabase
            .from(this.tableName)
            .select(`
                *,
                events (
                    id,
                    name,
                    event_date,
                    end_date,
                    city,
                    guest_count
                )
            `)
            .eq('vendor_id', vendorId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('❌ [BookingRepository] Error fetching vendor bookings:', error)
            return []
        }

        // Transform to include event details
        const transformed = (data || []).map((row: BookingRowWithEvents) => {
            const booking = this.fromDb(row as Record<string, unknown>)
            return {
                ...booking,
                eventName: row.events?.name || row.event_name || 'Unknown Event',
                eventDate: row.events?.event_date || row.event_date || '',
                eventEndDate: row.events?.end_date || '', // Map end_date
                city: row.events?.city || row.city || '',
                venue: row.events?.venue || row.venue || 'TBD',
                guestCount: row.events?.guest_count || row.guest_count || 0,
            }
        })

        return transformed
    }


    /**
     * Find pending bookings for a vendor with event details
     */
    async findPendingByVendorId(vendorId: string): Promise<BookingRequest[]> {
        const supabase = await this.getClient()

        const { data, error } = await supabase
            .from(this.tableName)
            .select(`
                *,
                events (
                    id,
                    name,
                    event_date,
                    end_date,
                    city,
                    guest_count
                )
            `)
            .eq('vendor_id', vendorId)
            .eq('status', 'pending')  // Only query for 'pending' status
            .order('created_at', { ascending: false })

        if (error) {
            console.error('❌ [BookingRepository] Error fetching pending vendor bookings:', error)
            return []
        }

        // Transform to include event details
        return (data || []).map((row: BookingRowWithEvents) => {
            const booking = this.fromDb(row as Record<string, unknown>)
            return {
                ...booking,
                eventName: row.events?.name || row.event_name || 'Unknown Event',
                eventDate: row.events?.event_date || row.event_date || '',
                eventEndDate: row.events?.end_date || '', // Map end_date
                city: row.events?.city || row.city || '',
                venue: row.events?.venue || row.venue || 'TBD',
                guestCount: row.events?.guest_count || row.guest_count || 0,
            }
        })
    }

    /**
     * Find a single booking request by ID with full details
     */
    async findByIdWithDetails(id: string): Promise<BookingRequest | null> {
        const supabase = await this.getClient()

        const { data, error } = await supabase
            .from(this.tableName)
            .select(`
                *,
                events (
                    id,
                    name,
                    event_date,
                    end_date,
                    city,
                    guest_count
                )
            `)
            .eq('id', id)
            .single()

        if (error) {
            console.error('❌ [BookingRepository] Error fetching booking by ID:', error)
            return null
        }

        const row = data as BookingRowWithEvents
        const booking = this.fromDb(data as Record<string, unknown>)
        return {
            ...booking,
            eventName: row.events?.name || row.event_name || 'Unknown Event',
            eventDate: row.events?.event_date || row.event_date || '',
            eventEndDate: row.events?.end_date || '', // Map end_date
            city: row.events?.city || row.city || '',
            venue: row.events?.venue || row.venue || 'TBD',
            guestCount: row.events?.guest_count || row.guest_count || 0,
        }
    }


    /**
     * Find bookings for an event
     */
    async findByEventId(eventId: string): Promise<BookingRequest[]> {
        const supabase = await this.getClient()

        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('event_id', eventId)
            .order('created_at', { ascending: false })

        if (error) return []
        return this.fromDbArray(data || [])
    }

    /**
     * Accept a booking request
     */
    async accept(id: string, quotedAmount?: number): Promise<ActionResult<BookingRequest>> {
        return this.update(id, {
            status: 'accepted',
            quotedAmount,
            respondedAt: new Date().toISOString()
        } as Partial<BookingRequest>)
    }

    /**
     * Decline a booking request
     */
    async decline(id: string): Promise<ActionResult<BookingRequest>> {
        return this.update(id, {
            status: 'declined',
            respondedAt: new Date().toISOString()
        } as Partial<BookingRequest>)
    }

    /**
     * Submit a quote
     */
    async submitQuote(id: string, quotedAmount: number): Promise<ActionResult<BookingRequest>> {
        return this.update(id, {
            status: 'quoted',
            quotedAmount,
            quotedAt: new Date().toISOString()
        } as Partial<BookingRequest>)
    }

    /**
     * Get vendor statistics
     */
    async getVendorStats(vendorId: string): Promise<{
        pending: number
        accepted: number
        completed: number
        totalEarnings: number
    }> {
        const supabase = await this.getClient()

        const stats = {
            pending: 0,
            accepted: 0,
            completed: 0,
            totalEarnings: 0,
        }

        // Count by status
        const { data: statusData } = await supabase
            .from(this.tableName)
            .select('status')
            .eq('vendor_id', vendorId)

        if (statusData) {
            statusData.forEach((row: StatusRow) => {
                if (row.status === 'pending' || row.status === 'draft' || row.status === 'quote_requested') {
                    stats.pending++
                } else if (row.status === 'accepted' || row.status === 'confirmed' || row.status === 'quoted') {
                    stats.accepted++
                } else if (row.status === 'completed') {
                    stats.completed++
                }
            })
        }

        // Sum earnings from completed bookings
        const { data: earningsData } = await supabase
            .from(this.tableName)
            .select('quoted_amount')
            .eq('vendor_id', vendorId)
            .eq('status', 'completed')

        if (earningsData) {
            stats.totalEarnings = earningsData.reduce(
                (sum: number, r: EarningsRow) => sum + (r.quoted_amount || 0),
                0
            )
        }

        return stats
    }

    /**
     * Get detailed earnings for charts and tables
     */
    async getEarningsDetails(vendorId: string): Promise<{
        monthly: { month: string; amount: number; count: number }[];
        recent: BookingRequest[];
        stats: {
            thisMonth: number;
            lastMonth: number;
            total: number;
            pending: number;
            completedCount: number;
            avgPerEvent: number;
        };
    }> {
        const supabase = await this.getClient()

        // Fetch all relevant bookings
        const { data, error } = await supabase
            .from(this.tableName)
            .select(`
                *,
                events (name, event_date, city, venue, guest_count)
            `)
            .eq('vendor_id', vendorId)
            .in('status', ['completed', 'accepted', 'quoted', 'pending']) // Include pending for potential revenue
            .order('created_at', { ascending: false })

        if (error || !data) return {
            monthly: [],
            recent: [],
            stats: { thisMonth: 0, lastMonth: 0, total: 0, pending: 0, completedCount: 0, avgPerEvent: 0 }
        }

        const bookings = this.fromDbArray(data || [])

        // Process stats
        const now = new Date()
        const currentMonth = now.getMonth()
        const currentYear = now.getFullYear()
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

        let thisMonthEarnings = 0
        let lastMonthEarnings = 0
        let totalEarnings = 0
        let pendingEarnings = 0 // Accepted/Quoted/Pending
        let completedCount = 0

        const monthlyMap = new Map<string, { amount: number, count: number }>()

        bookings.forEach(b => {
            const date = new Date(b.createdAt)
            const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            const amount = b.quotedAmount || b.budget || 0

            // Monthly Breakdown (using created_at for now, ideally paid_at)
            if (!monthlyMap.has(monthKey)) {
                monthlyMap.set(monthKey, { amount: 0, count: 0 })
            }

            if (b.status === 'completed') {
                const m = monthlyMap.get(monthKey)!
                m.amount += amount
                m.count += 1

                totalEarnings += amount
                completedCount++

                if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
                    thisMonthEarnings += amount
                }
                if (date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear) {
                    lastMonthEarnings += amount
                }
            } else {
                // Pending revenue
                if (['accepted', 'quoted', 'pending'].includes(b.status)) {
                    pendingEarnings += amount
                }
            }
        })

        // Convert map to array (last 6 months)
        const monthly = Array.from(monthlyMap.entries())
            .map(([month, data]) => ({ month, ...data }))
            .slice(0, 6)

        const avgPerEvent = completedCount > 0 ? totalEarnings / completedCount : 0

        return {
            monthly,
            recent: bookings.slice(0, 10), // Return top 10 recent
            stats: {
                thisMonth: thisMonthEarnings,
                lastMonth: lastMonthEarnings,
                total: totalEarnings,
                pending: pendingEarnings,
                completedCount,
                avgPerEvent
            }
        }
    }
}

// Export singleton instance
export const supabaseBookingRepository = new SupabaseBookingRepositoryClass()
