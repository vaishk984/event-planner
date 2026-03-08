
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkIntakes() {
    console.log('=== Checking All Intakes in event_intakes ===\n');

    const { data, error } = await supabase
        .from('event_intakes')
        .select('id, status, planner_id, client_name, client_phone, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    console.log(`Total intakes: ${data?.length || 0}\n`);

    if (data && data.length > 0) {
        data.forEach((intake, i) => {
            const age = Math.floor((Date.now() - new Date(intake.created_at).getTime()) / 1000 / 60);
            console.log(`[${i + 1}] ${intake.client_name}`);
            console.log(`    Status: ${intake.status}`);
            console.log(`    Planner ID: ${intake.planner_id || '❌ NULL'}`);
            console.log(`    Age: ${age} min ago\n`);
        });

        // Check pending specifically
        const pending = data.filter(i => ['submitted', 'in_progress'].includes(i.status));
        const withPlanner = data.filter(i => i.planner_id);

        console.log('Summary:');
        console.log(`  Pending (submitted/in_progress): ${pending.length}`);
        console.log(`  With planner_id: ${withPlanner.length}`);
        console.log(`  Without planner_id: ${data.length - withPlanner.length}`);
    } else {
        console.log('⚠️  No intakes found in database');
    }
}

checkIntakes();
