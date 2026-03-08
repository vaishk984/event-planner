import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()

    // Query actual table to see column names
    const { data: infoSchema, error: infoError } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'event_intakes')

    const { data: sampleRow, error: sampleError } = await supabase
        .from('event_intakes')
        .select('*')
        .limit(1)

    return NextResponse.json({
        table: 'event_intakes',
        infoSchemaResult: infoSchema || infoError,
        sampleRow: sampleRow || sampleError,
        // Also try 'intakes' just in case
        intakesCheck: await supabase.from('intakes').select('*').limit(0).then(res => res.error ? res.error.message : 'exists')
    })
}
