import { Inter } from 'next/font/google'
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: 'Share Your Vision | PlannerOS',
    description: 'Tell us about your dream event',
}

export default function IntakeLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={`${inter.className} bg-gradient-to-br from-orange-50 via-white to-amber-50 min-h-screen`}>
                {children}
            </body>
        </html>
    )
}
