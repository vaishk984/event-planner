
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''; // Use ANON key to simulate client/anon access if needed, but for verification we might want SERVICE_ROLE if we suspect RLS is hiding things. But usually we only have ANON in .env.local

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyPersistence() {
    console.log('--- Verifying Save Flow (event_intakes) ---');

    const testToken = `verify_${Date.now()}`;
    const testPlannerId = '123e4567-e89b-12d3-a456-426614174000'; // Dummy UUID
    const testIntake = {
        client_name: 'Verification Bot with Planner',
        client_email: 'bot_planner@verify.com',
        client_phone: '555-0199',
        status: 'submitted',
        planner_id: testPlannerId, // simulate what repository sends
        requirements: {
            token: testToken,
            notes: 'Created by verification script with planner_id'
        }
    };

    console.log('Attempting to insert test intake with planner_id...');
    const { data, error } = await supabase
        .from('event_intakes')
        .insert(testIntake)
        .select()
        .single();

    if (error) {
        console.error('INSERT FAILED:', JSON.stringify(error, null, 2));
        return;
    }

    console.log('INSERT SUCCESS:', data.id);
    console.log('Planner ID in DB:', data.planner_id);

    if (data.planner_id === testPlannerId) {
        console.log('✅ SUCCESS: Planner ID matches. Visibility verified.');
    } else {
        console.error('❌ FAIL: Planner ID mismatch or null.');
    }
}

verifyPersistence();
