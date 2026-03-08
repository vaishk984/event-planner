'use client'

import { Package, Calendar, Users, FileText, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
    icon?: React.ReactNode
    title: string
    description: string
    action?: {
        label: string
        href?: string
        onClick?: () => void
    }
    className?: string
}

export function EmptyState({
    icon,
    title,
    description,
    action,
    className
}: EmptyStateProps) {
    return (
        <div className={cn(
            'flex flex-col items-center justify-center py-12 px-4 text-center',
            className
        )}>
            {icon && (
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    {icon}
                </div>
            )}
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500 max-w-sm mb-6">{description}</p>
            {action && (
                action.href ? (
                    <Link href={action.href}>
                        <Button>{action.label}</Button>
                    </Link>
                ) : (
                    <Button onClick={action.onClick}>{action.label}</Button>
                )
            )}
        </div>
    )
}

// Pre-built empty states for common scenarios
export function NoEventsEmptyState() {
    return (
        <EmptyState
            icon={<Calendar className="w-8 h-8 text-gray-400" />}
            title="No events yet"
            description="Create your first event to get started with PlannerOS"
            action={{
                label: 'Create Event',
                href: '/planner/events/new'
            }}
        />
    )
}

export function NoVendorsEmptyState() {
    return (
        <EmptyState
            icon={<Package className="w-8 h-8 text-gray-400" />}
            title="No vendors found"
            description="Browse the vendor marketplace to find the perfect vendors for your event"
            action={{
                label: 'Browse Vendors',
                href: '/showroom'
            }}
        />
    )
}

export function NoClientsEmptyState() {
    return (
        <EmptyState
            icon={<Users className="w-8 h-8 text-gray-400" />}
            title="No clients yet"
            description="Your clients will appear here when they submit intake forms or you add them manually"
            action={{
                label: 'Add Client',
                href: '/planner/clients/new'
            }}
        />
    )
}

export function NoBookingsEmptyState() {
    return (
        <EmptyState
            icon={<FileText className="w-8 h-8 text-gray-400" />}
            title="No booking requests"
            description="You'll see booking requests from planners here once they start coming in"
        />
    )
}

export function NoSearchResultsEmptyState({ query }: { query: string }) {
    return (
        <EmptyState
            icon={<Search className="w-8 h-8 text-gray-400" />}
            title="No results found"
            description={`We couldn't find anything matching "${query}". Try adjusting your search.`}
        />
    )
}
