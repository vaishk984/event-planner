
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or Service Role Key in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkEventBookings() {
    const eventId = 'b8e4b663-66fe-408e-8571-a6ca5d9e7230'; // From logs
    const targetVendorId = 'ab6b6e93-1f3d-4585-9705-84439dad7edc'; // From previous logs (Vendor Dashboard)

    console.log(`🔍 Checking bookings for Event: ${eventId}`);

    // 1. Get all bookings for this event
    const { data: bookings, error } = await supabase
        .from('booking_requests')
        .select(`
      id,
      status,
      service,
      vendor_id,
      created_at,
      vendors (
        id,
        company_name,
        email
      )
    `)
        .eq('event_id', eventId);

    if (error) {
        console.error('Error fetching bookings:', error);
        return;
    }

    console.log(`📊 Found ${bookings.length} booking requests for this event.`);

    if (bookings.length === 0) {
        console.log('❌ No bookings found. The creation might have failed or event ID is wrong.');
        return;
    }

    // 2. Analyze bookings
    let foundTarget = false;
    bookings.forEach((b: any) => {
        const isTarget = b.vendor_id === targetVendorId;
        if (isTarget) foundTarget = true;

        console.log(`\n📋 Booking ID: ${b.id}`);
        console.log(`   - Vendor: ${b.vendors?.company_name} (ID: ${b.vendor_id})`);
        console.log(`   - Status: '${b.status}'`);
        console.log(`   - Service: '${b.service}'`);
        console.log(`   - Is Target Vendor? ${isTarget ? '✅ YES' : '❌ NO'}`);

        if (isTarget && b.status !== 'pending') {
            console.warn(`   ⚠️ Status is '${b.status}', but Vendor Dashboard only shows 'pending' by default logic?`);
        }
    });

    // 3. Check Vendor Details specifically
    if (!foundTarget) {
        console.log(`\n❌ Target Vendor (${targetVendorId}) is NOT attached to this event.`);
        // Check if this vendor exists
        const { data: vendor } = await supabase.from('vendors').select('company_name').eq('id', targetVendorId).single();
        console.log(`   (Target Vendor Name in DB: ${vendor?.company_name || 'Unknown'})`);
    }
}

checkEventBookings();
