import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ShieldX } from 'lucide-react'

export default function ForbiddenPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center max-w-md px-6">
                <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                    <ShieldX className="w-10 h-10 text-red-600" />
                </div>

                <h1 className="text-4xl font-bold text-gray-900 mb-2">403</h1>
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Access Denied</h2>

                <p className="text-gray-500 mb-8">
                    You don't have permission to access this page.
                    Please contact your administrator if you believe this is an error.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/">
                        <Button variant="outline">
                            Go Home
                        </Button>
                    </Link>
                    <Link href="/login">
                        <Button>
                            Sign In
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
