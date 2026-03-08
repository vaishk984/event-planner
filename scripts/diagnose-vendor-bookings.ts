/**
 * Check what booking requests exist in the database
 * This script bypasses RLS to see raw data
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as fs from 'fs'

dotenv.config({ path: '.env.local' })

// Use SERVICE ROLE key to bypass RLS
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const VENDOR_ID = 'ab6b6e93-1f3d-4585-9705-84439dad7edc'

async function diagnoseBookings() {
    console.log('='.repeat(60))
    console.log('VENDOR BOOKING DIAGNOSIS')
    console.log('='.repeat(60))

    // 1. Check if vendor exists
    console.log('\n1️⃣ CHECKING VENDOR...')
    const { data: vendor, error: vendorError } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', VENDOR_ID)
        .single()

    if (vendorError) {
        console.error('❌ Vendor not found:', vendorError.message)
        return
    }

    console.log('✅ Vendor exists:')
    console.log('   ID:', vendor.id)
    console.log('   Name:', vendor.company_name)
    console.log('   User ID:', vendor.user_id)
    console.log('   Category:', vendor.category)

    // 2. Check ALL booking requests in system
    console.log('\n2️⃣ CHECKING ALL BOOKING REQUESTS IN SYSTEM...')
    const { data: allBookings, error: allError } = await supabase
        .from('booking_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

    console.log(`   Total booking requests in system: ${allBookings?.length || 0}`)
    if (allBookings && allBookings.length > 0) {
        console.log('   Recent bookings:')
        allBookings.forEach((b: any, i: number) => {
            console.log(`   ${i + 1}. Event: "${b.event_name}" | Vendor ID: ${b.vendor_id} | Status: ${b.status}`)
        })
    }

    // 3. Check bookings for THIS vendor
    console.log('\n3️⃣ CHECKING BOOKINGS FOR THIS VENDOR...')
    const { data: vendorBookings, error: vendorBookingsError } = await supabase
        .from('booking_requests')
        .select('*')
        .eq('vendor_id', VENDOR_ID)

    console.log(`   Bookings for vendor ${VENDOR_ID}: ${vendorBookings?.length || 0}`)
    if (vendorBookings && vendorBookings.length > 0) {
        vendorBookings.forEach((b: any, i: number) => {
            console.log(`   ${i + 1}. Event: "${b.event_name}" | Status: ${b.status} | Created: ${b.created_at}`)
        })
    } else {
        console.log('   ⚠️  NO BOOKINGS FOUND FOR THIS VENDOR')
    }

    // 4. Check if there are bookings with similar vendor names
    console.log('\n4️⃣ SEARCHING FOR SIMILAR VENDOR NAMES...')
    const { data: similarVendors, error: similarError } = await supabase
        .from('vendors')
        .select('id, company_name')
        .ilike('company_name', `%${vendor.company_name.split(' ')[0]}%`)

    if (similarVendors && similarVendors.length > 0) {
        console.log(`   Found ${similarVendors.length} vendors with similar names:`)
        for (const v of similarVendors) {
            const { data: bookings } = await supabase
                .from('booking_requests')
                .select('id, event_name, status')
                .eq('vendor_id', v.id)

            console.log(`   - "${v.company_name}" (${v.id}): ${bookings?.length || 0} bookings`)
        }
    }

    // 5. Summary
    console.log('\n' + '='.repeat(60))
    console.log('SUMMARY')
    console.log('='.repeat(60))
    console.log(`Vendor exists: ✅`)
    console.log(`Total bookings in system: ${allBookings?.length || 0}`)
    console.log(`Bookings for this vendor: ${vendorBookings?.length || 0}`)

    if (!vendorBookings || vendorBookings.length === 0) {
        console.log('\n⚠️  ISSUE IDENTIFIED:')
        console.log('   This vendor has NO booking requests in the database.')
        console.log('\n💡 NEXT STEPS:')
        console.log('   1. Create a booking request as a planner')
        console.log('   2. Make sure to select this vendor: "' + vendor.company_name + '"')
        console.log('   3. Verify the vendor_id in booking_requests matches: ' + VENDOR_ID)
    }

    // Save to file
    const output = {
        vendor,
        allBookings,
        vendorBookings,
        similarVendors
    }
    fs.writeFileSync('vendor_diagnosis.json', JSON.stringify(output, null, 2))
    console.log('\n💾 Full data saved to vendor_diagnosis.json')
}

diagnoseBookings().catch(console.error)
