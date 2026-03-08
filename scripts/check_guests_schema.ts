
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkGuestsSchema() {
    console.log('=== Checking guests Table Schema ===\n');

    const { data, error } = await supabase
        .from('guests')
        .select('*')
        .limit(1);

    if (error) {
        console.error('❌ Error accessing guests table:', error.message);
        if (error.code === '42P01') {
            console.log("Table 'guests' does not exist.");
        }
        return;
    }

    console.log('✅ Table \'guests\' exists.');

    // Attempt to get column info (hacky way via insertion error or introspection if possible, 
    // but just checking the returned object keys if there's data is easiest, or empty keys if no data).
    // If table is empty, we can't see keys from data. 
    // We can try to insert a dummy row with specific columns and fail.

    if (data && data.length > 0) {
        console.log('Existing columns based on a row:', Object.keys(data[0]));
    } else {
        console.log('Table is empty. Trying to infer columns...');
        // Try selecting specific columns to see if they error
        const columnsToCheck = ['category', 'email', 'phone', 'rsvp_status', 'dietary_requirements'];

        for (const col of columnsToCheck) {
            const { error: colError } = await supabase.from('guests').select(col).limit(1);
            if (colError) {
                console.log(`❌ Column '${col}' seems MISSING (Error: ${colError.message})`);
            } else {
                console.log(`✅ Column '${col}' exists.`);
            }
        }
    }
}

checkGuestsSchema();
