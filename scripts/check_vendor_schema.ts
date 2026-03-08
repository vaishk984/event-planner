
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
    console.log('=== Checking Table Schemas ===\n');

    const tables = ['vendors', 'packages', 'booking_requests'];

    for (const table of tables) {
        console.log(`\n--- Checking table: ${table} ---`);

        // Check if table exists
        const { error: accessError } = await supabase
            .from(table)
            .select('count', { count: 'exact', head: true });

        if (accessError && accessError.code === '42P01') { // undefined_table
            console.log(`❌ Table '${table}' DOES NOT EXIST.`);
            continue;
        }

        console.log(`✅ Table '${table}' exists.`);

        // Get one row to see columns (if we can insert/read)
        // Since we can't easily query information_schema via JS client without RLS issues sometimes, 
        // we'll try to just select * limit 1.

        const { data, error } = await supabase.from(table).select('*').limit(1);

        if (error) {
            console.log(`Warning: Could not read rows: ${error.message}`);
        } else if (data && data.length > 0) {
            console.log('Columns found:', Object.keys(data[0]).join(', '));
        } else {
            console.log('Table is empty, cannot verify columns easily via data.');
            // Fallback: Try to query without columns - not easy.
        }
    }
}

checkSchema();
