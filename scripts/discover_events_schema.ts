
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseServiceKey) {
    console.error('Need SUPABASE_SERVICE_ROLE_KEY env var');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function discoverSchema() {
    console.log('=== Discovering events Table Schema ===\n');

    // Use service role key to query information_schema
    const { data, error } = await supabase.rpc('exec_sql', {
        sql: `
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_schema = 'public' 
            AND table_name = 'events'
            ORDER BY ordinal_position;
        `
    });

    if (error) {
        console.log('RPC not available, trying raw SQL...\n');

        // Fallback: try discovering via trial inserts
        console.log('Trying insert with only planner_id and status...');
        const { data: test1, error: err1 } = await supabase
            .from('events')
            .insert({ planner_id: '123e4567-e89b-12d3-a456-426614174000', status: 'draft' })
            .select()
            .single();

        if (err1) {
            console.log('Error:', err1.message);
            console.log('Hint:', err1.hint || 'none');
        } else {
            console.log('✅ SUCCESS! Columns:');
            Object.keys(test1).forEach(col => console.log(`  - ${col}`));
            await supabase.from('events').delete().eq('id', test1.id);
        }
    } else {
        console.log('Columns in events table:');
        data.forEach((col: any) => {
            console.log(`  ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? '* REQUIRED' : ''}`);
        });
    }
}

discoverSchema();
