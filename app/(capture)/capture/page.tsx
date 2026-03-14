import { CaptureClientWrapper } from './capture-client'
import { getUserId } from '@/lib/session'
import { redirect } from 'next/navigation'

export default async function CapturePage() {
    const userId = await getUserId()

    if (!userId) {
        redirect('/login')
    }

    const token = `capture_${Date.now().toString(36)}`

    return <CaptureClientWrapper token={token} plannerId={userId} />
}
