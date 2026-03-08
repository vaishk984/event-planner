/**
 * Repositories Index
 * 
 * Central export for all repository classes.
 */

export { BaseRepository, type FindOptions, type FindResult } from './BaseRepository';
export { EventRepository, eventRepository } from './EventRepository';
export { LeadRepository, leadRepository } from './LeadRepository';
export { VendorRepository, vendorRepository, type VendorSearchCriteria } from './VendorRepository';
export { TaskRepository, taskRepository } from './TaskRepository';
export { TimelineRepository, timelineRepository } from './TimelineRepository';

// New repositories
export { FunctionRepository } from './FunctionRepository';
export { BookingRepository } from './BookingRepository';
export { BudgetRepository } from './BudgetRepository';
export { PaymentRepository } from './PaymentRepository';
export { MessageRepository } from './MessageRepository';
export { ClientRepository } from './ClientRepository';

// Singleton instances
import { FunctionRepository } from './FunctionRepository';
import { BookingRepository } from './BookingRepository';
import { BudgetRepository } from './BudgetRepository';
import { PaymentRepository } from './PaymentRepository';
import { MessageRepository } from './MessageRepository';
import { ClientRepository } from './ClientRepository';

export const functionRepository = new FunctionRepository();
export const bookingRepository = new BookingRepository();
export const budgetRepository = new BudgetRepository();
export const paymentRepository = new PaymentRepository();
export const messageRepository = new MessageRepository();
export const clientRepository = new ClientRepository();

