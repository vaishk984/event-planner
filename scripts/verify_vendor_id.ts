
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase Config');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkVendor() {
    console.log('🔍 Checking Vendor ID for "Heritage Haveli Jaipur"...');

    const { data, error } = await supabase
        .from('vendors')
        .select('id, company_name')
        .ilike('company_name', '%Heritage Haveli%');

    if (error) {
        console.error('Error fetching vendors:', error);
        return;
    }

    console.log('📊 Found Vendors:', data);

    const targetId = 'ab6b6e93-1f3d-4585-9705-84439dad7edc';
    const match = data?.find(v => v.id === targetId);

    if (match) {
        console.log(`✅ MATCH CONFIRMED: ${match.company_name} has ID ${targetId}`);
    } else {
        console.log(`❌ NO MATCH. Target ID ${targetId} not found in search results.`);
    }
}

checkVendor();
