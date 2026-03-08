
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || '';

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase Config');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testRpc() {
    console.log('🔄 Reloading Schema Cache...');

    try {
        const { data, error } = await supabase.rpc('reload_schema');
        if (error) {
            // It might not exist, or might need no args
            console.log('Using NOTIFY pgrst to reload...');
            const { error: notifyError } = await supabase.from('vendors').select('count').limit(1); // Just a dummy query to wake it up?
            // Actually, to reload schema cache on Supabase, one often needs to run:
            // NOTIFY pgrst, 'reload schema'
            // But we can't run raw SQL.
            // Let's try calling a function that we know exists or just ignore and move to postgres driver.
            console.error('❌ RPC reload_schema failed:', error);
        } else {
            console.log('✅ RPC Success:', data);
        }
    } catch (e) {
        console.error('RPC Error', e);
    }
}

testRpc();
