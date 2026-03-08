
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCreateAndReadEvent() {
    console.log('=== Testing Event Creation After RLS Fix ===\n');

    // Get the planner's user ID by reading from auth
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.log('❌ Not authenticated');
        return;
    }

    console.log('User ID:', user.id);

    const testEvent = {
        planner_id: user.id,
        type: 'wedding',
        name: 'RLS Test Event',
        date: '2026-06-15',
        status: 'planning',
        is_date_flexible: false,
        city: 'Mumbai',
        venue_type: 'showroom',
        guest_count: 100,
        budget_min: 500000,
        budget_max: 1000000,
        client_name: 'Test Client',
        client_phone: '9999999999'
    };

    console.log('\n1. Creating test event...');
    const { data: created, error: createError } = await supabase
        .from('events')
        .insert(testEvent)
        .select()
        .single();

    if (createError) {
        console.error('❌ Create Error:', createError.message);
        return;
    }

    console.log('✅ Event created! ID:', created.id);

    console.log('\n2. Reading event back...');
    const { data: read, error: readError } = await supabase
        .from('events')
        .select('*')
        .eq('id', created.id)
        .single();

    if (readError) {
        console.error('❌ Read Error:', readError.message);
    } else {
        console.log('✅ Event read successfully!');
        console.log('   Name:', read.name);
        console.log('   Status:', read.status);
    }

    console.log('\n3. Listing all my events...');
    const { data: allEvents, count } = await supabase
        .from('events')
        .select('*', { count: 'exact' });

    console.log(`✅ Total events visible: ${count}`);

    // Clean up
    if (created.id) {
        await supabase.from('events').delete().eq('id', created.id);
        console.log('\n✅ Test event cleaned up');
    }
}

testCreateAndReadEvent();
