
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

async function checkIntakeData() {
    console.log('=== Checking Event Intakes Table ===\n');

    // 1. Check all intakes
    console.log('1. Fetching ALL intakes from event_intakes...');
    const { data: allIntakes, error: allError } = await supabase
        .from('event_intakes')
        .select('id, status, planner_id, client_name, client_phone, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

    if (allError) {
        console.error('❌ Error fetching intakes:', allError.message);
        console.error('Details:', JSON.stringify(allError, null, 2));
        return;
    }

    console.log(`\n✅ Found ${allIntakes?.length || 0} total intakes\n`);

    if (!allIntakes || allIntakes.length === 0) {
        console.log('⚠️  NO INTAKES IN DATABASE - Data is not being saved!');
        console.log('\nPossible causes:');
        console.log('  1. Client-side save is failing silently');
        console.log('  2. RLS INSERT policy is blocking writes');
        console.log('  3. Table does not exist');
        return;
    }

    // 2. Analyze intake data
    console.log('Recent Intakes:\n');
    allIntakes.forEach((intake, i) => {
        const age = Math.floor((Date.now() - new Date(intake.created_at).getTime()) / 1000 / 60);
        console.log(`[${i + 1}] ${intake.client_name}`);
        console.log(`    ID: ${intake.id}`);
        console.log(`    Status: ${intake.status}`);
        console.log(`    Planner ID: ${intake.planner_id || '❌ NULL'}`);
        console.log(`    Phone: ${intake.client_phone}`);
        console.log(`    Created: ${age} minutes ago`);
        console.log('');
    });

    // 3. Check for pending intakes specifically
    const pending = allIntakes.filter(i => i.status === 'submitted' || i.status === 'in_progress');
    const orphans = allIntakes.filter(i => !i.planner_id);

    console.log('\n📊 Summary:');
    console.log(`   Total intakes: ${allIntakes.length}`);
    console.log(`   Pending (submitted/in_progress): ${pending.length}`);
    console.log(`   Orphans (no planner_id): ${orphans.length}`);

    if (orphans.length > 0) {
        console.log('\n⚠️  WARNING: Found orphan intakes without planner_id!');
        console.log('   These will NOT show on the dashboard due to RLS policies.');
    }

    if (pending.length === 0) {
        console.log('\n⚠️  No intakes with status "submitted" or "in_progress"');
        console.log('   Dashboard filters for these statuses.');
        const statuses = [...new Set(allIntakes.map(i => i.status))];
        console.log(`   Found statuses: ${statuses.join(', ')}`);
    }
}

checkIntakeData();
