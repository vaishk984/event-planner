'use server'

import { revalidatePath } from 'next/cache'
import { supabaseVendorRepository } from '@/lib/repositories/supabase-vendor-repository'
import { supabaseBookingRepository, type BookingRequest } from '@/lib/repositories/supabase-booking-repository'
import { getCurrentUser } from '@/actions/auth/login'
import type { Vendor, VendorPackage, ActionResult } from '@/types/domain'
import { supabaseVendorPackageRepository } from '@/lib/repositories/supabase-vendor-package-repository'

// ============================================
// QUERY ACTIONS
// ============================================

/**
 * Get current vendor profile
 */
export async function getVendorProfile(): Promise<Vendor | null> {
    const user = await getCurrentUser()
    if (!user) return null

    return supabaseVendorRepository.findByUserId(user.id)
}

/**
 * Get vendor by ID
 */
export async function getVendor(id: string): Promise<Vendor | null> {
    return supabaseVendorRepository.findById(id)
}

/**
 * Get all vendors (for marketplace)
 */
export async function getVendors(): Promise<Vendor[]> {
    return supabaseVendorRepository.findMany()
}

/**
 * Search vendors
 */
export async function searchVendors(
    query: string,
    filters?: { category?: string; city?: string; priceRange?: string }
): Promise<Vendor[]> {
    return supabaseVendorRepository.search(query, filters as any)
}

/**
 * Get top rated vendors
 */
export async function getTopRatedVendors(limit?: number): Promise<Vendor[]> {
    return supabaseVendorRepository.findTopRated(limit)
}

/**
 * Get vendor dashboard stats
 */
export async function getVendorDashboardStats() {
    const user = await getCurrentUser()
    if (!user) return null

    const vendor = await supabaseVendorRepository.findByUserId(user.id)
    if (!vendor) return null

    const stats = await supabaseBookingRepository.getVendorStats(vendor.id)

    return {
        ...stats,
        vendor,
    }
}

/**
 * Get detailed vendor earnings
 */
export async function getVendorEarnings() {
    const user = await getCurrentUser()
    if (!user) return null

    const vendor = await supabaseVendorRepository.findByUserId(user.id)
    if (!vendor) return null

    return supabaseBookingRepository.getEarningsDetails(vendor.id)
}

/**
 * Get booking requests for current vendor
 */
export async function getVendorBookingRequests(): Promise<BookingRequest[]> {
    const user = await getCurrentUser()
    if (!user) return []

    const vendor = await supabaseVendorRepository.findByUserId(user.id)
    if (!vendor) return []

    return supabaseBookingRepository.findByVendorId(vendor.id)
}

/**
 * Get pending booking requests for current vendor
 */
export async function getPendingBookingRequests(): Promise<BookingRequest[]> {
    const user = await getCurrentUser()
    if (!user) return []

    const vendor = await supabaseVendorRepository.findByUserId(user.id)
    if (!vendor) return []


    return supabaseBookingRepository.findPendingByVendorId(vendor.id)
}

/**
 * Get a single booking request by ID
 */
export async function getBookingRequest(id: string): Promise<BookingRequest | null> {
    const user = await getCurrentUser()
    if (!user) return null

    // Ensure the vendor owns this booking
    const booking = await supabaseBookingRepository.findByIdWithDetails(id)
    if (!booking) return null

    const vendor = await supabaseVendorRepository.findByUserId(user.id)
    if (!vendor || booking.vendorId !== vendor.id) return null

    return booking
}


// ============================================
// MUTATION ACTIONS
// ============================================

/**
 * Update vendor profile
 */
export async function updateVendorProfile(data: Partial<Vendor>): Promise<ActionResult<Vendor>> {
    const user = await getCurrentUser()
    if (!user) {
        return { success: false, error: 'Not authenticated', code: 'UNAUTHORIZED' }
    }

    const vendor = await supabaseVendorRepository.findByUserId(user.id)
    if (!vendor) {
        return { success: false, error: 'Vendor profile not found', code: 'NOT_FOUND' }
    }

    const result = await supabaseVendorRepository.update(vendor.id, data)

    if (result.success) {
        revalidatePath('/vendor')
        revalidatePath('/vendor/profile')
    }

    return result
}

/**
 * Accept a booking request
 */
export async function acceptBookingRequest(
    requestId: string,
    quotedAmount?: number
): Promise<ActionResult<BookingRequest>> {
    const user = await getCurrentUser()
    if (!user) {
        return { success: false, error: 'Not authenticated', code: 'UNAUTHORIZED' }
    }

    const result = await supabaseBookingRepository.accept(requestId, quotedAmount)

    if (result.success) {
        revalidatePath('/vendor')
        revalidatePath('/vendor/bookings')
    }

    return result
}

/**
 * Decline a booking request
 */
export async function declineBookingRequest(requestId: string): Promise<ActionResult<BookingRequest>> {
    const user = await getCurrentUser()
    if (!user) {
        return { success: false, error: 'Not authenticated', code: 'UNAUTHORIZED' }
    }

    const result = await supabaseBookingRepository.decline(requestId)

    if (result.success) {
        revalidatePath('/vendor')
        revalidatePath('/vendor/bookings')
    }

    return result
}

/**
 * Submit a quote for a booking request
 */
export async function submitQuote(
    requestId: string,
    quotedAmount: number
): Promise<ActionResult<BookingRequest>> {
    const user = await getCurrentUser()
    if (!user) {
        return { success: false, error: 'Not authenticated', code: 'UNAUTHORIZED' }
    }

    const result = await supabaseBookingRepository.submitQuote(requestId, quotedAmount)

    if (result.success) {
        revalidatePath('/vendor')
        revalidatePath('/vendor/bookings')
    }

    return result
}

// ============================================
// PACKAGE ACTIONS
// ============================================

/**
 * Get packages for current vendor
 */
export async function getVendorPackages(): Promise<VendorPackage[]> {
    const user = await getCurrentUser()
    if (!user) return []

    const vendor = await supabaseVendorRepository.findByUserId(user.id)
    if (!vendor) return []

    return supabaseVendorPackageRepository.findByVendorId(vendor.id)
}

/**
 * Create a new package
 */
export async function createVendorPackage(data: Partial<VendorPackage>): Promise<ActionResult<VendorPackage>> {
    const user = await getCurrentUser()
    if (!user) {
        return { success: false, error: 'Not authenticated', code: 'UNAUTHORIZED' }
    }

    const vendor = await supabaseVendorRepository.findByUserId(user.id)
    if (!vendor) {
        return { success: false, error: 'Vendor profile not found', code: 'NOT_FOUND' }
    }

    // Ensure package belongs to current vendor
    const packageData = {
        ...data,
        vendorId: vendor.id
    }

    // Cast to any to bypass strict type check for now, assuming validation happens in repo/db
    const result = await supabaseVendorPackageRepository.create(packageData as any)

    if (result.success) {
        revalidatePath('/vendor/profile')
    }

    return result
}

/**
 * Update a package
 */
export async function updateVendorPackage(id: string, data: Partial<VendorPackage>): Promise<ActionResult<VendorPackage>> {
    const user = await getCurrentUser()
    if (!user) {
        return { success: false, error: 'Not authenticated', code: 'UNAUTHORIZED' }
    }

    const vendor = await supabaseVendorRepository.findByUserId(user.id)
    if (!vendor) {
        return { success: false, error: 'Vendor profile not found', code: 'NOT_FOUND' }
    }

    // Verify ownership
    const existing = await supabaseVendorPackageRepository.findById(id)
    if (!existing || existing.vendorId !== vendor.id) {
        return { success: false, error: 'Package not found or unauthorized', code: 'NOT_FOUND' }
    }

    const result = await supabaseVendorPackageRepository.update(id, data)

    if (result.success) {
        revalidatePath('/vendor/profile')
    }

    return result
}

/**
 * Delete a package
 */
export async function deleteVendorPackage(id: string): Promise<ActionResult<void>> {
    const user = await getCurrentUser()
    if (!user) {
        return { success: false, error: 'Not authenticated', code: 'UNAUTHORIZED' }
    }

    const vendor = await supabaseVendorRepository.findByUserId(user.id)
    if (!vendor) {
        return { success: false, error: 'Vendor profile not found', code: 'NOT_FOUND' }
    }

    // Verify ownership
    const existing = await supabaseVendorPackageRepository.findById(id)
    if (!existing || existing.vendorId !== vendor.id) {
        return { success: false, error: 'Package not found or unauthorized', code: 'NOT_FOUND' }
    }

    const result = await supabaseVendorPackageRepository.delete(id)

    if (result.success) {
        revalidatePath('/vendor/profile')
    }

    return result
}
// ============================================
// AVAILABILITY ACTIONS
// ============================================

import { supabaseVendorAvailabilityRepository } from '@/lib/repositories/supabase-vendor-availability-repository'
import type { VendorAvailability } from '@/types/domain'

/**
 * Get vendor availability for a date range
 */
export async function getVendorAvailability(startDate: string, endDate: string): Promise<VendorAvailability[]> {
    const user = await getCurrentUser()
    if (!user) return []

    const vendor = await supabaseVendorRepository.findByUserId(user.id)
    if (!vendor) return []

    return supabaseVendorAvailabilityRepository.findByVendorId(vendor.id, startDate, endDate)
}

/**
 * Set vendor availability for a specific date
 */
export async function setVendorAvailability(date: string, status: 'available' | 'busy' | 'tentative', notes?: string): Promise<ActionResult<VendorAvailability>> {
    const user = await getCurrentUser()
    if (!user) {
        return { success: false, error: 'Not authenticated', code: 'UNAUTHORIZED' }
    }

    const vendor = await supabaseVendorRepository.findByUserId(user.id)
    if (!vendor) {
        return { success: false, error: 'Vendor profile not found', code: 'NOT_FOUND' }
    }

    const result = await supabaseVendorAvailabilityRepository.setAvailability({
        vendorId: vendor.id,
        date,
        status,
        notes
    })

    if (!result) {
        return { success: false, error: 'Failed to set availability', code: 'UPDATE_FAILED' }
    }

    revalidatePath('/vendor/calendar')
    return { success: true, data: result }
}

/**
 * Clear availability for a date (reset to default)
 */
export async function clearVendorAvailability(date: string): Promise<ActionResult<void>> {
    const user = await getCurrentUser()
    if (!user) {
        return { success: false, error: 'Not authenticated', code: 'UNAUTHORIZED' }
    }

    const vendor = await supabaseVendorRepository.findByUserId(user.id)
    if (!vendor) {
        return { success: false, error: 'Vendor profile not found', code: 'NOT_FOUND' }
    }

    const success = await supabaseVendorAvailabilityRepository.deleteByDate(vendor.id, date)

    if (!success) {
        return { success: false, error: 'Failed to clear availability', code: 'DELETE_FAILED' }
    }

    revalidatePath('/vendor/calendar')
    return { success: true, data: undefined }
}
