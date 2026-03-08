import '@/app/globals.css'

export const metadata = {
    title: 'PlannerOS Showroom',
    description: 'Client Presentation Mode',
}

export default function ShowroomLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Minimalist Presentation Header */}
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">P</span>
                        </div>
                        <span className="font-semibold text-gray-900 tracking-tight">
                            PlannerOS <span className="text-gray-400 font-normal">| Showroom</span>
                        </span>
                    </div>
                    <div>
                        <a href="/planner" className="text-xs font-medium text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-colors">
                            Exit Presentation
                        </a>
                    </div>
                </div>
            </header>
            <main className="container mx-auto px-6 py-8">
                {children}
            </main>
        </div>
    )
}
