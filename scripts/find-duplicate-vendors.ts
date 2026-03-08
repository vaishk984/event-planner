/**
 * Search for Heritage Haveli vendor to confirm duplication
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function findDuplicateVendors() {
    console.log('--- SEARCH START ---')

    // 1. Search by Company Name
    const { data: byName } = await supabase
        .from('vendors')
        .select('id, company_name, email, user_id, contact_name')
        .or('company_name.ilike.%Heritage%,company_name.ilike.%Vikram%')

    console.log('\nResults by Name (Heritage or Vikram):')
    console.log(JSON.stringify(byName, null, 2))

    // 2. Search by Email
    const { data: byEmail } = await supabase
        .from('vendors')
        .select('id, company_name, email, user_id')
        .eq('email', 'bookings@heritagehaveli.com')

    console.log('\nResults by Email (bookings@heritagehaveli.com):')
    console.log(JSON.stringify(byEmail, null, 2))

    // 3. Search for the user ID associated with the logged-in session (from logs)
    const { data: byId } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', 'ab6b6e93-1f3d-4585-9705-84439dad7edc')

    console.log('\nResults by ID (from logs):')
    console.log(JSON.stringify(byId, null, 2))

    console.log('--- SEARCH END ---')
}

findDuplicateVendors()
