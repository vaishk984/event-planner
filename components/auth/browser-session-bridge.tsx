'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export function BrowserSessionBridge() {
    useEffect(() => {
        let cancelled = false

        async function syncBrowserSession() {
            const { data: { session } } = await supabase.auth.getSession()

            if (session?.access_token && session?.refresh_token) {
                return
            }

            const response = await fetch('/api/auth/browser-session', {
                credentials: 'include',
                cache: 'no-store',
            })

            if (!response.ok) {
                return
            }

            const result = await response.json()

            if (cancelled || !result.accessToken || !result.refreshToken) {
                return
            }

            await supabase.auth.setSession({
                access_token: result.accessToken,
                refresh_token: result.refreshToken,
            })
        }

        void syncBrowserSession()

        return () => {
            cancelled = true
        }
    }, [])

    return null
}
