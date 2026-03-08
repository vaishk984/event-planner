/**
 * Authentication Configuration
 * 
 * Auth settings including JWT, session, and role configurations.
 */

export const AuthConfig = {
    // JWT settings
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: '7d',
        refreshExpiresIn: '30d',
    },

    // Session settings
    session: {
        cookieName: 'planner-os-session',
        maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    },

    // Available roles in the system
    roles: {
        ADMIN: 'admin',
        PLANNER: 'planner',
        VENDOR: 'vendor',
        CLIENT: 'client',
    } as const,

    // Role permissions (RBAC)
    permissions: {
        admin: ['*'], // Full access
        planner: [
            'events:create', 'events:read', 'events:update', 'events:delete',
            'leads:create', 'leads:read', 'leads:update', 'leads:delete',
            'proposals:create', 'proposals:read', 'proposals:update',
            'invoices:create', 'invoices:read', 'invoices:update',
            'vendors:read', 'vendors:book',
        ],
        vendor: [
            'tasks:read', 'tasks:update',
            'availability:create', 'availability:read', 'availability:update',
            'profile:read', 'profile:update',
        ],
        client: [
            'events:read',
            'proposals:read', 'proposals:approve',
            'invoices:read', 'invoices:pay',
        ],
    },
} as const;

export type Role = keyof typeof AuthConfig.permissions;
