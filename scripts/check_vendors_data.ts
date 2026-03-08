
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkVendors() {
    console.log('=== Checking Vendors Table ===\n');

    const { data, error, count } = await supabase
        .from('vendors')
        .select('*', { count: 'exact' });

    if (error) {
        console.error('❌ Error accessing vendors table:', error.message);
        return;
    }

    console.log(`✅ Total vendors found: ${count}`);

    if (data && data.length > 0) {
        console.log('\nSample Vendors:');
        data.slice(0, 3).forEach(v => {
            console.log(`- ${v.company_name || v.name} (${v.category})`);
        });
    } else {
        console.log('⚠️ The vendors table is empty.');
    }
}

checkVendors();
