
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testEventCreation() {
    console.log('=== Testing Event Creation with Service Key ===\n');

    const testEvent = {
        planner_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
        type: 'wedding',
        name: 'Test Event',
        date: '2026-06-15',
        status: 'planning'
    };

    console.log('Attempting to create test event...');
    const { data, error } = await supabase
        .from('events')
        .insert(testEvent)
        .select()
        .single();

    if (error) {
        console.error('❌ Error:', error.message);
        console.error('Code:', error.code);
        console.error('Details:', error.details);
    } else {
        console.log('✅ Event created successfully!');
        console.log('ID:', data.id);
        console.log('Columns:', Object.keys(data).join(', '));

        // Clean up
        await supabase.from('events').delete().eq('id', data.id);
        console.log('\nTest event deleted');
    }
}

testEventCreation();
