
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkBookingsTable() {
    console.log('=== Checking booking_requests Table ===\n');

    const { data, error } = await supabase
        .from('booking_requests')
        .select('count')
        .limit(1);

    if (error) {
        console.error('❌ Error accessing booking_requests table:');
        console.error(JSON.stringify(error, null, 2));
    } else {
        console.log('✅ booking_requests table exists and is accessible.');
        console.log('Data sample:', data);
    }
}

checkBookingsTable();
