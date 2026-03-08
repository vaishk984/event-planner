
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase Config');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deduplicateVendors() {
    console.log('🚀 Starting Vendor Deduplication...');

    // 1. Fetch all vendors
    const { data: vendors, error } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: true }); // Keep oldest by default? Or newest?

    if (error) {
        console.error('Error fetching vendors:', error);
        return;
    }

    // Group by email
    const params = new Map<string, any[]>();
    vendors.forEach(v => {
        if (!v.email) return; // Skip if no email
        const existing = params.get(v.email) || [];
        existing.push(v);
        params.set(v.email, existing);
    });

    console.log(`📊 Total Vendors: ${vendors.length}`);
    console.log(`📊 Unique Emails: ${params.size}`);

    let fixedCount = 0;

    for (const [email, records] of params.entries()) {
        if (records.length < 2) continue; // No duplicates

        console.log(`\n⚠️ Found ${records.length} duplicates for: ${email}`);

        // Determine "Keep" record (e.g., the one with user_id, or the first one)
        // They might all have user_id now if I ran the previous script.
        // Let's prefer the one that has bookings?
        // For now, let's keep the FIRST one (oldest) as the 'primary', assuming it has the most history.
        const primary = records[0];
        const duplicates = records.slice(1);

        console.log(`   ✅ Keeping Primary ID: ${primary.id} (${primary.company_name})`);

        for (const dup of duplicates) {
            console.log(`   🗑️ Processing Duplicate ID: ${dup.id} ...`);

            // 1. Repoint Booking Requests
            const { error: bookingError } = await supabase
                .from('booking_requests')
                .update({ vendor_id: primary.id })
                .eq('vendor_id', dup.id);

            if (bookingError) console.error(`      ❌ Failed to update bookings: ${bookingError.message}`);
            else console.log(`      ↳ Repointed bookings.`);

            // 2. Repoint Vendor Assignments (Legacy)
            // Note: This might cause conflict if primary is ALSO in the same event.
            // Ideally we check first. But for simple fix:
            const { error: assignError } = await supabase
                .from('vendor_assignments')
                .update({ vendor_id: primary.id })
                .eq('vendor_id', dup.id);

            if (assignError) {
                // If conflict (primary already in event), just delete the old assignment
                if (assignError.code === '23505') { // Unique violation
                    console.log(`      ↳ Assignment conflict (primary already assigned). Deleting duplicate assignment.`);
                    await supabase.from('vendor_assignments').delete().eq('vendor_id', dup.id);
                } else {
                    console.error(`      ❌ Failed to update assignments: ${assignError.message}`);
                }
            } else {
                console.log(`      ↳ Repointed assignments.`);
            }

            // 3. Delete Duplicate Vendor
            const { error: deleteError } = await supabase
                .from('vendors')
                .delete()
                .eq('id', dup.id);

            if (deleteError) {
                console.error(`      ❌ Failed to delete duplicate vendor: ${deleteError.message}`);
            } else {
                console.log(`      ✅ Deleted duplicate vendor.`);
                fixedCount++;
            }
        }
    }

    console.log(`\n🎉 Deduplication Complete. Fixed ${fixedCount} duplicates.`);
}

deduplicateVendors();
