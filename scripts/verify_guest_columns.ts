
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyGuestColumns() {
    console.log('=== Checking Guest Table Columns ===\n');

    // We can't query information_schema directly with standard client usually, so we'll try to select columns.
    const columns = ['category', 'rsvp_status', 'dietary_preferences', 'plus_one', 'plus_one_name', 'table_number'];

    for (const col of columns) {
        const { error } = await supabase.from('guests').select(col).limit(1);
        if (error) {
            console.log(`❌ Column '${col}' is MISSING. Error: ${error.message}`);
        } else {
            console.log(`✅ Column '${col}' EXISTS.`);
        }
    }
}

verifyGuestColumns();
