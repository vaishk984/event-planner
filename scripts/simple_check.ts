
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function simpleCheck() {
    console.log('=== Simple Check ===\n');

    // Just try to get all rows
    const { data, error, count } = await supabase
        .from('event_intakes')
        .select('*', { count: 'exact' });

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    console.log(`Found ${count} intakes total\n`);

    if (data && data.length > 0) {
        console.log('Recent intakes:');
        data.slice(0, 5).forEach((intake, i) => {
            console.log(`\n[${i + 1}]`);
            console.log(`  Client: ${intake.client_name || 'N/A'}`);
            console.log(`  Status: ${intake.status || 'N/A'}`);
            console.log(`  Planner ID: ${intake.planner_id || 'NULL'}`);
        });
    } else {
        console.log('No intakes in database - nothing has been saved yet');
    }
}

simpleCheck();
