
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Config');
    process.exit(1);
}

async function restoreViaFetch() {
    console.log('🔄 Attempting restore via fetch...');

    const url = `${supabaseUrl}/rest/v1/vendors`;
    const headers = {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    };

    const body = {
        company_name: 'Grand Palace venue',
        category: 'venue',
        description: 'Luxury venue for grand weddings and events',
        location: 'Mumbai, India',
        price_range: '$$$$',
        rating: 4.8,
        contact_number: '+91 99999 99999',
        email: 'grandpalacevenue@planneros.com'
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });

        const text = await response.text();
        console.log(`Status: ${response.status} ${response.statusText}`);
        console.log('Response:', text);
    } catch (e) {
        console.error('Fetch Error:', e);
    }
}

restoreViaFetch();
