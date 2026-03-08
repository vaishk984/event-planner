import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    'https://lhweubswsepknmpzliio.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'fail'
)

async function run() {
    const eventId = '1cb0aef6-29d2-4b87-bc13-a96e16abf487'
    const plannerId = '6b2d1f34-5f4e-4f6c-96e9-883e1705fa8a' // The planner who owns the event

    // Get event details
    const { data: event } = await supabase.from('events').select('*').eq('id', eventId).single()
    if (!event) return console.error('No event')

    // Find any booking requests missing planner_id and patch them
    const { data: missingRequests, error: findError } = await supabase
        .from('booking_requests')
        .select('*')
        .eq('event_id', eventId)
        .is('planner_id', null)

    if (findError) return console.error(findError)

    console.log(`Found ${missingRequests?.length || 0} orphaned booking requests to fix.`)

    for (const req of missingRequests || []) {
        const { error: updateError } = await supabase
            .from('booking_requests')
            .update({
                planner_id: plannerId,
                event_name: event.name,
                event_date: event.date,
                city: event.city,
                venue: event.venue_name || 'TBD',
                guest_count: event.guest_count
            })
            .eq('id', req.id)

        if (updateError) console.error('Update error on', req.id, updateError)
        else console.log('Successfully patched row', req.id)
    }
}
run()
