import { Badge } from '@/components/ui/badge'

interface EventStatusBadgeProps {
    status: string
}

export function EventStatusBadge({ status }: EventStatusBadgeProps) {
    const variants = {
        DRAFT: { variant: 'secondary' as const, label: 'Draft' },
        PLANNED: { variant: 'default' as const, label: 'Planned' },
        LIVE: { variant: 'success' as const, label: 'Live' },
        COMPLETED: { variant: 'outline' as const, label: 'Completed' },
        CANCELLED: { variant: 'destructive' as const, label: 'Cancelled' },
    }

    const config = variants[status as keyof typeof variants] || variants.DRAFT

    return <Badge variant={config.variant}>{config.label}</Badge>
}
