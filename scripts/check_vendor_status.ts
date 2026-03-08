
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase URL or Service Role Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkVendors() {
    console.log('🔍 Checking Vendors Table...');

    const { data: vendors, error } = await supabase
        .from('vendors')
        .select('id, company_name, email, user_id');

    if (error) {
        console.error('❌ Error fetching vendors:', error);
        return;
    }

    let output = `📊 Found ${vendors.length} vendors in total.\n`;

    vendors.forEach(v => {
        output += `- ${v.company_name}: email=${v.email}, user_id=${v.user_id || 'NULL'}\n`;
    });

    const statusPath = path.resolve(process.cwd(), 'vendor_status.txt');
    fs.writeFileSync(statusPath, output);
    console.log('Status saved to vendor_status.txt');
}

checkVendors();
