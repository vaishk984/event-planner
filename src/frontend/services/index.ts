/**
 * Frontend Services Index
 * 
 * Central export for all frontend services.
 */

export { api, ApiError } from './api-client';
export { eventApi, type QueryEventsParams } from './event-api';
export { leadApi } from './lead-api';
export { vendorApi } from './vendor-api';
export { taskApi } from './task-api';
export {
    timelineApi,
    type TimelineItemResponse,
    type CreateTimelineItemInput,
    type UpdateTimelineItemInput,
    type TimelineOverview,
    type TemplateName,
} from './timeline-api';
