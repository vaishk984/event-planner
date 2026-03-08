import { getGuests } from '@/actions/guests'
import { GuestsClient } from './guests-client'
import { Card } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

// Define params type for Next.js 15+
type Params = Promise<{ id: string }>

export default async function GuestsPage(props: { params: Params }) {
    const params = await props.params
    const { id } = params

    const result = await getGuests(id)

    if (result.error) {
        return (
            <div className="flex items-center justify-center h-96">
                <Card className="p-8 text-center text-red-600 bg-red-50">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
                    <h2 className="text-lg font-bold">Error Loading Guests</h2>
                    <p>{result.error}</p>
                </Card>
            </div>
        )
    }

    const guests = result.data || []

    return <GuestsClient guests={guests} eventId={id} />
}
