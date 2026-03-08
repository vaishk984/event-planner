'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, User, Calendar, Phone, ChevronRight, X } from 'lucide-react'
import { checkDuplicates, getMatchReason, DuplicateMatch } from '@/lib/duplicate-detection'
import Link from 'next/link'

interface DuplicateWarningProps {
    phone: string
    email: string
    name: string
    eventDate: string
    onDismiss?: () => void
    onViewExisting?: (submissionId: string) => void
}

export function DuplicateWarning({
    phone,
    email,
    name,
    eventDate,
    onDismiss,
    onViewExisting
}: DuplicateWarningProps) {
    const [matches, setMatches] = useState<DuplicateMatch[]>([])
    const [dismissed, setDismissed] = useState(false)

    useEffect(() => {
        // Check for duplicates when any field changes
        if (phone || email || name) {
            const found = checkDuplicates(phone, email, name, eventDate)
            setMatches(found)
            setDismissed(false)
        }
    }, [phone, email, name, eventDate])

    if (dismissed || matches.length === 0) {
        return null
    }

    const handleDismiss = () => {
        setDismissed(true)
        onDismiss?.()
    }

    // Group by confidence
    const highConfidence = matches.filter(m => m.confidence === 'high')
    const otherMatches = matches.filter(m => m.confidence !== 'high')

    return (
        <Card className={`border-2 ${highConfidence.length > 0 ? 'border-red-300 bg-red-50' : 'border-yellow-300 bg-yellow-50'}`}>
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${highConfidence.length > 0 ? 'bg-red-100' : 'bg-yellow-100'
                        }`}>
                        <AlertTriangle className={`w-5 h-5 ${highConfidence.length > 0 ? 'text-red-600' : 'text-yellow-600'
                            }`} />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className={`font-semibold ${highConfidence.length > 0 ? 'text-red-800' : 'text-yellow-800'
                                }`}>
                                {highConfidence.length > 0 ? 'Possible Duplicate Client!' : 'Similar Client Found'}
                            </h4>
                            <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <p className={`text-sm mb-3 ${highConfidence.length > 0 ? 'text-red-700' : 'text-yellow-700'
                            }`}>
                            We found {matches.length} matching client(s) in your records:
                        </p>

                        <div className="space-y-2">
                            {matches.slice(0, 3).map((match, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between p-3 bg-white rounded-lg border"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                            <User className="w-4 h-4 text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {match.submission.clientName}
                                            </p>
                                            <p className="text-xs text-gray-500 flex items-center gap-2">
                                                <span className="flex items-center gap-1">
                                                    <Phone className="w-3 h-3" />
                                                    {match.submission.phone}
                                                </span>
                                                {match.submission.eventDate && (
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(match.submission.eventDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={match.confidence === 'high' ? 'destructive' : 'secondary'}>
                                            {match.matchType}
                                        </Badge>
                                        <Link href={`/planner/events/${match.submission.id}`}>
                                            <Button variant="ghost" size="sm">
                                                View <ChevronRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {matches.length > 3 && (
                            <p className="text-xs text-gray-500 mt-2">
                                +{matches.length - 3} more matches
                            </p>
                        )}

                        <div className="flex gap-2 mt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDismiss}
                                className="text-gray-600"
                            >
                                Continue Anyway
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
