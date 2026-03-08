import { UserRole } from '@/lib/types'

export interface Permission {
    resource: string
    actions: ('create' | 'read' | 'update' | 'delete')[]
}

export const rolePermissions: Record<UserRole, Permission[]> = {
    planner: [
        { resource: 'leads', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'events', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'packages', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'vendors', actions: ['read', 'update'] },
        { resource: 'tasks', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'analytics', actions: ['read'] },
    ],
    client: [
        { resource: 'events', actions: ['read'] },
        { resource: 'packages', actions: ['read'] },
        { resource: 'checklists', actions: ['read', 'update'] },
        { resource: 'feedback', actions: ['create', 'read'] },
    ],
    vendor: [
        { resource: 'tasks', actions: ['read', 'update'] },
        { resource: 'availability', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'earnings', actions: ['read'] },
    ],
}

export function hasPermission(
    role: UserRole,
    resource: string,
    action: 'create' | 'read' | 'update' | 'delete'
): boolean {
    const permissions = rolePermissions[role]
    const resourcePermission = permissions.find((p) => p.resource === resource)
    return resourcePermission?.actions.includes(action) ?? false
}
