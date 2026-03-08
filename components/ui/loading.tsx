'use client'

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg'
    className?: string
    text?: string
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    }

    return (
        <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
            <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
            {text && <p className="text-sm text-gray-500">{text}</p>}
        </div>
    )
}

interface LoadingOverlayProps {
    text?: string
}

export function LoadingOverlay({ text = 'Loading...' }: LoadingOverlayProps) {
    return (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <LoadingSpinner size="lg" text={text} />
        </div>
    )
}

interface LoadingPageProps {
    text?: string
}

export function LoadingPage({ text = 'Loading...' }: LoadingPageProps) {
    return (
        <div className="min-h-[400px] flex items-center justify-center">
            <LoadingSpinner size="lg" text={text} />
        </div>
    )
}

// Skeleton components for loading states
export function Skeleton({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                'animate-pulse bg-gray-200 rounded',
                className
            )}
        />
    )
}

export function CardSkeleton() {
    return (
        <div className="border rounded-lg p-6 space-y-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
            </div>
        </div>
    )
}

export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
    return (
        <tr className="animate-pulse">
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="p-4">
                    <Skeleton className="h-4 w-full" />
                </td>
            ))}
        </tr>
    )
}

export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="border rounded-lg p-6">
                        <Skeleton className="h-4 w-1/2 mb-2" />
                        <Skeleton className="h-8 w-1/3" />
                    </div>
                ))}
            </div>
            {/* Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CardSkeleton />
                <CardSkeleton />
            </div>
        </div>
    )
}
