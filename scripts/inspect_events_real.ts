
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectEventsSchema() {
    console.log('=== Actual events Table Schema ===\n');

    // Try minimal insert to see what columns exist
    const { data, error } = await supabase
        .from('events')
        .insert({
            planner_id: '123e4567-e89b-12d3-a456-426614174000',
            event_type: 'wedding',
            status: 'draft'
        })
        .select()
        .single();

    if (error) {
        console.error('Insert error reveals schema:');
        console.error(error.message);
        console.log('\n---\n');

        // Try with different field names
        const { data: test2, error: error2 } = await supabase
            .from('events')
            .insert({
                planner_id: '123e4567-e89b-12d3-a456-426614174000',
                type: 'wedding',
                status: 'draft',
                date: '2026-06-15'
            })
            .select()
            .single();

        if (error2) {
            console.error('Second attempt error:');
            console.error(error2.message);
        } else {
            console.log('✅ Insert successful with:');
            console.log('Columns:');
            Object.keys(test2).forEach(col => console.log(`  - ${col}`));
        }
    } else {
        console.log('✅ Insert successful!');
        console.log('Columns in events table:');
        Object.keys(data).forEach(col => console.log(`  - ${col}`));
    }
}

inspectEventsSchema();
