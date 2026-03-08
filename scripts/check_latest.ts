
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLatest() {
    console.log('=== Checking Latest Intakes ===\n');

    const { data, error } = await supabase
        .from('event_intakes')
        .select('*')
        .order('id', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    if (!data || data.length === 0) {
        console.log('No intakes found');
        return;
    }

    console.log(`Showing ${data.length} most recent intakes:\n`);

    data.forEach((intake, i) => {
        console.log(`[${i + 1}] ${intake.client_name || 'N/A'}`);
        console.log(`    ID: ${intake.id}`);
        console.log(`    Status: ${intake.status}`);
        console.log(`    Planner ID: ${intake.planner_id || '❌ NULL'}`);
        console.log(`    Phone: ${intake.client_phone || 'N/A'}`);
        console.log('');
    });

    const withPlanner = data.filter(i => i.planner_id);
    const withoutPlanner = data.filter(i => !i.planner_id);

    console.log('Summary:');
    console.log(`  ✅ With planner_id: ${withPlanner.length}`);
    console.log(`  ❌ Without planner_id (orphans): ${withoutPlanner.length}`);

    if (withPlanner.length === 0) {
        console.log('\n⚠️  All recent intakes are still orphans!');
        console.log('    This means the dev server likely has NOT been restarted yet.');
        console.log('    OR new intakes have not been created since the fix.');
    }
}

checkLatest();
