import { LeadForm } from '@/components/leads/lead-form'

export default function NewLeadPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">New Lead</h2>
                <p className="text-muted-foreground">
                    Capture a new lead and let our system calculate the priority score
                </p>
            </div>

            <LeadForm />
        </div>
    )
}
