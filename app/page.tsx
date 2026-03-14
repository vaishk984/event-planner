import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'

export default async function HomePage() {
    const session = await getSession()

    if (!session) {
        redirect('/login')
    }

    // Redirect based on role already determined by getSession()
    redirect(`/${session.role}`)
}
