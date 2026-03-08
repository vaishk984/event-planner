
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkEventColumns() {
    console.log('=== Checking Events Table Columns ===\n');

    // Check for 'status' column specifically, and maybe 'is_approved' ??
    const result = await supabase.from('events').select('*').limit(1);

    if (result.error) {
        console.error('Error fetching event:', result.error);
        return;
    }

    if (result.data && result.data.length > 0) {
        console.log('Columns found in events table:', Object.keys(result.data[0]));
        console.log('Sample row:', result.data[0]);
    } else {
        console.log('No events found, but query succeeded. Columns cannot be inferred reliably from empty data via client.');
        // fallback: try to select specific columns to check existence
        const { error: statusError } = await supabase.from('events').select('status').limit(1);
        console.log('status column exists:', !statusError);
    }
}

checkEventColumns();
