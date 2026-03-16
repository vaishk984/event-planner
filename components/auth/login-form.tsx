'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/**
 * Manually chunk and write the Supabase session to document.cookie.
 * This bypasses @supabase/ssr's createBrowserClient cookie storage
 * which appears to silently fail on Vercel deployments.
 */
function writeSessionToCookies(supabaseUrl: string, accessToken: string, refreshToken: string) {
    // Extract project ref from URL (e.g., "https://abcdef.supabase.co" → "abcdef")
    const projectRef = new URL(supabaseUrl).hostname.split('.')[0]
    const cookieName = `sb-${projectRef}-auth-token`

    // Encode as base64url to avoid special chars (semicolons, commas) breaking
    // document.cookie parsing. Compact and safe for cookie values.
    const sessionJson = JSON.stringify({ access_token: accessToken, refresh_token: refreshToken })
    const encoded = btoa(sessionJson)

    console.log(`[LoginForm] Session JSON length: ${sessionJson.length}, base64 length: ${encoded.length}`)

    // Clear any old chunks first
    for (let i = 0; i < 10; i++) {
        document.cookie = `${cookieName}.${i}=; path=/; max-age=0`
    }
    document.cookie = `${cookieName}=; path=/; max-age=0`

    const maxAge = 100 * 365 * 24 * 60 * 60 // 100 years (Supabase default)
    const secure = window.location.protocol === 'https:' ? '; Secure' : ''

    // Base64 produces only A-Za-z0-9+/= chars, all safe for cookies.
    // Single cookie — this should be ~1400 bytes, well under the 4096 limit.
    const cookieStr = `${cookieName}=${encoded}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`
    console.log(`[LoginForm] Cookie size: ${cookieStr.length} bytes`)
    document.cookie = cookieStr

    console.log(`[LoginForm] Wrote cookie ${cookieName}`)
    console.log(`[LoginForm] document.cookie after write:`, document.cookie.substring(0, 300))
}

export function LoginForm() {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const email = formData.get('email') as string
        const password = formData.get('password') as string

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

        try {
            // Use @supabase/supabase-js directly (NOT @supabase/ssr)
            // to avoid any cookie storage singleton issues
            const supabase = createClient(supabaseUrl, supabaseKey, {
                auth: {
                    // Disable automatic storage — we'll handle cookies ourselves
                    persistSession: false,
                    autoRefreshToken: false,
                }
            })

            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (signInError) {
                setError(signInError.message)
                setLoading(false)
                return
            }

            if (!data.session) {
                setError('Login failed. No session returned.')
                setLoading(false)
                return
            }

            console.log('[LoginForm] Sign-in successful, writing cookies manually...')

            // Manually write the session tokens as cookies
            writeSessionToCookies(supabaseUrl, data.session.access_token, data.session.refresh_token)

            // Verify: try reading what we just wrote
            const cookieCheck = document.cookie
            console.log('[LoginForm] Cookie verification — total cookie string length:', cookieCheck.length)
            console.log('[LoginForm] Cookie names:', cookieCheck.split(';').map(c => c.trim().split('=')[0]).join(', '))

            // Also verify server-side by calling our debug endpoint
            try {
                const debugRes = await fetch('/api/debug-auth')
                const debugData = await debugRes.json()
                console.log('[LoginForm] Server sees cookies:', JSON.stringify(debugData))
            } catch (e) {
                console.warn('[LoginForm] Debug endpoint check failed:', e)
            }

            // Determine role
            const { data: vendorRecord } = await supabase
                .from('vendors')
                .select('id')
                .eq('user_id', data.user.id)
                .maybeSingle()

            const role = vendorRecord ? 'vendor' : 'planner'

            // Full page reload
            window.location.href = `/${role}`
        } catch (err) {
            console.error('[LoginForm] Unexpected error:', err)
            setError('An unexpected error occurred. Please try again.')
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    disabled={loading}
                    autoComplete="email"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    autoComplete="current-password"
                />
            </div>

            {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <div className="flex justify-between text-sm text-muted-foreground">
                <Link href="/forgot-password" className="text-primary hover:underline">
                    Forgot password?
                </Link>
                <Link href="/signup" className="text-primary hover:underline">
                    Create account
                </Link>
            </div>
        </form>
    )
}
