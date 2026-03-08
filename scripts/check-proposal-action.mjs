import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    'https://lhweubswsepknmpzliio.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'fail'
)

async function run() {
    const eventId = '1cb0aef6-29d2-4b87-bc13-a96e16abf487'
    const { data, error } = await supabase
        .from('booking_requests')
        .select(`
            *,
            vendor:vendors (
                company_name,
                start_price,
                rating,
                image_url,
                description,
                category
            )
        `)
        .eq('event_id', eventId)

    if (error) {
        console.error('Error fetching booking requests:', error)
        return
    }

    const mapped = data.map((req) => ({
        id: req.id,
        service: req.service,
        status: req.status,
        vendorCategory: req.vendor?.category || req.service,
        vendorName: req.vendor?.company_name || 'Unknown Vendor',
        vendorPrice: req.vendor?.start_price || 0,
        quotedAmount: req.quoted_amount,
        vendorDetails: req.vendor
    }))

    console.log('Mapped requests:', JSON.stringify(mapped, null, 2))
}
run()
