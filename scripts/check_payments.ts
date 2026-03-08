
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkData() {
    console.log('Checking financial_payments table...')
    const { count: paymentsCount, error: paymentsError } = await supabase
        .from('financial_payments')
        .select('*', { count: 'exact', head: true })

    if (paymentsError) {
        console.error('Error checking payments:', paymentsError)
    } else {
        console.log(`Found ${paymentsCount} records in financial_payments`)
    }

    console.log('Checking booking_requests table...')
    const { data: bookings, error: bookingsError } = await supabase
        .from('booking_requests')
        .select('status, quoted_amount')

    if (bookingsError) {
        console.error('Error checking bookings:', bookingsError)
    } else {
        console.log(`Found ${bookings?.length} records in booking_requests`)
        const completed = bookings?.filter(b => b.status === 'completed')
        const accepted = bookings?.filter(b => b.status === 'accepted')

        console.log(`- Completed: ${completed?.length}`)
        console.log(`- Accepted: ${accepted?.length}`)
    }
}

checkData()
