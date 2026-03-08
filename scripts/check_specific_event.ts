
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSpecificEvent() {
    const eventId = '00cbc07e-56f9-4b97-9a87-08d48236ef03';

    console.log('=== Checking Specific Event ===\n');
    console.log('Event ID:', eventId);
    console.log('');

    const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

    if (error) {
        console.error('❌ Error reading event:', error.message);
        console.error('Code:', error.code);
    } else if (!data) {
        console.log('❌ Event not found (returned null)');
    } else {
        console.log('✅ Event found!');
        console.log('Name:', data.name);
        console.log('Date:', data.date);
        console.log('Status:', data.status);
        console.log('Planner ID:', data.planner_id);
        console.log('\nAll fields:', Object.keys(data).join(', '));
    }
}

checkSpecificEvent();
