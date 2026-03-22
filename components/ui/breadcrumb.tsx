'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
    label: string
    href?: string
}

interface BreadcrumbProps {
    items: BreadcrumbItem[]
    className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
    return (
        <nav aria-label="Breadcrumb" className={cn('flex items-center text-sm text-gray-500 mb-4', className)}>
            <Link
                href="/planner"
                className="flex items-center hover:text-orange-600 transition-colors"
            >
                <Home className="w-4 h-4" />
            </Link>
            {items.map((item, index) => (
                <span key={index} className="flex items-center">
                    <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
                    {item.href && index < items.length - 1 ? (
                        <Link
                            href={item.href}
                            className="hover:text-orange-600 transition-colors"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-gray-800 font-medium">{item.label}</span>
                    )}
                </span>
            ))}
        </nav>
    )
}
