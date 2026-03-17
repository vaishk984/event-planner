'use client'

import { useState } from 'react'
import Link from 'next/link'
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

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                body: formData,
                credentials: 'include',
            })

            const result = await response.json()

            if (!response.ok) {
                setError(result.error || 'Login failed. Please try again.')
                setLoading(false)
                return
            }

            window.location.assign(result.redirectUrl || '/planner')
        } catch {
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
                    placeholder="********"
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
