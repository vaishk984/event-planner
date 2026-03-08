/**
 * BookingRequest DTOs
 * 
 * Request DTOs for booking operations using Zod validation.
 */

import { z } from 'zod';

// Booking Status
export const BookingStatusEnum = z.enum([
    'draft',
    'quote_requested',
    'quote_received',
    'negotiating',
    'confirmed',
    'deposit_paid',
    'in_progress',
    'completed',
    'cancelled',
    'declined',
]);

// Payment Milestone
export const PaymentMilestoneSchema = z.object({
    name: z.string().min(1).max(100),
    amount: z.number().min(0),
    dueDate: z.string(),
    paidDate: z.string().nullable().default(null),
});

// Create Booking Request
export const CreateBookingRequestSchema = z.object({
    eventId: z.string().uuid(),
    functionId: z.string().uuid().optional(),
    vendorId: z.string().uuid(),
    serviceCategory: z.string().min(1).max(100),
    serviceDetails: z.string().max(2000).optional(),
    notes: z.string().max(2000).optional(),
});

export type CreateBookingRequestDto = z.infer<typeof CreateBookingRequestSchema>;

// Update Booking Request
export const UpdateBookingRequestSchema = z.object({
    serviceDetails: z.string().max(2000).nullable().optional(),
    notes: z.string().max(2000).nullable().optional(),
    internalNotes: z.string().max(2000).nullable().optional(),
});

export type UpdateBookingRequestDto = z.infer<typeof UpdateBookingRequestSchema>;

// Submit Quote (Vendor action)
export const SubmitQuoteSchema = z.object({
    amount: z.number().min(0),
    notes: z.string().max(2000).optional(),
    paymentSchedule: z.array(PaymentMilestoneSchema).optional(),
});

export type SubmitQuoteDto = z.infer<typeof SubmitQuoteSchema>;

// Accept/Negotiate Quote (Planner action)
export const AcceptQuoteSchema = z.object({
    agreedAmount: z.number().min(0).optional(),
    paymentSchedule: z.array(PaymentMilestoneSchema).optional(),
});

export type AcceptQuoteDto = z.infer<typeof AcceptQuoteSchema>;

// Update Booking Status
export const UpdateBookingStatusSchema = z.object({
    status: BookingStatusEnum,
    notes: z.string().max(2000).optional(),
});

export type UpdateBookingStatusDto = z.infer<typeof UpdateBookingStatusSchema>;

// Query Bookings
export const QueryBookingsSchema = z.object({
    eventId: z.string().uuid().optional(),
    vendorId: z.string().uuid().optional(),
    plannerId: z.string().uuid().optional(),
    status: BookingStatusEnum.optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type QueryBookingsDto = z.infer<typeof QueryBookingsSchema>;
