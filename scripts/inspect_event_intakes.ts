
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectEventIntakes() {
    console.log('=== Inspecting event_intakes Table ===\n');

    // Fetch a sample row to see columns
    const { data, error } = await supabase
        .from('event_intakes')
        .select('*')
        .limit(1);

    if (error) {
        console.error('❌ Error:', error.message);
        return;
    }

    if (!data || data.length === 0) {
        console.log('✅ Table exists but is EMPTY');
        console.log('\nSince table is empty, attempting insert to discover schema...');

        const { data: inserted, error: insertError } = await supabase
            .from('event_intakes')
            .insert({
                client_name: 'Schema Test',
                client_phone: '0000000000',
                status: 'draft'
            })
            .select()
            .single();

        if (insertError) {
            console.error('Insert error:', insertError.message);
            console.log('\nThis reveals required columns or constraints.');
        } else {
            console.log('✅ Insert successful!');
            console.log('\nColumns in event_intakes:');
            Object.keys(inserted).forEach(col => {
                console.log(`  - ${col}: ${typeof inserted[col]} = ${JSON.stringify(inserted[col])}`);
            });
        }
    } else {
        console.log('✅ Table exists with data');
        console.log('\nColumns in event_intakes:');
        const sample = data[0];
        Object.keys(sample).forEach(col => {
            console.log(`  - ${col}: ${typeof sample[col]}`);
        });

        console.log('\nSample row:');
        console.log(JSON.stringify(sample, null, 2));
    }
}

inspectEventIntakes();
