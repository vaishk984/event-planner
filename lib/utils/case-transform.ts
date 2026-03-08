/**
 * Case Transformation Utilities
 * 
 * Converts between camelCase (TypeScript) and snake_case (Supabase/PostgreSQL).
 */

/**
 * Convert camelCase to snake_case
 */
export function toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

/**
 * Convert snake_case to camelCase
 */
export function toCamelCase(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * Convert object keys from camelCase to snake_case (for sending to DB)
 */
export function toSnakeCaseKeys<T extends Record<string, any>>(obj: T): Record<string, any> {
    if (!obj || typeof obj !== 'object') return obj
    if (Array.isArray(obj)) return obj.map(item => toSnakeCaseKeys(item)) as any

    return Object.entries(obj).reduce((acc, [key, value]) => {
        const snakeKey = toSnakeCase(key)
        acc[snakeKey] = value && typeof value === 'object' && !Array.isArray(value)
            ? toSnakeCaseKeys(value)
            : value
        return acc
    }, {} as Record<string, any>)
}

/**
 * Convert object keys from snake_case to camelCase (for receiving from DB)
 */
export function toCamelCaseKeys<T extends Record<string, any>>(obj: T): Record<string, any> {
    if (!obj || typeof obj !== 'object') return obj
    if (Array.isArray(obj)) return obj.map(item => toCamelCaseKeys(item)) as any

    return Object.entries(obj).reduce((acc, [key, value]) => {
        const camelKey = toCamelCase(key)
        acc[camelKey] = value && typeof value === 'object' && !Array.isArray(value)
            ? toCamelCaseKeys(value)
            : value
        return acc
    }, {} as Record<string, any>)
}

/**
 * Event field mappings (TypeScript -> Database)
 */
export const EVENT_FIELD_MAP: Record<string, string> = {
    plannerId: 'planner_id',
    clientId: 'client_id',
    submissionId: 'submission_id',
    endDate: 'end_date',
    isDateFlexible: 'is_date_flexible',
    venueType: 'venue_type',
    venueName: 'venue_name',
    venueAddress: 'venue_address',
    guestCount: 'guest_count',
    budgetMin: 'budget_min',
    budgetMax: 'budget_max',
    clientName: 'client_name',
    clientPhone: 'client_phone',
    clientEmail: 'client_email',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    // Event date might be stored as event_date in some schemas
    date: 'event_date',
}

/**
 * Reverse mapping (Database -> TypeScript)
 */
export const EVENT_FIELD_MAP_REVERSE: Record<string, string> = Object.entries(EVENT_FIELD_MAP)
    .reduce((acc, [key, value]) => {
        acc[value] = key
        return acc
    }, {} as Record<string, string>)

/**
 * Transform event from DB format to TypeScript format
 */
export function fromDbEvent<T>(dbEvent: Record<string, any>): T {
    if (!dbEvent) return dbEvent as T

    const transformed: Record<string, any> = {}

    for (const [key, value] of Object.entries(dbEvent)) {
        const tsKey = EVENT_FIELD_MAP_REVERSE[key] || toCamelCase(key)
        transformed[tsKey] = value
    }

    return transformed as T
}

/**
 * Transform event array from DB format to TypeScript format
 */
export function fromDbEvents<T>(dbEvents: Record<string, any>[]): T[] {
    if (!dbEvents) return []
    return dbEvents.map(event => fromDbEvent<T>(event))
}

/**
 * Transform event from TypeScript format to DB format
 */
export function toDbEvent(tsEvent: Record<string, any>): Record<string, any> {
    if (!tsEvent) return tsEvent

    const transformed: Record<string, any> = {}

    for (const [key, value] of Object.entries(tsEvent)) {
        const dbKey = EVENT_FIELD_MAP[key] || toSnakeCase(key)
        transformed[dbKey] = value
    }

    return transformed
}
