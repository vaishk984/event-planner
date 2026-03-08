/**
 * Common Response DTOs
 * 
 * Shared response structures used across the API.
 */

// ============================================
// PAGINATED RESPONSE
// ============================================

export interface PaginatedResponseDto<T> {
    items: T[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export function createPaginatedResponse<T>(
    items: T[],
    page: number,
    limit: number,
    total: number
): PaginatedResponseDto<T> {
    const totalPages = Math.ceil(total / limit);
    return {
        items,
        meta: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        },
    };
}

// ============================================
// SUCCESS RESPONSE
// ============================================

export interface SuccessResponseDto<T = void> {
    success: true;
    message?: string;
    data?: T;
}

export function createSuccessResponse<T>(
    data?: T,
    message?: string
): SuccessResponseDto<T> {
    return { success: true, data, message };
}

// ============================================
// DELETE RESPONSE
// ============================================

export interface DeleteResponseDto {
    success: true;
    deleted: boolean;
    id: string;
}

// ============================================
// BULK OPERATION RESPONSE
// ============================================

export interface BulkOperationResponseDto {
    success: true;
    processed: number;
    failed: number;
    errors?: Array<{ index: number; error: string }>;
}
