
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
    console.log('🔍 Checking bookings for Grand Palace Venue...');

    // 1. Get New Vendor ID
    const { data: vendor, error: vendorError } = await supabase
        .from('vendors')
        .select('id, company_name')
        .ilike('company_name', 'Grand Palace Venue') // Case insensitive
        .single();

    if (vendorError || !vendor) {
        console.error('❌ Vendor not found (ilike):', vendorError);
        return;
    }

    console.log(`✅ Found Vendor: ${vendor.company_name} (${vendor.id})`);

    // 2. Get Bookings Linked to New ID
    const { data: newBookings, error: bookingError } = await supabase
        .from('booking_requests')
        .select(`id, status, events (name, date)`)
        .eq('vendor_id', vendor.id);

    if (bookingError) console.error('Error fetching new bookings:', bookingError);

    console.log(`📊 Bookings linked to NEW ID: ${newBookings?.length || 0}`);
    newBookings?.forEach(b => {
        // @ts-ignore
        console.log(`   - Event: "${b.events?.name}" (${b.status})`);
    });

    // 3. Check for Orphaned Bookings (if deleted via UI, maybe ID is null?)
    // Note: This requires scanning all bookings, which might be heavy, but okay for dev.
    const { data: allBookings } = await supabase
        .from('booking_requests')
        .select('id, vendor_id, status, events(name)')
        .is('vendor_id', null);

    if (allBookings && allBookings.length > 0) {
        console.log(`\n⚠️ Found ${allBookings.length} bookings with NULL vendor_id (potential orphans):`);
        allBookings.forEach(b => {
            // @ts-ignore
            console.log(`   - Booking ${b.id} for "${b.events?.name}"`);
        });
    }

    // 4. Check for Bookings with non-existent vendor_IDs (if cascade didn't delete them)
    // First get all vendor IDs
    const { data: allVendorIdsSync } = await supabase.from('vendors').select('id');
    const validIds = new Set(allVendorIdsSync?.map(v => v.id));

    const { data: rawBookings } = await supabase.from('booking_requests').select('id, vendor_id, events(name)');
    const trulyOrphaned = rawBookings?.filter(b => b.vendor_id && !validIds.has(b.vendor_id));

    if (trulyOrphaned && trulyOrphaned.length > 0) {
        console.log(`\n⚠️ Found ${trulyOrphaned.length} bookings with INVALID vendor_id (orphaned):`);
        trulyOrphaned.forEach(b => {
            // @ts-ignore
            console.log(`   - Booking ${b.id} for "${b.events?.name}" linked to ${b.vendor_id}`);
        });

        // Use verify step to re-assign if confirmed?
        console.log(`\n💡 You can re-assign these to the new Grand Palace ID: ${vendor.id}`);
    } else {
        console.log(`\n✅ No invalid vendor_id references found.`);
    }
}

checkBookings();
