'use client'

import { useEffect } from 'react'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Unhandled error:', error)
    }, [error])

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-amber-50/30 flex items-center justify-center p-4">
            <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-200">
                    <span className="text-white font-bold text-2xl">!</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Something went wrong</h2>
                <p className="text-gray-500 mb-6">
                    An unexpected error occurred. Please try again or contact support if the issue persists.
                </p>
                {process.env.NODE_ENV === 'development' && (
                    <pre className="text-left text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-4 mb-6 overflow-auto max-h-40">
                        {error.message}
                    </pre>
                )}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={reset}
                        className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                    >
                        Try Again
                    </button>
                    <a
                        href="/planner"
                        className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 transition-all duration-200"
                    >
                        Go to Dashboard
                    </a>
                </div>
                <p className="text-xs text-gray-400 mt-8">PlannerOS &mdash; The Operating System for Event Planners</p>
            </div>
        </div>
    )
}
