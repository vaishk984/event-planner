'use client'

import { useState } from 'react'
import Link from 'next/link'
import { login } from '@/actions/auth/login'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LoginForm() {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)

        try {
            const result = await login(formData)

            if (result?.error) {
                setError(result.error)
                setLoading(false)
            }
            // If no error, the action will redirect
        } catch (err) {
            setError('An unexpected error occurred. Please try again.')
            setLoading(false)
        }
    }

    return (
        <form action={handleSubmit} className="space-y-4">
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

            {/* Demo credentials hint */}
            <div className="mt-4 p-3 bg-muted rounded-md text-sm">
                <p className="font-medium mb-1">Demo Accounts:</p>
                <p className="text-muted-foreground">
                    Planner: demo@planner.com<br />
                    Vendor: demo@vendor.com<br />
                    Admin: demo@admin.com<br />
                    <span className="text-xs">(Password: demo123)</span>
                </p>
            </div>
        </form>
    )
}
