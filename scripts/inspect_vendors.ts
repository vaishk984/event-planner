
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase Config');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspectVendors() {
    const email = 'rahul@elegantmoments.com';
    const log: string[] = [];
    log.push(`🔍 Inspecting Vendors with email: ${email}`);

    const { data: vendors, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('email', email);

    if (error) {
        log.push(`Error: ${error.message}`);
        fs.writeFileSync('inspect_output.txt', log.join('\n'));
        return;
    }

    log.push(`📊 Found ${vendors.length} records.`);
    vendors.forEach(v => {
        log.push(`--------------------------------`);
        log.push(`ID: ${v.id}`);
        log.push(`Company: ${v.company_name}`);
        log.push(`User ID: ${v.user_id}`);
        log.push(`Email: ${v.email}`);
    });

    fs.writeFileSync('inspect_output.txt', log.join('\n'));
    console.log('Inspection complete. Written to inspect_output.txt');
}

inspectVendors();
