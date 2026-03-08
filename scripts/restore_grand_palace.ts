
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || '';

// Debug logging
console.log('Connecting to:', supabaseUrl);
console.log('Service Key starts with:', supabaseServiceKey.substring(0, 5) + '...');

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase Config');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function restoreVendor() {
    console.log('🔄 Debugging connection to vendors table...');

    // Try simple select
    const { data: allVendors, error: listError } = await supabase
        .from('vendors')
        .select('id, company_name')
        .limit(5);

    if (listError) {
        console.error('❌ Simple list failed:', listError);
        return;
    }
    console.log('✅ Simple list worked. Found:', allVendors?.length);

    console.log('🔄 Now trying to find Grand Palace...');
    const { data: existing, error: findError } = await supabase
        .from('vendors')
        .select('*')
        .eq('company_name', 'Grand Palace venue')
        .maybeSingle();

    if (findError) {
        console.error('❌ Find failed:', findError);
        return;
    }

    if (existing) {
        console.log('⚠️ Vendor already exists:', existing.id);
        return;
    }

    console.log('🔄 Not found. Inserting...');
    // Insert new vendor
    const { data, error } = await supabase
        .from('vendors')
        .insert({
            company_name: 'Grand Palace venue',
            category: 'venue',
            description: 'Luxury venue for grand weddings and events',
            location: 'Mumbai, India',
            price_range: '$$$$',
            rating: 4.8,
            contact_number: '+91 99999 99999',
            email: 'grandpalacevenue@planneros.com'
        })
        .select()
        .single();

    if (error) {
        console.error('❌ Insert failed:', error);
    } else {
        console.log('✅ Created Grand Palace venue:', data.id);
    }
}

restoreVendor();
