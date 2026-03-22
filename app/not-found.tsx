import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-amber-50/30 flex items-center justify-center p-4">
            <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-200">
                    <span className="text-white font-bold text-2xl">P</span>
                </div>
                <h1 className="text-7xl font-bold text-gray-200 mb-2">404</h1>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Page not found</h2>
                <p className="text-gray-500 mb-8">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/planner"
                        className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                    >
                        Go to Dashboard
                    </Link>
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 transition-all duration-200"
                    >
                        Sign In
                    </Link>
                </div>
                <p className="text-xs text-gray-400 mt-8">PlannerOS &mdash; The Operating System for Event Planners</p>
            </div>
        </div>
    )
}
