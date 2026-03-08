
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || '';

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase Config');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkBookings() {
    console.log('🔍 Checking bookings for Grand Palace venue...');

    // 1. Get Vendor ID
    const { data: vendor, error: vendorError } = await supabase
        .from('vendors')
        .select('id, company_name')
        .eq('company_name', 'Grand Palace venue')
        .single();

    if (vendorError || !vendor) {
        console.error('❌ Vendor not found:', vendorError);
        return;
    }

    console.log(`✅ Found Vendor: ${vendor.company_name} (${vendor.id})`);

    // 2. Get Bookings
    const { data: bookings, error: bookingError } = await supabase
        .from('booking_requests')
        .select(`
            id, 
            status, 
            events (
                name, 
                date,
                planner_id
            )
        `)
        .eq('vendor_id', vendor.id);

    if (bookingError) {
        console.error('❌ Error fetching bookings:', bookingError);
        return;
    }

    if (bookings.length === 0) {
        console.log('⚠️ No bookings found for this vendor.');
    } else {
        console.log(`📊 Found ${bookings.length} bookings:`);
        bookings.forEach(b => {
            // @ts-ignore
            console.log(`- Event: "${b.events?.name}" on ${b.events?.date} (Status: ${b.status})`);
        });
    }
}

checkBookings();
