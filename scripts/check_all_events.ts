
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllEvents() {
    console.log('=== All Events (No RLS Filter) ===\n');

    const { data, error, count } = await supabase
        .from('events')
        .select('*', { count: 'exact' });

    if (error) {
        console.error('❌ Error:', error.message);
    } else {
        console.log(`Total events visible to current user: ${count}`);
        if (data && data.length > 0) {
            data.forEach((event: any) => {
                console.log(`\n- ${event.name} (${event.id})`);
                console.log(`  Planner: ${event.planner_id}`);
                console.log(`  Status: ${event.status}`);
            });
        }
    }
}

checkAllEvents();
