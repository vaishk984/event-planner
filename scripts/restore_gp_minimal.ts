
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase Config');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function restore() {
    console.log('🔍 Checking for Grand Palace...');

    // 1. Check existence
    const { data: existing, error: findError } = await supabase
        .from('vendors')
        .select('id, company_name')
        .eq('company_name', 'Grand Palace venue')
        .maybeSingle();

    if (findError) {
        console.error('❌ Error checking existence:', findError);
        return;
    }

    if (existing) {
        console.log('✅ Vendor already exists:', existing.id);
        return;
    }

    console.log('➕ Creating Grand Palace venue...');

    // 2. Insert
    const { data, error: insertError } = await supabase
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
        .select('id, company_name')
        .single();

    if (insertError) {
        console.error('❌ Error creating vendor:', insertError);
    } else {
        console.log('✅ Created Grand Palace venue:', data.id);
    }
}

restore();
