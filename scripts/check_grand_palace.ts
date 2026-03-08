import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('--- Checking for Grand Palace Venue ---');
    const { data: vendors, error } = await supabase
        .from('vendors')
        .select('*')
        .ilike('company_name', '%Grand Palace%');

    if (error) {
        console.error('Error:', error);
        return;
    }

    if (vendors && vendors.length > 0) {
        console.log(`Found ${vendors.length} vendor(s):`);
        vendors.forEach(v => {
            console.log(`- Name: ${v.company_name}`);
            console.log(`  Email: ${v.email}`); // Added email
            console.log(`  ID: ${v.id}`);
            console.log(`  Category: ${v.category}`);
            console.log(`  Location: ${v.location}`);
            console.log(`  Status: ${v.status}`);
        });
    } else {
        console.log('❌ "Grand Palace Venue" NOT found in vendors table.');
    }
}

check();
