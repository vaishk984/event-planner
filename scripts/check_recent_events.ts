
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRecentEvents() {
    console.log('=== Checking Recent Events ===\n');

    const { data, error, count } = await supabase
        .from('events')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    console.log(`Total events: ${count}\n`);

    if (data && data.length > 0) {
        data.forEach((event, index) => {
            console.log(`Event ${index + 1}:`);
            console.log(`  ID: ${event.id}`);
            console.log(`  Name: ${event.name || 'MISSING'}`);
            console.log(`  Date: ${event.date || 'MISSING'}`);
            console.log(`  Type: ${event.type}`);
            console.log(`  Status: ${event.status}`);
            console.log(`  Planner ID: ${event.planner_id}`);
            console.log(`  Created: ${event.created_at}`);
            console.log('');
        });
    } else {
        console.log('No events found');
    }
}

checkRecentEvents();
