/**
 * Services Index
 * 
 * Central export for all service classes.
 */

export { EventService, eventService } from './EventService';
export { LeadService, leadService, type LeadResponseDto } from './LeadService';
export { VendorService, vendorService, type VendorResponseDto } from './VendorService';
export { TaskService, taskService, type TaskResponseDto } from './TaskService';
export { TimelineService, timelineService } from './TimelineService';

// New services
export { FunctionService, functionService } from './FunctionService';
export { BookingService, bookingService } from './BookingService';
export { BudgetService, budgetService, type BudgetSummary } from './BudgetService';
export { PaymentService, paymentService } from './PaymentService';
export { MessageService, messageService } from './MessageService';
export { ClientService, clientService } from './ClientService';

