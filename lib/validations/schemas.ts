// Form Validation Schemas using Zod
// Industry-standard validation for all forms

import { z } from 'zod'

// ============================================
// AUTH SCHEMAS
// ============================================

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address'),
    password: z
        .string()
        .min(1, 'Password is required')
        .min(8, 'Password must be at least 8 characters'),
})

export const signupSchema = z.object({
    name: z
        .string()
        .min(1, 'Name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be less than 100 characters'),
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address'),
    password: z
        .string()
        .min(1, 'Password is required')
        .min(8, 'Password must be at least 8 characters')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    role: z.enum(['planner', 'vendor'], {
        message: 'Please select a role',
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
})

export const forgotPasswordSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address'),
})

export const resetPasswordSchema = z.object({
    password: z
        .string()
        .min(1, 'Password is required')
        .min(8, 'Password must be at least 8 characters')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
})

// ============================================
// EVENT SCHEMAS
// ============================================

export const eventSchema = z.object({
    name: z
        .string()
        .min(1, 'Event name is required')
        .max(200, 'Event name must be less than 200 characters'),
    type: z.enum(['wedding', 'corporate', 'social', 'birthday', 'conference', 'other'], {
        message: 'Please select an event type',
    }),
    date: z.string().min(1, 'Event date is required'),
    venue: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    guestCount: z
        .number()
        .min(1, 'Guest count must be at least 1')
        .max(100000, 'Guest count seems too high'),
    budget: z
        .number()
        .min(0, 'Budget cannot be negative')
        .optional(),
    description: z.string().max(5000, 'Description is too long').optional(),
})

export const intakeSchema = z.object({
    clientName: z.string().min(1, 'Client name is required'),
    clientEmail: z.string().email('Invalid email address'),
    clientPhone: z.string().min(10, 'Phone number must be at least 10 digits'),
    eventType: z.string().min(1, 'Event type is required'),
    eventDate: z.string().min(1, 'Event date is required'),
    guestCount: z.number().min(1, 'Guest count is required'),
    budget: z.number().optional(),
    notes: z.string().optional(),
})

// ============================================
// VENDOR SCHEMAS
// ============================================

export const vendorProfileSchema = z.object({
    businessName: z
        .string()
        .min(1, 'Business name is required')
        .max(200, 'Business name is too long'),
    category: z.string().min(1, 'Category is required'),
    description: z.string().max(2000, 'Description is too long').optional(),
    city: z.string().min(1, 'City is required'),
    phone: z.string().min(10, 'Please enter a valid phone number'),
    email: z.string().email('Please enter a valid email'),
    priceRange: z.object({
        min: z.number().min(0, 'Minimum price cannot be negative'),
        max: z.number().min(0, 'Maximum price cannot be negative'),
    }).refine((data) => data.max >= data.min, {
        message: 'Maximum price must be greater than minimum',
        path: ['max'],
    }),
})

export const bookingRequestSchema = z.object({
    eventId: z.string().min(1, 'Event ID is required'),
    vendorId: z.string().min(1, 'Vendor ID is required'),
    service: z.string().min(1, 'Service type is required'),
    date: z.string().min(1, 'Date is required'),
    budget: z.number().min(0, 'Budget cannot be negative'),
    notes: z.string().optional(),
})

// ============================================
// CLIENT SCHEMAS
// ============================================

export const clientSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone must be at least 10 digits'),
    company: z.string().optional(),
    address: z.string().optional(),
    notes: z.string().optional(),
})

// ============================================
// TYPE EXPORTS
// ============================================

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type EventInput = z.infer<typeof eventSchema>
export type IntakeInput = z.infer<typeof intakeSchema>
export type VendorProfileInput = z.infer<typeof vendorProfileSchema>
export type BookingRequestInput = z.infer<typeof bookingRequestSchema>
export type ClientInput = z.infer<typeof clientSchema>
