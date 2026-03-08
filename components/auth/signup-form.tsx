'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signup } from '@/actions/auth/login'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Role = 'planner' | 'vendor'

export function SignupForm() {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [role, setRole] = useState<Role>('planner')

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)

        // Add role to form data
        formData.set('role', role)

        try {
            const result = await signup(formData)

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
            {/* Role Selection */}
            <div className="space-y-2">
                <Label>I am a</Label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => setRole('planner')}
                        className={`p-4 rounded-lg border-2 text-center transition-all ${role === 'planner'
                                ? 'border-primary bg-primary/5'
                                : 'border-muted hover:border-primary/50'
                            }`}
                    >
                        <div className="text-2xl mb-1">📋</div>
                        <div className="font-medium">Event Planner</div>
                        <div className="text-xs text-muted-foreground">
                            Manage events & vendors
                        </div>
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole('vendor')}
                        className={`p-4 rounded-lg border-2 text-center transition-all ${role === 'vendor'
                                ? 'border-primary bg-primary/5'
                                : 'border-muted hover:border-primary/50'
                            }`}
                    >
                        <div className="text-2xl mb-1">🏪</div>
                        <div className="font-medium">Vendor</div>
                        <div className="text-xs text-muted-foreground">
                            Offer services & quotes
                        </div>
                    </button>
                </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Your name"
                    required
                    disabled={loading}
                    autoComplete="name"
                />
            </div>

            {/* Email */}
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

            {/* Password */}
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Min 6 characters"
                    required
                    minLength={6}
                    disabled={loading}
                    autoComplete="new-password"
                />
            </div>

            {/* Role-specific fields */}
            {role === 'planner' && (
                <div className="space-y-2">
                    <Label htmlFor="company_name">Company Name</Label>
                    <Input
                        id="company_name"
                        name="company_name"
                        type="text"
                        placeholder="Your company or business name"
                        disabled={loading}
                    />
                </div>
            )}

            {role === 'vendor' && (
                <div className="space-y-2">
                    <Label htmlFor="category_id">Service Category</Label>
                    <select
                        id="category_id"
                        name="category_id"
                        disabled={loading}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <option value="">Select your category</option>
                        <option value="venue">Venue</option>
                        <option value="catering">Catering</option>
                        <option value="decoration">Decoration</option>
                        <option value="photography">Photography</option>
                        <option value="entertainment">Entertainment</option>
                        <option value="makeup">Makeup & Styling</option>
                        <option value="transport">Transport</option>
                        <option value="other">Other</option>
                    </select>
                </div>
            )}

            {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="text-primary hover:underline">
                    Sign in
                </Link>
            </div>
        </form>
    )
}
