/**
 * Input validation and sanitization utilities.
 * Protects against XSS, SQL injection, and malformed input.
 */

/**
 * Sanitize a string by removing HTML tags and trimming whitespace.
 * Prevents XSS when user input is rendered in the UI.
 */
export function sanitizeString(input: unknown): string {
    if (typeof input !== 'string') return ''
    return input
        .replace(/<[^>]*>/g, '')     // Strip HTML tags
        .replace(/[<>'"]/g, '')       // Remove dangerous characters
        .trim()
}

/**
 * Sanitize an email address — lowercase, trim, basic format validation.
 */
export function sanitizeEmail(input: unknown): string | null {
    if (typeof input !== 'string') return null
    const email = input.toLowerCase().trim()
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email) ? email : null
}

/**
 * Sanitize a phone number — keep only digits, +, spaces, hyphens.
 */
export function sanitizePhone(input: unknown): string {
    if (typeof input !== 'string') return ''
    return input.replace(/[^\d+\-\s()]/g, '').trim()
}

/**
 * Validate and sanitize a UUID string.
 */
export function isValidUUID(input: unknown): input is string {
    if (typeof input !== 'string') return false
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return uuidRegex.test(input)
}

/**
 * Sanitize a number — returns the number or a default value.
 */
export function sanitizeNumber(input: unknown, defaultValue: number = 0, min?: number, max?: number): number {
    const num = typeof input === 'number' ? input : Number(input)
    if (isNaN(num)) return defaultValue
    if (min !== undefined && num < min) return min
    if (max !== undefined && num > max) return max
    return num
}

/**
 * Validate that a value is one of the allowed options.
 */
export function isOneOf<T extends string>(value: unknown, options: readonly T[]): value is T {
    return typeof value === 'string' && options.includes(value as T)
}

/**
 * Sanitize an object by applying sanitizeString to all string values.
 * Useful for sanitizing form data before storing.
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
    const result = { ...obj }
    for (const key in result) {
        const value = result[key]
        if (typeof value === 'string') {
            (result as Record<string, unknown>)[key] = sanitizeString(value)
        }
    }
    return result
}

/**
 * Validate required fields are present and non-empty.
 * Returns an array of missing field names.
 */
export function validateRequired(
    data: Record<string, unknown>,
    requiredFields: string[]
): string[] {
    return requiredFields.filter(field => {
        const value = data[field]
        if (value === undefined || value === null) return true
        if (typeof value === 'string' && value.trim() === '') return true
        return false
    })
}

/**
 * Truncate a string to a maximum length to prevent oversized inputs.
 */
export function truncate(input: string, maxLength: number): string {
    if (input.length <= maxLength) return input
    return input.slice(0, maxLength)
}
