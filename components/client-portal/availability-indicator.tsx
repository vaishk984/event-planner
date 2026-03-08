'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, AlertTriangle, CheckCircle2, Clock, ChevronRight } from 'lucide-react'
import { checkDateAvailability, getAvailabilityStatus, isSpecialDate } from '@/lib/availability-check'

interface AvailabilityIndicatorProps {
    date: string
    onSuggestDate?: (date: string) => void
}

export function AvailabilityIndicator({ date, onSuggestDate }: AvailabilityIndicatorProps) {
    const [result, setResult] = useState<ReturnType<typeof checkDateAvailability> | null>(null)

    useEffect(() => {
        if (date) {
            const availability = checkDateAvailability(date)
            setResult(availability)
        } else {
            setResult(null)
        }
    }, [date])

    if (!date || !result) {
        return null
    }

    const status = getAvailabilityStatus(result)
    const specialDay = isSpecialDate(date)

    const colorClasses = {
        available: 'border-green-200 bg-green-50',
        limited: 'border-yellow-200 bg-yellow-50',
        busy: 'border-red-200 bg-red-50',
    }

    const iconColorClasses = {
        available: 'text-green-600',
        limited: 'text-yellow-600',
        busy: 'text-red-600',
    }

    return (
        <Card className={`border-2 ${colorClasses[status.status]}`}>
            <CardContent className="p-3">
                <div className="flex items-start gap-3">
                    <div className={`mt-0.5 ${iconColorClasses[status.status]}`}>
                        {status.status === 'available' && <CheckCircle2 className="w-5 h-5" />}
                        {status.status === 'limited' && <Clock className="w-5 h-5" />}
                        {status.status === 'busy' && <AlertTriangle className="w-5 h-5" />}
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">
                                {new Date(date).toLocaleDateString('en-IN', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </span>
                            {specialDay && (
                                <Badge variant="secondary" className="text-xs">
                                    🎉 {specialDay}
                                </Badge>
                            )}
                        </div>

                        <p className={`text-sm ${status.status === 'available' ? 'text-green-700' :
                                status.status === 'limited' ? 'text-yellow-700' :
                                    'text-red-700'
                            }`}>
                            {status.message}
                        </p>

                        {/* Conflict details */}
                        {result.conflicts.length > 0 && (
                            <div className="mt-2 space-y-1">
                                <p className="text-xs text-gray-500 font-medium">Booked vendors:</p>
                                <div className="flex flex-wrap gap-1">
                                    {result.conflicts.slice(0, 4).map((conflict, i) => (
                                        <Badge key={i} variant="outline" className="text-xs">
                                            {conflict.category}: {conflict.vendorName}
                                        </Badge>
                                    ))}
                                    {result.conflicts.length > 4 && (
                                        <Badge variant="outline" className="text-xs">
                                            +{result.conflicts.length - 4} more
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Suggestions */}
                        {result.suggestions.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                                <p className="text-xs text-gray-500 font-medium mb-2">
                                    Alternative dates with better availability:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {result.suggestions.map((suggestedDate, i) => (
                                        <Button
                                            key={i}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onSuggestDate?.(suggestedDate)}
                                            className="text-xs h-7 gap-1"
                                        >
                                            <Calendar className="w-3 h-3" />
                                            {new Date(suggestedDate).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short'
                                            })}
                                            <ChevronRight className="w-3 h-3" />
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
