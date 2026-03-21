/**
 * Authentication Middleware
 * 
 * Handles JWT verification and user authentication.
 * Similar to Spring Security's AuthenticationFilter.
 */

import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { UnauthorizedException, ForbiddenException } from '../exceptions';
import { AuthConfig, DatabaseConfig } from '../config';
import { User, UserRole } from '../entities';
import { createLogger } from '../utils';

const logger = createLogger('AuthMiddleware');
const SUPABASE_AUTH_COOKIE_PREFIX = 'sb-';
const SUPABASE_AUTH_COOKIE_SUFFIX = '-auth-token';
const SUPABASE_BASE64_PREFIX = 'base64-';

export interface AuthenticatedUser {
    id: string;
    email: string;
    role: UserRole;
    name?: string;
}

export interface AuthContext {
    user: AuthenticatedUser;
    isAuthenticated: true;
}

interface CookieLike {
    name: string;
    value: string;
}

function isSupabaseAuthCookieName(name: string): boolean {
    return name.startsWith(SUPABASE_AUTH_COOKIE_PREFIX)
        && name.includes(SUPABASE_AUTH_COOKIE_SUFFIX)
        && !name.includes(`${SUPABASE_AUTH_COOKIE_SUFFIX}-`);
}

function getSupabaseAuthCookieBaseName(name: string): string {
    const chunkSeparatorIndex = name.lastIndexOf('.');

    if (chunkSeparatorIndex === -1) {
        return name;
    }

    const chunkIndex = name.slice(chunkSeparatorIndex + 1);
    return /^\d+$/.test(chunkIndex) ? name.slice(0, chunkSeparatorIndex) : name;
}

function decodeBase64Url(value: string): string | null {
    try {
        let normalized = value.replace(/-/g, '+').replace(/_/g, '/');
        const remainder = normalized.length % 4;

        if (remainder > 0) {
            normalized += '='.repeat(4 - remainder);
        }

        return Buffer.from(normalized, 'base64').toString('utf8');
    } catch {
        return null;
    }
}

function decodeSupabaseCookieValue(value: string): string | null {
    if (!value) {
        return null;
    }

    if (!value.startsWith(SUPABASE_BASE64_PREFIX)) {
        return value;
    }

    return decodeBase64Url(value.slice(SUPABASE_BASE64_PREFIX.length));
}

export function extractSupabaseAccessTokenFromCookies(cookies: ReadonlyArray<CookieLike>): string | undefined {
    const groupedCookies = new Map<string, Array<{ index: number; value: string }>>();

    for (const cookie of cookies) {
        if (!isSupabaseAuthCookieName(cookie.name)) {
            continue;
        }

        const baseName = getSupabaseAuthCookieBaseName(cookie.name);
        const chunkSeparatorIndex = cookie.name.lastIndexOf('.');
        const chunkIndex = chunkSeparatorIndex >= 0 && baseName !== cookie.name
            ? Number(cookie.name.slice(chunkSeparatorIndex + 1))
            : -1;
        const existing = groupedCookies.get(baseName) || [];

        existing.push({
            index: Number.isFinite(chunkIndex) ? chunkIndex : -1,
            value: cookie.value,
        });
        groupedCookies.set(baseName, existing);
    }

    for (const chunks of groupedCookies.values()) {
        const combinedValue = chunks
            .sort((left, right) => left.index - right.index)
            .map((chunk) => chunk.value)
            .join('');
        const decodedValue = decodeSupabaseCookieValue(combinedValue);

        if (!decodedValue) {
            continue;
        }

        try {
            const parsed = JSON.parse(decodedValue) as
                | { access_token?: string; session?: { access_token?: string } }
                | [string?, string?];

            if (typeof parsed === 'object' && parsed !== null) {
                if ('access_token' in parsed && typeof parsed.access_token === 'string') {
                    return parsed.access_token;
                }

                if ('session' in parsed && typeof parsed.session?.access_token === 'string') {
                    return parsed.session.access_token;
                }
            }

            if (Array.isArray(parsed) && typeof parsed[0] === 'string') {
                return parsed[0];
            }
        } catch {
            // Ignore malformed cookies and continue searching.
        }
    }

    return undefined;
}

/**
 * Extract and validate authentication from request
 */
export async function authenticate(request: NextRequest): Promise<AuthContext> {
    // Try to get token from Authorization header
    const authHeader = request.headers.get('Authorization');
    const cookieToken = extractSupabaseAccessTokenFromCookies(request.cookies.getAll());

    const token = authHeader?.replace('Bearer ', '') || cookieToken;

    if (!token) {
        logger.debug('No authentication token found');
        throw new UnauthorizedException('Authentication token is required');
    }

    try {
        // Verify with Supabase
        const supabase = createClient(
            DatabaseConfig.supabase.url,
            DatabaseConfig.supabase.anonKey
        );

        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            logger.warn('Invalid authentication token', { error: error?.message });
            throw new UnauthorizedException('Invalid or expired token');
        }

        // Get user role from metadata or profile
        const role = (user.user_metadata?.role || 'client') as UserRole;

        return {
            user: {
                id: user.id,
                email: user.email!,
                role,
                name: user.user_metadata?.name,
            },
            isAuthenticated: true,
        };
    } catch (error) {
        if (error instanceof UnauthorizedException) {
            throw error;
        }
        logger.error('Authentication error', error);
        throw new UnauthorizedException('Authentication failed');
    }
}

/**
 * Check if user has required role
 */
export function requireRole(user: AuthenticatedUser, ...allowedRoles: UserRole[]): void {
    if (!allowedRoles.includes(user.role)) {
        logger.warn('Access denied - insufficient role', {
            userRole: user.role,
            requiredRoles: allowedRoles
        });
        throw new ForbiddenException('access this resource');
    }
}

/**
 * Check if user has required permission
 */
export function requirePermission(user: AuthenticatedUser, permission: string): void {
    const userEntity = new User({
        id: user.id,
        email: user.email,
        name: user.name || user.email,
        role: user.role,
        isActive: true,
    });

    if (!userEntity.hasPermission(permission)) {
        logger.warn('Access denied - insufficient permission', {
            userId: user.id,
            requiredPermission: permission
        });
        throw new ForbiddenException(permission.replace(':', ' '));
    }
}

/**
 * Optional authentication - returns null if not authenticated
 */
export async function optionalAuthenticate(request: NextRequest): Promise<AuthContext | null> {
    try {
        return await authenticate(request);
    } catch {
        return null;
    }
}

/**
 * Wrapper for protected route handlers
 */
export function withAuth<TResult>(
    handler: (
        request: NextRequest,
        context: { params: Record<string, string>; auth: AuthContext }
    ) => Promise<TResult>,
    options: { roles?: UserRole[]; permission?: string } = {}
) {
    return async (
        request: NextRequest,
        context: { params: Record<string, string> }
    ): Promise<TResult> => {
        const auth = await authenticate(request);

        if (options.roles) {
            requireRole(auth.user, ...options.roles);
        }

        if (options.permission) {
            requirePermission(auth.user, options.permission);
        }

        return handler(request, { ...context, auth });
    };
}
