import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const results: any = {};

    console.log('Fetching data...');

    // 1. Intakes
    const { data: intakes } = await supabase
        .from('event_intakes')
        .select('*')
        .ilike('client_name', '%Priya%');
    results.intakes = intakes;

    // 2. Events
    const { data: events } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
    results.events = events;

    // 3. Approved Venues
    const { data: bookings } = await supabase
        .from('booking_requests')
        .select(`
            id,
            status,
            event_id,
            events (name),
            vendors (company_name),
            service_category,
            quoted_amount
        `)
        .eq('service_category', 'venue')
        .in('status', ['accepted', 'confirmed', 'completed']);
    results.venues = bookings;

    fs.writeFileSync('debug_priya.json', JSON.stringify(results, null, 2));
    console.log('Done! Written to debug_priya.json');
}

check();
