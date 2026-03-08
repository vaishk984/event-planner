import { getScoreColor } from '@/lib/services/lead-scoring'
import { Badge } from '@/components/ui/badge'

interface LeadScoreBadgeProps {
    score: number
}

export function LeadScoreBadge({ score }: LeadScoreBadgeProps) {
    const colorClass = getScoreColor(score)

    return (
        <Badge className={colorClass}>
            {score}
        </Badge>
    )
}
