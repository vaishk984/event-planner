/**
 * Request DTOs Index
 * 
 * Central export for all request DTOs.
 */

// Event DTOs
export {
    CreateEventSchema,
    UpdateEventSchema,
    UpdateEventStatusSchema,
    QueryEventsSchema,
    type CreateEventDto,
    type UpdateEventDto,
    type UpdateEventStatusDto,
    type QueryEventsDto,
} from './event.dto';

// Lead DTOs
export {
    CreateLeadSchema,
    UpdateLeadSchema,
    UpdateLeadStatusSchema,
    QueryLeadsSchema,
    ImportLeadsSchema,
    type CreateLeadDto,
    type UpdateLeadDto,
    type UpdateLeadStatusDto,
    type QueryLeadsDto,
    type ImportLeadsDto,
} from './lead.dto';

// Task DTOs
export {
    CreateTaskSchema,
    UpdateTaskSchema,
    UpdateTaskStatusSchema,
    CompleteTaskSchema,
    QueryTasksSchema,
    type CreateTaskDto,
    type UpdateTaskDto,
    type UpdateTaskStatusDto,
    type CompleteTaskDto,
    type QueryTasksDto,
} from './task.dto';

// Vendor DTOs
export {
    CreateVendorSchema,
    UpdateVendorSchema,
    QueryVendorsSchema,
    UpdateAvailabilitySchema,
    type CreateVendorDto,
    type UpdateVendorDto,
    type QueryVendorsDto,
    type UpdateAvailabilityDto,
} from './vendor.dto';

// Timeline DTOs
export {
    CreateTimelineItemSchema,
    UpdateTimelineItemSchema,
    UpdateTimelineStatusSchema,
    ReorderTimelineSchema,
    QueryTimelineSchema,
    ApplyTemplateSchema,
    type CreateTimelineItemDto,
    type UpdateTimelineItemDto,
    type UpdateTimelineStatusDto,
    type ReorderTimelineDto,
    type QueryTimelineDto,
    type ApplyTemplateDto,
} from './timeline.dto';

// Function DTOs
export {
    CreateFunctionSchema,
    UpdateFunctionSchema,
    QueryFunctionsSchema,
    ReorderFunctionsSchema,
    FunctionTypeEnum,
    type CreateFunctionDto,
    type UpdateFunctionDto,
    type QueryFunctionsDto,
    type ReorderFunctionsDto,
} from './function.dto';

// Booking DTOs
export {
    CreateBookingRequestSchema,
    UpdateBookingRequestSchema,
    SubmitQuoteSchema,
    AcceptQuoteSchema,
    UpdateBookingStatusSchema,
    QueryBookingsSchema,
    BookingStatusEnum,
    type CreateBookingRequestDto,
    type UpdateBookingRequestDto,
    type SubmitQuoteDto,
    type AcceptQuoteDto,
    type UpdateBookingStatusDto,
    type QueryBookingsDto,
} from './booking.dto';

// Budget DTOs
export {
    CreateBudgetItemSchema,
    UpdateBudgetItemSchema,
    AddBudgetPaymentSchema,
    QueryBudgetItemsSchema,
    GetBudgetSummarySchema,
    BudgetCategoryEnum,
    type CreateBudgetItemDto,
    type UpdateBudgetItemDto,
    type AddBudgetPaymentDto,
    type QueryBudgetItemsDto,
    type GetBudgetSummaryDto,
} from './budget.dto';

// Payment DTOs
export {
    CreatePaymentSchema,
    UpdatePaymentSchema,
    CompletePaymentSchema,
    QueryPaymentsSchema,
    PaymentTypeEnum,
    PaymentStatusEnum,
    PaymentMethodEnum,
    type CreatePaymentDto,
    type UpdatePaymentDto,
    type CompletePaymentDto,
    type QueryPaymentsDto,
} from './payment.dto';

// Message DTOs
export {
    SendMessageSchema,
    QueryMessagesSchema,
    MarkMessagesReadSchema,
    MessageTypeEnum,
    type SendMessageDto,
    type QueryMessagesDto,
    type MarkMessagesReadDto,
} from './message.dto';

// Client DTOs
export {
    CreateClientSchema,
    UpdateClientSchema,
    QueryClientsSchema,
    ClientStatusEnum,
    ClientPreferencesSchema,
    type CreateClientDto,
    type UpdateClientDto,
    type QueryClientsDto,
} from './client.dto';

