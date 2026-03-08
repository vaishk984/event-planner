/**
 * Investigate specific booking request issue
 * Event: Rahul Malhotra's Wedding
 * Vendor: Vikram Singh (booking@heritagehaveli.com)
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as fs from 'fs'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function investigateBookingIssue() {
    console.log('='.repeat(80))
    console.log('INVESTIGATING BOOKING REQUEST ISSUE')
    console.log('Event: Rahul Malhotra\'s Wedding')
    console.log('Vendor: Vikram Singh (booking@heritagehaveli.com)')
    console.log('='.repeat(80))

    // 1. Find the vendor by email
    console.log('\n1️⃣ FINDING VENDOR BY EMAIL...')
    const { data: vendorByEmail, error: emailError } = await supabase
        .from('vendors')
        .select('*')
        .eq('email', 'booking@heritagehaveli.com')
        .maybeSingle()

    if (vendorByEmail) {
        console.log('✅ Found vendor by email:')
        console.log('   ID:', vendorByEmail.id)
        console.log('   Company Name:', vendorByEmail.company_name)
        console.log('   User ID:', vendorByEmail.user_id)
        console.log('   Email:', vendorByEmail.email)
    } else {
        console.log('❌ No vendor found with email: booking@heritagehaveli.com')
    }

    // 2. Find vendor by company name "Vikram Singh"
    console.log('\n2️⃣ FINDING VENDOR BY NAME...')
    const { data: vendorsByName, error: nameError } = await supabase
        .from('vendors')
        .select('*')
        .ilike('company_name', '%Vikram Singh%')

    console.log(`Found ${vendorsByName?.length || 0} vendors matching "Vikram Singh":`)
    vendorsByName?.forEach((v: any) => {
        console.log(`   - ID: ${v.id}, Name: "${v.company_name}", Email: ${v.email || 'NULL'}, User ID: ${v.user_id}`)
    })

    // 3. Find the event "Rahul Malhotra's Wedding"
    console.log('\n3️⃣ FINDING EVENT...')
    const { data: events, error: eventError } = await supabase
        .from('events')
        .select('*')
        .ilike('name', '%Rahul Malhotra%')

    console.log(`Found ${events?.length || 0} events matching "Rahul Malhotra":`)
    events?.forEach((e: any) => {
        console.log(`   - ID: ${e.id}, Name: "${e.name}", Planner ID: ${e.planner_id}, Date: ${e.event_date}`)
    })

    // 4. Check ALL booking requests in the system
    console.log('\n4️⃣ CHECKING ALL BOOKING REQUESTS...')
    const { data: allBookings, error: bookingsError } = await supabase
        .from('booking_requests')
        .select('*')
        .order('created_at', { ascending: false })

    console.log(`Total booking requests in system: ${allBookings?.length || 0}`)
    if (allBookings && allBookings.length > 0) {
        console.log('All booking requests:')
        allBookings.forEach((b: any, i: number) => {
            console.log(`\n   ${i + 1}. Booking ID: ${b.id}`)
            console.log(`      Event Name: "${b.event_name}"`)
            console.log(`      Event ID: ${b.event_id}`)
            console.log(`      Vendor ID: ${b.vendor_id}`)
            console.log(`      Planner ID: ${b.planner_id}`)
            console.log(`      Service: ${b.service}`)
            console.log(`      Status: ${b.status}`)
            console.log(`      Created: ${b.created_at}`)
        })
    }

    // 5. If we found the event, check bookings for that event
    if (events && events.length > 0) {
        const eventId = events[0].id
        console.log(`\n5️⃣ CHECKING BOOKINGS FOR EVENT: ${eventId}...`)
        const { data: eventBookings } = await supabase
            .from('booking_requests')
            .select('*')
            .eq('event_id', eventId)

        console.log(`Bookings for this event: ${eventBookings?.length || 0}`)
        eventBookings?.forEach((b: any) => {
            console.log(`   - Vendor ID in booking: ${b.vendor_id}`)
            console.log(`     Status: ${b.status}`)
        })

        // Check if vendor IDs match
        if (eventBookings && eventBookings.length > 0 && vendorsByName && vendorsByName.length > 0) {
            const bookingVendorIds = eventBookings.map(b => b.vendor_id)
            const actualVendorIds = vendorsByName.map(v => v.id)

            console.log('\n📊 ID MATCHING ANALYSIS:')
            console.log('   Vendor IDs in bookings:', bookingVendorIds)
            console.log('   Actual vendor IDs:', actualVendorIds)

            const matches = bookingVendorIds.filter(id => actualVendorIds.includes(id))
            if (matches.length > 0) {
                console.log('   ✅ MATCH FOUND! IDs match correctly')
            } else {
                console.log('   ❌ MISMATCH! Booking vendor_id does not match any actual vendor ID')
                console.log('   🔧 FIX NEEDED: Update booking_requests.vendor_id to match correct vendor')
            }
        }
    }

    // 6. Summary
    console.log('\n' + '='.repeat(80))
    console.log('SUMMARY')
    console.log('='.repeat(80))

    const output = {
        vendorByEmail,
        vendorsByName,
        events,
        allBookings
    }

    fs.writeFileSync('booking_investigation.json', JSON.stringify(output, null, 2))
    console.log('💾 Full data saved to booking_investigation.json')
}

investigateBookingIssue().catch(console.error)
