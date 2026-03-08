
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const sql = `
CREATE OR REPLACE FUNCTION get_public_budget(token_input text)
RETURNS TABLE("totalEstimated" numeric, "totalSpent" numeric, "totalPaid" numeric)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    target_event_id uuid;
BEGIN
    SELECT id INTO target_event_id FROM events WHERE public_token = token_input;

    RETURN QUERY
    WITH budget_total AS (
        SELECT COALESCE(SUM(estimated_amount), 0) as est, COALESCE(SUM(actual_amount), 0) as act, COALESCE(SUM(paid_amount), 0) as pd
        FROM budget_items WHERE event_id = target_event_id
    ),
    bookings_total AS (
        SELECT COALESCE(SUM(quoted_amount), 0) as est, COALESCE(SUM(quoted_amount), 0) as act, 0 as pd
        FROM booking_requests WHERE event_id = target_event_id AND status IN ('accepted', 'confirmed', 'completed', 'quoted')
    )
    SELECT
        (SELECT est FROM budget_total) + (SELECT est FROM bookings_total) as "totalEstimated",
        (SELECT act FROM budget_total) + (SELECT act FROM bookings_total) as "totalSpent",
        (SELECT pd FROM budget_total) + (SELECT pd FROM bookings_total) as "totalPaid";
END;
$$;
`;

async function run() {
    console.log('Applying updated get_public_budget function...');
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
        // if exec_sql rpc doesn't exist (it usually doesn't by default), we might fail here.
        // Supabase client doesn't support raw SQL query execution easily without a helper RPC.
        // But wait, we can't create the helper RPC without... raw SQL.
        // Plan B: We can't run this script if exec_sql doesn't exist.
        console.error('Failed to run via RPC:', error);
        console.log('NOTE: If you do not have an exec_sql helper, you must run the migration via SQL Editor.');
    } else {
        console.log('Function updated successfully!');
    }
}

// Check if exec_sql exists first? No, just try.
// Actually, standard supabase-js doesn't allow raw SQL. 
// However, the user environment says "The user's OS version is windows."
// I can't use psql.

// Okay, if I can't run SQL, I will notify the user they might need to push migrations.
// BUT, I can try to use a specialized tool if I had it. I don't.
// I'll skip the script execution if I can't guarantee `exec_sql` exists.
// Wait, I see `scripts/fix_auth_completely.sql`. 
// I'll look at `scripts/check_grand_palace.ts` to see how they run things. 

// Just in case, I'll create the file but NOT run it if I suspect it will fail.
// Actually, I can use the `postgres` library if installed?
// `npx tsx` environment.
// Let's check package.json for `pg` or `postgres`.

run();

