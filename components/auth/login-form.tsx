import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LoginForm({ errorMessage }: { errorMessage?: string | null }) {
    return (
        <form action="/api/auth/login" method="POST" className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
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
                    autoComplete="current-password"
                />
            </div>

            {errorMessage && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                    {errorMessage}
                </div>
            )}

            <Button type="submit" className="w-full">
                Sign In
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
