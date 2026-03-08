
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function fromDb(row: any) {
    if (!row) return row;
    let { requirements = {}, ...rest } = row;

    if (typeof requirements === 'string') {
        try { requirements = JSON.parse(requirements); } catch (e) { }
    }

    return { ...requirements, ...rest };
}

async function verifyIntakes() {
    console.log('Fetching recent event_intakes...');
    // Query without filters to see everything
    const { data, error } = await supabase
        .from('event_intakes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Found ${data.length} records.`);

    data.forEach((row, i) => {
        console.log(`\n--- Record ${i + 1} ---`);
        console.log(`ID: ${row.id}`);
        console.log(`Planner ID: ${row.planner_id}`); // <--- CRITICAL
        console.log(`Status: ${row.status}`);
        console.log(`Created At: ${row.created_at}`);

        const parsed = fromDb(row);
        console.log(`Client Name: ${parsed.client_name || parsed.clientName}`);
        console.log(`Requirements keys:`, Object.keys(row.requirements || {}));
    });
}

verifyIntakes();
