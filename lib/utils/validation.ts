import { z } from 'zod'

// Email validation
export const emailSchema = z.string().email('Invalid email address')

// Phone validation
export const phoneSchema = z
    .string()
    .regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number')
    .min(10, 'Phone number must be at least 10 digits')
    .optional()

// Lead validation
export const createLeadSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: emailSchema,
    phone: phoneSchema,
    event_type: z.string().min(1, 'Event type is required'),
    budget_range: z.string().optional(),
    event_date: z.string().optional(),
    source: z.enum(['website', 'referral', 'social_media', 'event', 'other']),
})

// Event validation
export const createEventSchema = z.object({
    type: z.enum(['wedding', 'birthday', 'corporate', 'anniversary', 'other']),
    date: z.string().min(1, 'Event date is required'),
    guest_count: z.number().min(1, 'Guest count must be at least 1').optional(),
    budget: z.number().min(0, 'Budget must be positive').optional(),
})

// Login validation
export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

// Signup validation
export const signupSchema = z.object({
    email: emailSchema,
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    role: z.enum(['planner', 'client', 'vendor']),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
})
