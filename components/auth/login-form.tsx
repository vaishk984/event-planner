'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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

        try {
            // Use the existing browser Supabase client singleton.
            // createBrowserClient from @supabase/ssr stores session tokens
            // as cookies in document.cookie, making them available to
            // Server Components via next/headers cookies().
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

            // Verify the session is available by reading it back.
            // This forces the @supabase/ssr cookie storage to flush.
            const { data: sessionCheck } = await supabase.auth.getSession()
            console.log('[LoginForm] Session verified after login:', !!sessionCheck.session)
            console.log('[LoginForm] document.cookie length:', document.cookie.length)
            console.log('[LoginForm] document.cookie preview:', document.cookie.substring(0, 200))

            // Determine role
            const { data: vendorRecord } = await supabase
                .from('vendors')
                .select('id')
                .eq('user_id', data.user.id)
                .maybeSingle()

            const role = vendorRecord ? 'vendor' : 'planner'

            // Full page reload so Server Components get the fresh cookies
            window.location.href = `/${role}`
        } catch (err) {
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
