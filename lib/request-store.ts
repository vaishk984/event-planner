/**
 * Server-side request store using AsyncLocalStorage.
 * The dashboard layout sets the userId once after a successful getSession() call.
 * Child Server Components (Leads, Tasks, Events pages) call getRequestUserId()
 * which reads from the same in-request store — no additional Supabase auth calls needed.
 *
 * This solves the Vercel serverless issue where React's cache() doesn't deduplicate
 * across the layout-to-page streaming boundary, causing independent getSession() calls
 * in each page segment to fail with "Auth session missing!".
 */

import { AsyncLocalStorage } from 'async_hooks'

interface RequestStore {
    userId: string | null
    role: string | null
}

const requestStorage = new AsyncLocalStorage<RequestStore>()

/**
 * Run a callback with the given user context accessible to all code within it.
 * Called by the dashboard layout after a successful getSession().
 */
export function runWithRequestStore<T>(userId: string | null, role: string | null, fn: () => T): T {
    return requestStorage.run({ userId, role }, fn)
}

/**
 * Get the userId from the current request context.
 * Returns null if called outside of a runWithRequestStore context.
 */
export function getRequestUserId(): string | null {
    return requestStorage.getStore()?.userId ?? null
}

/**
 * Get the role from the current request context.
 */
export function getRequestRole(): string | null {
    return requestStorage.getStore()?.role ?? null
}
