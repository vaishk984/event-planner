
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

async function checkTableExists() {
    console.log('=== Checking Table Existence ===\n');

    // Try to query event_intakes
    console.log('1. Checking event_intakes table...');
    const { data: ei, error: eiError } = await supabase
        .from('event_intakes')
        .select('*')
        .limit(1);

    if (eiError) {
        console.log('❌ event_intakes:', eiError.message);
    } else {
        console.log(`✅ event_intakes exists - ${ei?.length || 0} rows`);
        if (ei && ei.length > 0) {
            console.log('   Columns:', Object.keys(ei[0]).join(', '));
        }
    }

    // Try to query intakes
    console.log('\n2. Checking intakes table...');
    const { data: i, error: iError } = await supabase
        .from('intakes')
        .select('*')
        .limit(1);

    if (iError) {
        console.log('❌ intakes:', iError.message);
    } else {
        console.log(`✅ intakes exists - ${i?.length || 0} rows`);
        if (i && i.length > 0) {
            console.log('   Columns:', Object.keys(i[0]).join(', '));
        }
    }

    console.log('\n=== Summary ===');
    if (eiError && iError) {
        console.log('❌ NEITHER table exists! Need to run migrations.');
    } else if (eiError && !iError) {
        console.log('⚠️  Only "intakes" exists - code expects "event_intakes"');
        console.log('   ACTION: Update repository to use "intakes" table');
    } else if (!eiError && iError) {
        console.log('⚠️  Only "event_intakes" exists');
        console.log('   This matches current code expectations');
    } else {
        console.log('⚠️  BOTH tables exist - potential conflict');
    }
}

checkTableExists();
