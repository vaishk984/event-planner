
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase URL or Service Role Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function unlinkVendors() {
    console.log('🔄 Unlinking all vendors from Auth Users...');

    const { data: vendors, error: fetchError } = await supabase.from('vendors').select('id, company_name');
    if (fetchError) {
        console.error('❌ Error fetching vendors:', fetchError);
        return;
    }

    for (const vendor of vendors) {
        console.log(`Unlinking ${vendor.company_name} (${vendor.id})...`);
        const { error } = await supabase
            .from('vendors')
            .update({ user_id: null })
            .eq('id', vendor.id);

        if (error) {
            console.error(`❌ Failed to unlink ${vendor.company_name}:`, error);
        } else {
            console.log(`✅ Unlinked ${vendor.company_name}`);
        }
    }
}

unlinkVendors();
