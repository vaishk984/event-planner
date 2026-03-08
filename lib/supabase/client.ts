import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function createClient() {
    return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = createClient()

/**
 * Test database connection
 */
export async function testConnection() {
    try {
        const { data, error } = await supabase.from('roles').select('count')

        if (error) {
            console.error('❌ Database connection failed:', error.message)
            return false
        }

        console.log('✅ Database connection successful!')
        return true
    } catch (err) {
        console.error('❌ Connection error:', err)
        return false
    }
}

/**
 * List all tables
 */
export async function listTables() {
    try {
        const { data, error } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')

        if (error) throw error

        return data?.map(t => t.table_name) || []
    } catch (err) {
        console.error('Error listing tables:', err)
        return []
    }
}
