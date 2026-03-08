/**
 * Shared Types
 * 
 * Types shared between frontend and backend.
 */

// Re-export commonly used types from backend
export type {
    EventType,
    EventStatus,
    VenueType,
    EventData
} from '@/src/backend/entities/Event';

export type {
    LeadStatus,
    LeadSource,
    LeadData
} from '@/src/backend/entities/Lead';

export type {
    VendorCategory,
    VendorData
} from '@/src/backend/entities/Vendor';

export type {
    TaskStatus,
    TaskPriority,
    TaskData
} from '@/src/backend/entities/Task';

export type {
    UserRole,
    UserData
} from '@/src/backend/entities/User';

// API Response types
export type { ApiResponseData as ApiResponse } from '@/src/backend/utils/response';
export type { PaginatedResponseDto } from '@/src/backend/dto/response/common.response';
