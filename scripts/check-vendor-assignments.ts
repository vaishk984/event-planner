/**
 * Check vendor_assignments table
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as fs from 'fs'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function checkVendorAssignments() {
    console.log('='.repeat(80))
    console.log('CHECKING VENDOR ASSIGNMENTS TABLE')
    console.log('='.repeat(80))

    // 1. Check all vendor_assignments
    console.log('\n1️⃣ ALL VENDOR ASSIGNMENTS:')
    const { data: assignments, error } = await supabase
        .from('vendor_assignments')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('❌ Error:', error.message)
        return
    }

    console.log(`Total assignments: ${assignments?.length || 0}`)
    if (assignments && assignments.length > 0) {
        assignments.forEach((a: any, i: number) => {
            console.log(`\n${i + 1}. Assignment ID: ${a.id}`)
            console.log(`   Event ID: ${a.event_id}`)
            console.log(`   Vendor ID: ${a.vendor_id}`)
            console.log(`   Service: ${a.service_type || a.service || 'N/A'}`)
            console.log(`   Status: ${a.status}`)
            console.log(`   Created: ${a.created_at}`)
        })
    }

    // 2. Find vendor "Vikram Singh"
    console.log('\n2️⃣ FINDING VIKRAM SINGH VENDOR:')
    const { data: vendors } = await supabase
        .from('vendors')
        .select('*')
        .ilike('company_name', '%Vikram Singh%')

    const vendorId = vendors?.[0]?.id
    console.log(`Vendor ID: ${vendorId}`)

    // 3. Check assignments for this vendor
    if (vendorId) {
        console.log('\n3️⃣ ASSIGNMENTS FOR VIKRAM SINGH:')
        const { data: vendorAssignments } = await supabase
            .from('vendor_assignments')
            .select('*, events(name, event_date)')
            .eq('vendor_id', vendorId)

        console.log(`Found ${vendorAssignments?.length || 0} assignments`)
        vendorAssignments?.forEach((a: any) => {
            console.log(`   - Event: "${a.events?.name}", Status: ${a.status}`)
        })
    }

    // 4. Find event "Rahul Malhotra"
    console.log('\n4️⃣ FINDING RAHUL MALHOTRA EVENT:')
    const { data: events } = await supabase
        .from('events')
        .select('*')
        .ilike('name', '%Rahul%')

    if (events && events.length > 0) {
        const eventId = events[0].id
        console.log(`Event found: "${events[0].name}" (${eventId})`)

        // 5. Check assignments for this event
        console.log('\n5️⃣ VENDOR ASSIGNMENTS FOR THIS EVENT:')
        const { data: eventAssignments } = await supabase
            .from('vendor_assignments')
            .select('*, vendors(company_name)')
            .eq('event_id', eventId)

        console.log(`Found ${eventAssignments?.length || 0} vendor assignments`)
        eventAssignments?.forEach((a: any) => {
            console.log(`   - Vendor: "${a.vendors?.company_name}", Status: ${a.status}`)
        })

        // CHECK IF VENDOR_ASSIGNMENTS EXISTS BUT BOOKING_REQUESTS DOESN'T
        if (eventAssignments && eventAssignments.length > 0) {
            console.log('\n⚠️  ISSUE IDENTIFIED:')
            console.log('   Vendors are in vendor_assignments table')
            console.log('   BUT they need to be in booking_requests table for vendor dashboard!')
            console.log('\n💡 SOLUTION:')
            console.log('   Create booking_requests from vendor_assignments')
        }
    }

    const output = {
        allAssignments: assignments,
        vendors,
        events,
    }
    fs.writeFileSync('vendor_assignments_check.json', JSON.stringify(output, null, 2))
    console.log('\n💾 Saved to vendor_assignments_check.json')
}

checkVendorAssignments().catch(console.error)
