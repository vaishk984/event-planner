
import { CaptureClientWrapper } from './capture-client'
import { getCurrentUser } from '@/actions/auth/login'
import { redirect } from 'next/navigation'

export default async function CapturePage() {
    const user = await getCurrentUser()

    if (!user) {
        redirect('/login')
    }

    const token = `capture_${Date.now().toString(36)}`

    return <CaptureClientWrapper token={token} plannerId={user.id} />
}
