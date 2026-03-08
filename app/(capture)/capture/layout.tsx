import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'

export default async function CaptureLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getSession()

    if (!session) {
        redirect('/login')
    }

    // Full-screen layout without sidebar for focused capture experience
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
            {children}
        </div>
    )
}
