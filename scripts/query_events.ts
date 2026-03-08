
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function queryExistingEvents() {
    console.log('=== Querying Existing Events ===\n');

    const { data, error, count } = await supabase
        .from('events')
        .select('*', { count: 'exact' })
        .limit(1);

    if (error) {
        console.error('Query error:', error.message);
        return;
    }

    console.log(`Found ${count} total events\n`);

    if (data && data.length > 0) {
        console.log('Columns in events table:');
        const columns = Object.keys(data[0]);
        columns.forEach(col => {
            const value = data[0][col];
            const type = typeof value;
            console.log(`  - ${col} (${type})`);
        });

        console.log('\nSample event:');
        console.log(JSON.stringify(data[0], null, 2));
    } else {
        console.log('No events exist yet. Table is empty.');
    }
}

queryExistingEvents();
