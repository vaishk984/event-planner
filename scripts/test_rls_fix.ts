
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkEventAfterRLS() {
    const eventId = '81c178c7-a861-4f9a-a471-9a7af69077cc';

    console.log('=== Checking Event After RLS Fix ===\n');

    const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

    if (error) {
        console.error('❌ Error:', error.message);
        console.error('Code:', error.code);
    } else if (!data) {
        console.log('❌ Event not found');
    } else {
        console.log('✅ Event found!');
        console.log('\nEvent data:');
        console.log('  ID:', data.id);
        console.log('  Name:', data.name);
        console.log('  Date:', data.date);
        console.log('  Status:', data.status);
        console.log('  Planner ID:', data.planner_id);
        console.log('  City:', data.city);
        console.log('  Client Name:', data.client_name);
        console.log('\nAll fields:', Object.keys(data).sort().join(', '));
    }
}

checkEventAfterRLS();
