'use client'

import { useState } from 'react'
import Link from 'next/link'
import { requestPasswordReset } from '@/actions/auth/login'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ForgotPasswordForm() {
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)

        const email = formData.get('email') as string

        try {
            const result = await requestPasswordReset(email)

            if (result?.error) {
                setError(result.error)
            } else {
                setSuccess(true)
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="space-y-4 text-center">
                <div className="text-4xl">📧</div>
                <div className="text-lg font-medium">Check your email</div>
                <div className="text-sm text-muted-foreground">
                    We've sent a password reset link to your email address.
                    Click the link in the email to reset your password.
                </div>
                <Link
                    href="/login"
                    className="block text-primary hover:underline text-sm"
                >
                    Back to login
                </Link>
            </div>
        )
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

            {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
                Remember your password?{' '}
                <Link href="/login" className="text-primary hover:underline">
                    Sign in
                </Link>
            </div>
        </form>
    )
}
