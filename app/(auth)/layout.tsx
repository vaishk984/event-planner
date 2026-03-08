export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="w-full max-w-sm p-6">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span className="text-xl font-semibold text-slate-800">PlannerOS</span>
                    </div>
                </div>

                {children}

                {/* Demo credentials */}
                <div className="mt-8 pt-6 border-t border-slate-200">
                    <p className="text-xs text-center text-slate-400 mb-3">Demo logins (pass: password123)</p>
                    <div className="flex justify-center gap-4 text-xs text-slate-500">
                        <span>planner@test.com</span>
                        <span>·</span>
                        <span>vendor@test.com</span>
                        <span>·</span>
                        <span>admin@test.com</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
