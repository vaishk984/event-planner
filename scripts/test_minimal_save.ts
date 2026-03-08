
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMinimalSave() {
    console.log('=== Testing Minimal Save with planner_id ===\n');

    const testData = {
        planner_id: '123e4567-e89b-12d3-a456-426614174000', // Test UUID
        status: 'submitted',
        client_name: 'Test Planner Visibility',
        client_phone: '9876543210'
    };

    console.log('Attempting minimal insert with planner_id...');
    const { data, error } = await supabase
        .from('event_intakes')
        .insert(testData)
        .select()
        .single();

    if (error) {
        console.error('❌ Save failed');
        console.error('Error:', error.message);
        console.error('Details:', JSON.stringify(error, null, 2));
    } else {
        console.log('✅ Save successful!');
        console.log(`ID: ${data.id}`);
        console.log(`Planner ID: ${data.planner_id}`);
        console.log(`Status: ${data.status}`);

        if (data.planner_id) {
            console.log('\n✅ planner_id column EXISTS and accepts data!');
        }
    }
}

testMinimalSave();
