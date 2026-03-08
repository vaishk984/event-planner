import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://lhweubswsepknmpzliio.supabase.co'
// Hardcoding anon key to check public read access or user session, but we can't easily fake a user session here.
// Better to read the service role key from process.env and pass it via the shell.
const supabase = createClient(
    SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'fail'
)

async function run() {
    const { data: events, error: eErr } = await supabase.from('events').select('id, name').ilike('name', '%Ashish%')
    if (eErr) console.error('Events Error:', eErr.message)
    console.log('Events:', events)
    if (events && events.length) {
        const { data: items, error } = await supabase.from('timeline_items').select('*').eq('event_id', events[0].id)
        if (error) console.error('Items Error:', error.message)
        else console.log(`Found ${items.length} items:`, items)
    }
}
run()
