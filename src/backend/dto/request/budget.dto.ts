/**
 * BudgetItem DTOs
 * 
 * Request DTOs for budget operations using Zod validation.
 */

import { z } from 'zod';

// Budget Categories
export const BudgetCategoryEnum = z.enum([
    'venue',
    'catering',
    'decoration',
    'photography',
    'entertainment',
    'attire',
    'makeup',
    'transport',
    'invitations',
    'gifts',
    'miscellaneous',
]);

// Create Budget Item
export const CreateBudgetItemSchema = z.object({
    eventId: z.string().uuid(),
    functionId: z.string().uuid().optional(),
    category: BudgetCategoryEnum,
    description: z.string().min(1).max(200),
    vendorId: z.string().uuid().optional(),
    bookingRequestId: z.string().uuid().optional(),
    estimatedAmount: z.number().min(0),
    actualAmount: z.number().min(0).optional(),
    currency: z.string().length(3).default('INR'),
    notes: z.string().max(1000).optional(),
});

export type CreateBudgetItemDto = z.infer<typeof CreateBudgetItemSchema>;

// Update Budget Item
export const UpdateBudgetItemSchema = z.object({
    description: z.string().min(1).max(200).optional(),
    estimatedAmount: z.number().min(0).optional(),
    actualAmount: z.number().min(0).nullable().optional(),
    paidAmount: z.number().min(0).optional(),
    vendorId: z.string().uuid().nullable().optional(),
    bookingRequestId: z.string().uuid().nullable().optional(),
    notes: z.string().max(1000).nullable().optional(),
});

export type UpdateBudgetItemDto = z.infer<typeof UpdateBudgetItemSchema>;

// Add Payment to Budget Item
export const AddBudgetPaymentSchema = z.object({
    amount: z.number().min(0),
    notes: z.string().max(500).optional(),
});

export type AddBudgetPaymentDto = z.infer<typeof AddBudgetPaymentSchema>;

// Query Budget Items
export const QueryBudgetItemsSchema = z.object({
    eventId: z.string().uuid().optional(),
    functionId: z.string().uuid().optional(),
    category: BudgetCategoryEnum.optional(),
    overBudgetOnly: z.coerce.boolean().default(false),
});

export type QueryBudgetItemsDto = z.infer<typeof QueryBudgetItemsSchema>;

// Budget Summary Request
export const GetBudgetSummarySchema = z.object({
    eventId: z.string().uuid(),
    byFunction: z.coerce.boolean().default(false),
});

export type GetBudgetSummaryDto = z.infer<typeof GetBudgetSummarySchema>;
