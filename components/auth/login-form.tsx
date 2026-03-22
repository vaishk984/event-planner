'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

export function LoginForm({ errorMessage }: { errorMessage?: string | null }) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    return (
        <form
            action="/api/auth/login"
            method="POST"
            className="space-y-4"
            onSubmit={() => setIsSubmitting(true)}
        >
            {errorMessage && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <p className="font-medium">Login failed</p>
                    <p className="mt-1">{errorMessage}</p>
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    readOnly={isSubmitting}
                    className={isSubmitting ? 'opacity-50' : ''}
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
                    autoComplete="current-password"
                    readOnly={isSubmitting}
                    className={isSubmitting ? 'opacity-50' : ''}
                />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                    </>
                ) : (
                    'Sign In'
                )}
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
