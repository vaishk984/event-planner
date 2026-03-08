/**
 * Message DTOs
 * 
 * Request DTOs for message/communication operations using Zod validation.
 */

import { z } from 'zod';

export const MessageTypeEnum = z.enum(['text', 'file', 'quote', 'status_update']);

// Attachment Schema
export const AttachmentSchema = z.object({
    name: z.string().max(200),
    url: z.string().url(),
    type: z.string().max(100),
    size: z.number().int().min(0),
});

// Send Message
export const SendMessageSchema = z.object({
    bookingRequestId: z.string().uuid(),
    type: MessageTypeEnum.default('text'),
    content: z.string().min(1).max(5000),
    attachments: z.array(AttachmentSchema).default([]),
});

export type SendMessageDto = z.infer<typeof SendMessageSchema>;

// Query Messages
export const QueryMessagesSchema = z.object({
    bookingRequestId: z.string().uuid(),
    unreadOnly: z.coerce.boolean().default(false),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type QueryMessagesDto = z.infer<typeof QueryMessagesSchema>;

// Mark as Read
export const MarkMessagesReadSchema = z.object({
    messageIds: z.array(z.string().uuid()),
});

export type MarkMessagesReadDto = z.infer<typeof MarkMessagesReadSchema>;
