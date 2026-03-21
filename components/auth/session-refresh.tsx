'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

/**
 * Invisible component that keeps the Supabase session alive.
 *
 * On mount it calls getSession() so the browser client becomes aware of
 * the current auth cookies. Then every 4 minutes it calls getSession()
 * again, which transparently refreshes the access token if it is close
 * to expiry. This prevents the "Unauthorized" / "0 events" errors that
 * occur when the token expires between navigations.
 */
export function SessionRefresh() {
    useEffect(() => {
        // Sync the browser client with the current cookie state
        supabase.auth.getSession()

        const interval = setInterval(() => {
            supabase.auth.getSession()
        }, 4 * 60 * 1000) // every 4 minutes

        return () => clearInterval(interval)
    }, [])

    return null // no UI
}
