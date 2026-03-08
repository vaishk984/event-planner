
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function getSchema() {
    console.log('=== Querying event_intakes Schema ===\n');

    // Query information_schema to get column details
    const { data, error } = await supabase
        .rpc('exec_sql', {
            query: `
                SELECT 
                    column_name,
                    data_type,
                    is_nullable,
                    column_default
                FROM information_schema.columns
                WHERE table_schema = 'public' 
                AND table_name = 'event_intakes'
                ORDER BY ordinal_position;
            `
        });

    if (error) {
        console.log('RPC not available, trying direct query...\n');

        // Fallback: try to insert with ALL possible fields
        const testData = {
            // Try all common fields
            status: 'draft',
            planner_id: null,
            event_id: null,
            client_name: '',
            client_phone: '',
            client_email: '',
            requirements: {}
        };

        const { data: result, error: insertError } = await supabase
            .from('event_intakes')
            .insert(testData)
            .select();

        if (insertError) {
            console.log('Insert error (reveals schema):');
            console.log(insertError.message);
            console.log(JSON.stringify(insertError, null, 2));
        } else {
            console.log('✅ Insert succeeded with:');
            console.log(JSON.stringify(testData, null, 2));
            console.log('\nResulting row columns:');
            if (result && result[0]) {
                Object.keys(result[0]).forEach(col => {
                    console.log(`  - ${col}`);
                });
            }
        }
    } else {
        console.log('Schema:');
        console.log(data);
    }
}

getSchema();
