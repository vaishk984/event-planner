
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testIntakeFlow() {
    console.log('=== Testing Intake Save Flow ===\n');

    const testPlannerId = '123e4567-e89b-12d3-a456-426614174000'; // Dummy UUID
    const testIntake = {
        access_token: `test_${Date.now()}`,
        planner_id: testPlannerId,
        created_by: 'planner',
        status: 'submitted',

        // Client details
        client_name: 'Test Client',
        phone: '9999999999',
        email: 'test@example.com',

        // Event basics
        event_type: 'wedding',
        event_date: '2026-06-15',
        guest_count: 200,
        budget_min: 1000000,
        budget_max: 2000000,
        city: 'Mumbai',

        // Preferences as JSONB
        food_preferences: {
            dietary: ['veg'],
            cuisines: ['north-indian']
        },
        decor_preferences: {
            style: 'traditional',
            colorMood: 'warm'
        }
    };

    console.log('1. Inserting test intake with structured schema...');
    const { data: inserted, error: insertError } = await supabase
        .from('intakes')
        .insert(testIntake)
        .select()
        .single();

    if (insertError) {
        console.error('❌ Insert failed:', insertError.message);
        console.error('Details:', JSON.stringify(insertError, null, 2));
        return;
    }

    console.log('✅ Insert successful!');
    console.log(`   ID: ${inserted.id}`);
    console.log(`   Planner ID: ${inserted.planner_id}`);
    console.log(`   Status: ${inserted.status}`);

    // Now try to query it back
    console.log('\n2. Querying pending intakes...');
    const { data: pending, error: queryError } = await supabase
        .from('intakes')
        .select('*')
        .in('status', ['submitted', 'in_progress'])
        .limit(5);

    if (queryError) {
        console.error('❌ Query failed:', queryError.message);
        return;
    }

    console.log(`✅ Found ${pending?.length || 0} pending intakes`);
    if (pending && pending.length > 0) {
        pending.forEach((intake, i) => {
            console.log(`\n[${i + 1}] ${intake.client_name}`);
            console.log(`    Status: ${intake.status}`);
            console.log(`    Planner ID: ${intake.planner_id || 'NULL'}`);
        });
    }

    console.log('\n=== Test Complete ===');
}

testIntakeFlow();
