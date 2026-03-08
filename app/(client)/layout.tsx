import '@/app/globals.css'

export const metadata = {
    title: 'PlannerOS - Proposal Review',
    description: 'Review your event proposal',
}

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-gray-50">
            {children}
        </div>
    )
}
