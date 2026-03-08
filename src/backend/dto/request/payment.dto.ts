/**
 * Payment DTOs
 * 
 * Request DTOs for payment operations using Zod validation.
 */

import { z } from 'zod';

// Payment Types
export const PaymentTypeEnum = z.enum([
    'client_payment',
    'vendor_payment',
    'refund',
    'expense',
]);

export const PaymentStatusEnum = z.enum([
    'pending',
    'processing',
    'completed',
    'failed',
    'cancelled',
]);

export const PaymentMethodEnum = z.enum([
    'bank_transfer',
    'cash',
    'cheque',
    'upi',
    'card',
    'other',
]);

// Create Payment
export const CreatePaymentSchema = z.object({
    eventId: z.string().uuid(),
    bookingRequestId: z.string().uuid().optional(),
    budgetItemId: z.string().uuid().optional(),
    type: PaymentTypeEnum,
    method: PaymentMethodEnum,
    amount: z.number().min(0),
    currency: z.string().length(3).default('INR'),
    paidBy: z.string().max(100).optional(),
    paidTo: z.string().max(100).optional(),
    dueDate: z.string().optional(),
    description: z.string().max(500).optional(),
    notes: z.string().max(1000).optional(),
});

export type CreatePaymentDto = z.infer<typeof CreatePaymentSchema>;

// Update Payment
export const UpdatePaymentSchema = z.object({
    method: PaymentMethodEnum.optional(),
    dueDate: z.string().nullable().optional(),
    reference: z.string().max(100).nullable().optional(),
    receiptUrl: z.string().url().nullable().optional(),
    notes: z.string().max(1000).nullable().optional(),
});

export type UpdatePaymentDto = z.infer<typeof UpdatePaymentSchema>;

// Complete Payment
export const CompletePaymentSchema = z.object({
    reference: z.string().max(100).optional(),
    receiptUrl: z.string().url().optional(),
    notes: z.string().max(500).optional(),
});

export type CompletePaymentDto = z.infer<typeof CompletePaymentSchema>;

// Query Payments
export const QueryPaymentsSchema = z.object({
    eventId: z.string().uuid().optional(),
    bookingRequestId: z.string().uuid().optional(),
    type: PaymentTypeEnum.optional(),
    status: PaymentStatusEnum.optional(),
    overdueOnly: z.coerce.boolean().default(false),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type QueryPaymentsDto = z.infer<typeof QueryPaymentsSchema>;
