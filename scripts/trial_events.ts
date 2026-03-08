
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function trialAndError() {
    console.log('=== Trial and Error Schema Discovery ===\n');

    const testId = '123e4567-e89b-12d3-a456-426614174000';

    // Try 1: Absolute minimum
    console.log('Test 1: planner_id + status only');
    let { data, error } = await supabase
        .from('events')
        .insert({ planner_id: testId, status: 'draft' })
        .select();

    if (error) {
        console.log('❌', error.message);
    } else {
        console.log('✅ SUCCESS!');
        console.log('Columns:', Object.keys(data[0]).join(', '));
        await supabase.from('events').delete().eq('id', data[0].id);
        return;
    }

    // Try 2: Add type
    console.log('\nTest 2: + type');
    ({ data, error } = await supabase
        .from('events')
        .insert({ planner_id: testId, status: 'draft', type: 'wedding' })
        .select());

    if (error) {
        console.log('❌', error.message);
    } else {
        console.log('✅ SUCCESS!');
        console.log('Columns:', Object.keys(data[0]).join(', '));
        await supabase.from('events').delete().eq('id', data[0].id);
        return;
    }

    // Try 3: Different required fields from migration 001
    console.log('\nTest 3: planner_id + client_id + type + date + guest_count + budget + status');
    ({ data, error } = await supabase
        .from('events')
        .insert({
            planner_id: testId,
            client_id: null,
            type: 'wedding',
            date: '2026-06-15',
            guest_count: 100,
            budget: 1000000,
            status: 'draft'
        })
        .select());

    if (error) {
        console.log('❌', error.message);
    } else {
        console.log('✅ SUCCESS!');
        console.log('Columns:', Object.keys(data[0]).join(', '));
        await supabase.from('events').delete().eq('id', data[0].id);
    }
}

trialAndError();
