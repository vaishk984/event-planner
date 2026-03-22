'use server'
import { getSession } from '@/lib/session';
import { createLogger } from '@/lib/logger'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { Vendor, VendorData } from '@/src/backend/entities/Vendor'

const logger = createLogger('Vendors')

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createVendorSchema = z.object({
    companyName: z.string().min(2, "Company name is required"),
    contactName: z.string().optional(),
    email: z.string().email("Invalid email").optional().or(z.literal('')),
    phone: z.string().optional(),
    website: z.string().url("Invalid URL").optional().or(z.literal('')),
    category: z.enum([
        'photography', 'videography', 'catering', 'decoration',
        'music', 'venue', 'makeup', 'transportation', 'other'
    ]),
    description: z.string().optional(),
    location: z.string().optional(),
    startPrice: z.coerce.number().min(0).optional(),
    endPrice: z.coerce.number().min(0).optional(),
})

const updateVendorSchema = createVendorSchema.partial().extend({
    id: z.string().uuid("Invalid ID"),
})

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

/**
 * Get all vendors for the current planner
 */
export async function getVendors() {
    try {
        const supabase = await createClient()
        const session = await getSession(); const authError = null;
        
        if (authError || !session?.userId) return { error: 'Unauthorized' }

        // Fetch both:
        // 1. Marketplace vendors (status = 'active', available to all planners)
        // 2. Planner's own CRM vendors (planner_id = current user)
        const { data, error } = await supabase
            .from('vendors')
            .select('*')
            .or(`planner_id.eq.${session?.userId},status.eq.active`)
            .order('company_name', { ascending: true })

        if (error) {
            logger.error('Failed to fetch vendors', error)
            return { error: 'Failed to fetch vendors' }
        }

        // Map to Entity
        const vendors = data.map(row => Vendor.fromDatabase(row))

        // Return plain objects for cleaner client usage
        return { data: vendors.map(v => v.toJSON()) }
    } catch (error) {
        logger.error('Unexpected error in getVendors', error)
        return { error: 'An unexpected error occurred' }
    }
}

/**
 * Create a new CRM vendor
 */
export async function createVendor(formData: FormData) {
    try {
        const supabase = await createClient()
        const session = await getSession(); const authError = null;
        
        if (authError || !session?.userId) return { error: 'Unauthorized' }

        const rawData = {
            companyName: formData.get('companyName'),
            contactName: formData.get('contactName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            website: formData.get('website'),
            category: formData.get('category'),
            description: formData.get('description'),
            location: formData.get('location'),
            startPrice: formData.get('startPrice'),
            endPrice: formData.get('endPrice'),
        }

        const validation = createVendorSchema.safeParse(rawData)
        if (!validation.success) {
            return { error: validation.error.issues[0].message }
        }

        const validData = validation.data

        const { data, error } = await supabase
            .from('vendors')
            .insert({
                planner_id: session?.userId,
                company_name: validData.companyName,
                contact_name: validData.contactName || null,
                email: validData.email || null,
                phone: validData.phone || null,
                website: validData.website || null,
                category: validData.category,
                description: validData.description || null,
                location: validData.location || '',
                start_price: validData.startPrice || 0,
                end_price: validData.endPrice || 0,
                status: 'active'
            })
            .select()
            .single()

        if (error) {
            logger.error('Failed to create vendor', error)
            return { error: 'Failed to create vendor' }
        }

        revalidatePath('/planner/vendors')
        return { success: true, data: Vendor.fromDatabase(data).toJSON() }
    } catch (error) {
        logger.error('Unexpected error in createVendor', error)
        return { error: 'An unexpected error occurred' }
    }
}

/**
 * Update a vendor
 */
export async function updateVendor(formData: FormData) {
    try {
        const supabase = await createClient()
        const session = await getSession(); const authError = null;
        
        if (authError || !session?.userId) return { error: 'Unauthorized' }

        const rawData = {
            id: formData.get('id'),
            companyName: formData.get('companyName'),
            contactName: formData.get('contactName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            website: formData.get('website'),
            category: formData.get('category'),
            description: formData.get('description'),
            location: formData.get('location'),
            startPrice: formData.get('startPrice'),
            endPrice: formData.get('endPrice'),
        }

        const validation = updateVendorSchema.safeParse(rawData)
        if (!validation.success) {
            return { error: validation.error.issues[0].message }
        }

        const { id, ...updates } = validation.data

        // Verify ownership
        const { data: existing } = await supabase
            .from('vendors')
            .select('planner_id')
            .eq('id', id)
            .single()

        if (!existing || existing.planner_id !== session?.userId) {
            return { error: 'Unauthorized to update this vendor' }
        }

        const { data, error } = await supabase
            .from('vendors')
            .update({
                company_name: updates.companyName,
                contact_name: updates.contactName || null,
                email: updates.email || null,
                phone: updates.phone || null,
                website: updates.website || null,
                category: updates.category,
                description: updates.description || null,
                location: updates.location || '',
                start_price: updates.startPrice || 0,
                end_price: updates.endPrice || 0,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single()

        if (error) {
            logger.error('Failed to update vendor', error)
            return { error: 'Failed to update vendor' }
        }

        revalidatePath('/planner/vendors')
        return { success: true, data: Vendor.fromDatabase(data).toJSON() }
    } catch (error) {
        logger.error('Unexpected error in updateVendor', error)
        return { error: 'An unexpected error occurred' }
    }
}

/**
 * Delete a vendor
 */
export async function deleteVendor(id: string) {
    try {
        const supabase = await createClient()
        const session = await getSession(); const authError = null;
        
        if (authError || !session?.userId) return { error: 'Unauthorized' }

        const { error } = await supabase
            .from('vendors')
            .delete()
            .eq('id', id)
            .eq('planner_id', session?.userId) // Security check in query

        if (error) {
            logger.error('Failed to delete vendor', error)
            return { error: 'Failed to delete vendor' }
        }

        revalidatePath('/planner/vendors')
        return { success: true }
    } catch (error) {
        logger.error('Unexpected error in deleteVendor', error)
        return { error: 'An unexpected error occurred' }
    }
}
