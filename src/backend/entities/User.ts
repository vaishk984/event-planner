/**
 * User Entity
 * 
 * Domain model for system users.
 */

import { BaseEntity } from './BaseEntity';

export type UserRole = 'admin' | 'planner' | 'vendor' | 'client';

export interface UserData {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    phone?: string;
    companyName?: string;
    imageUrl?: string;
    isActive: boolean;
    lastLoginAt?: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export class User extends BaseEntity {
    email: string;
    name: string;
    private _role: UserRole;
    phone?: string;
    companyName?: string;
    imageUrl?: string;
    isActive: boolean;
    lastLoginAt?: Date;

    constructor(data: UserData) {
        super(data);
        this.email = data.email;
        this.name = data.name;
        this._role = data.role;
        this.phone = data.phone;
        this.companyName = data.companyName;
        this.imageUrl = data.imageUrl;
        this.isActive = data.isActive;
        this.lastLoginAt = data.lastLoginAt ? new Date(data.lastLoginAt) : undefined;
    }

    // ============================================
    // GETTERS
    // ============================================

    get role(): UserRole {
        return this._role;
    }

    get isAdmin(): boolean {
        return this._role === 'admin';
    }

    get isPlanner(): boolean {
        return this._role === 'planner';
    }

    get isVendor(): boolean {
        return this._role === 'vendor';
    }

    get isClient(): boolean {
        return this._role === 'client';
    }

    get displayName(): string {
        return this.companyName || this.name;
    }

    get initials(): string {
        return this.name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }

    // ============================================
    // BUSINESS METHODS
    // ============================================

    /**
     * Check if user has a specific permission
     */
    hasPermission(permission: string): boolean {
        const rolePermissions: Record<UserRole, string[]> = {
            admin: ['*'],
            planner: ['events:*', 'leads:*', 'proposals:*', 'invoices:*', 'vendors:read'],
            vendor: ['tasks:*', 'availability:*', 'profile:*'],
            client: ['events:read', 'proposals:read', 'invoices:read'],
        };

        const permissions = rolePermissions[this._role];

        if (permissions.includes('*')) return true;
        if (permissions.includes(permission)) return true;

        // Check wildcard permissions (e.g., 'events:*' matches 'events:create')
        const [resource] = permission.split(':');
        return permissions.includes(`${resource}:*`);
    }

    /**
     * Record login
     */
    recordLogin(): void {
        this.lastLoginAt = new Date();
        this.touch();
    }

    /**
     * Deactivate user
     */
    deactivate(): void {
        this.isActive = false;
        this.touch();
    }

    /**
     * Activate user
     */
    activate(): void {
        this.isActive = true;
        this.touch();
    }

    // ============================================
    // SERIALIZATION
    // ============================================

    toJSON(): UserData {
        return {
            id: this.id,
            email: this.email,
            name: this.name,
            role: this._role,
            phone: this.phone,
            companyName: this.companyName,
            imageUrl: this.imageUrl,
            isActive: this.isActive,
            lastLoginAt: this.lastLoginAt?.toISOString(),
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
        };
    }

    static fromDatabase(row: Record<string, unknown>): User {
        return new User({
            id: row.id as string,
            email: row.email as string,
            name: row.name as string || row.email as string,
            role: row.role as UserRole || 'client',
            phone: row.phone as string | undefined,
            companyName: row.company_name as string | undefined,
            imageUrl: row.image_url as string | undefined,
            isActive: row.is_active as boolean ?? true,
            lastLoginAt: row.last_login_at as string | undefined,
            createdAt: row.created_at as string,
            updatedAt: row.updated_at as string,
        });
    }
}
