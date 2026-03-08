/**
 * Check if we are connecting anonymously
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function checkConnection() {
    console.log('Checking connection permissions...')
    console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('Service Key Present?', !!process.env.SUPABASE_SERVICE_ROLE_KEY)

    // Try to list users (requires admin)
    const { data: users, error: userError } = await supabase.auth.admin.listUsers()
    if (userError) {
        console.log('❌ Cannot list users (Expected if Anon key):', userError.message)
    } else {
        console.log('✅ Can list users (Admin access confirmed)')
    }

    // Try to count booking requests (RLS restricted)
    const { count, error: countError } = await supabase
        .from('booking_requests')
        .select('*', { count: 'exact', head: true })

    console.log('Booking Requests Visible to Script:', count)
}

checkConnection()
