
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkBudgetSchemaDetails() {
    console.log('=== Checking budget_items Columns ===\n');

    // Attempt to select specific columns to see which ones exist
    const columnsToCheck = ['estimated_amount', 'allocated_amount', 'actual_amount', 'spent_amount', 'paid_amount', 'description'];

    // We can't easily Query information_schema with the JS client RLS restrictions usually, 
    // so we'll just try to select each column and see if it errors.

    // Check if table exists first
    const { error: tableError } = await supabase.from('budget_items').select('count').limit(1);
    if (tableError) {
        console.log("❌ Table 'budget_items' does not exist.");
        return;
    }
    console.log("✅ Table 'budget_items' exists.");

    for (const col of columnsToCheck) {
        const { error } = await supabase.from('budget_items').select(col).limit(1);
        if (error) {
            console.log(`❌ Column '${col}' MISSING. (Error: ${error.message})`);
        } else {
            console.log(`✅ Column '${col}' EXISTS.`);
        }
    }
}

checkBudgetSchemaDetails();
