
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectEvents() {
    console.log('=== Inspecting events Table ===\n');

    const { data, error } = await supabase
        .from('events')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    if (!data || data.length === 0) {
        console.log('Table is empty, checking with insert...');

        const { data: test, error: insertError } = await supabase
            .from('events')
            .insert({
                planner_id: '123e4567-e89b-12d3-a456-426614174000',
                status: 'draft',
                event_type: 'wedding'
            })
            .select()
            .single();

        if (insertError) {
            console.error('Insert error reveals required fields:');
            console.error(insertError.message);
        } else {
            console.log('Columns in events table:');
            Object.keys(test).forEach(col => console.log(`  - ${col}`));
        }
    } else {
        console.log('Columns in events table:');
        Object.keys(data[0]).forEach(col => console.log(`  - ${col}`));
    }
}

inspectEvents();
