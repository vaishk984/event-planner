import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
    try {
        // Only allow same-origin requests (basic CSRF protection)
        const headersList = await headers()
        const referer = headersList.get('referer')
        const host = headersList.get('host')
        if (referer && host && !referer.includes(host)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get session tokens for client-side bridge
        const { data: { session } } = await supabase.auth.getSession()

        if (!session?.access_token || !session?.refresh_token) {
            return NextResponse.json({ error: 'No active session' }, { status: 401 })
        }

        const response = NextResponse.json({
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
            expiresAt: session.expires_at ?? null,
        })

        // Prevent caching of tokens
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
        response.headers.set('Pragma', 'no-cache')

        return response
    } catch (err) {
        console.error('Browser session error:', err)
        return NextResponse.json(
            { error: err instanceof Error ? err.message : 'An unexpected error occurred' },
            { status: 500 }
        )
    }
}
