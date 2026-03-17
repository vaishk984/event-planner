import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
    console.log('Logging in...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'anubhav.kus12@gmail.com',
        password: 'anubhav1234'
    })

    if (authError) {
        console.error('Login failed:', authError.message)
        return
    }

    console.log('Logged in as:', authData.user?.id)

    console.log('\n--- Checking User Profile ---')
    const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authData.user?.id)
    
    console.log('Profile:', profileError ? profileError.message : profile)

    console.log('\n--- Checking Events ---')
    const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('*')
    
    console.log(`Found ${events?.length || 0} events.`)
    if (eventsError) console.error('Events error:', eventsError)
    if (events && events.length > 0) {
        console.log('First event:', events[0].id, 'Planner ID:', events[0].planner_id)
    }

    console.log('\n--- Bypassing RLS (Service Role Check) ---')
    // We would need the service role key to completely bypass RLS, 
    // but let's just see if we get ANY events down for this planner_id
}

test()
