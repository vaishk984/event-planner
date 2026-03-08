
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMinimalEventInsert() {
    console.log('=== Testing Minimal Event Insert ===\n');

    // Based on migration 001: id, planner_id, client_id, venue_id, type, date, guest_count, budget, status
    const testEvent = {
        planner_id: '123e4567-e89b-12d3-a456-426614174000',
        type: 'wedding',
        date: '2026-06-15',
        status: 'draft'
    };

    console.log('Attempting insert with minimal fields from migration 001...');
    const { data, error } = await supabase
        .from('events')
        .insert(testEvent)
        .select()
        .single();

    if (error) {
        console.error('❌ Error:', error.message);
        console.error('Code:', error.code);
    } else {
        console.log('✅ SUCCESS! Event created.');
        console.log('\nActual columns in events table:');
        Object.keys(data).forEach(col => {
            console.log(`  - ${col}`);
        });

        // Clean up
        await supabase.from('events').delete().eq('id', data.id);
        console.log('\nTest event deleted');
    }
}

testMinimalEventInsert();
