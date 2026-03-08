import { UserRole } from '@/lib/types'

export interface NavItem {
    title: string
    href: string
    icon?: string
    disabled?: boolean
    external?: boolean
    roles?: UserRole[]
}

export const plannerNavigation: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/planner',
        icon: 'LayoutDashboard',
        roles: ['planner'],
    },
    {
        title: 'Leads',
        href: '/planner/leads',
        icon: 'Users',
        roles: ['planner'],
    },
    {
        title: 'Events',
        href: '/planner/events',
        icon: 'Calendar',
        roles: ['planner'],
    },
    {
        title: 'Vendors',
        href: '/planner/vendors',
        icon: 'Store',
        roles: ['planner'],
    },
    {
        title: 'Analytics',
        href: '/planner/analytics',
        icon: 'BarChart',
        roles: ['planner'],
    },
    {
        title: 'Settings',
        href: '/planner/settings',
        icon: 'Settings',
        roles: ['planner'],
    },
]

export const clientNavigation: NavItem[] = [
    {
        title: 'My Events',
        href: '/client/events',
        icon: 'Calendar',
        roles: ['client'],
    },
    {
        title: 'Settings',
        href: '/client/settings',
        icon: 'Settings',
        roles: ['client'],
    },
]

export const vendorNavigation: NavItem[] = [
    {
        title: 'Tasks',
        href: '/vendor/tasks',
        icon: 'CheckSquare',
        roles: ['vendor'],
    },
    {
        title: 'Availability',
        href: '/vendor/availability',
        icon: 'Calendar',
        roles: ['vendor'],
    },
    {
        title: 'Earnings',
        href: '/vendor/earnings',
        icon: 'DollarSign',
        roles: ['vendor'],
    },
    {
        title: 'Settings',
        href: '/vendor/settings',
        icon: 'Settings',
        roles: ['vendor'],
    },
]
