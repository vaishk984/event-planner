/**
 * Check if any booking requests exist now
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function checkBookings() {
    console.log('Checking for booking requests...')

    const { data, error, count } = await supabase
        .from('booking_requests')
        .select('*', { count: 'exact' })

    if (error) {
        console.error('Error:', error)
        return
    }

    console.log(`Total booking requests: ${count}`)
    if (data && data.length > 0) {
        console.log('Latest booking:', data[0])
    } else {
        console.log('No booking requests found.')
    }
}

checkBookings()
