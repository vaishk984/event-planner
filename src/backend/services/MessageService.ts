/**
 * MessageService
 * 
 * Business logic for planner-vendor communication.
 */

import { Message, SenderType, MessageType, Attachment } from '../entities';
import { MessageRepository } from '../repositories';
import { SendMessageDto } from '../dto/request';
import { NotFoundException } from '../exceptions';

type UserSenderType = 'planner' | 'vendor';

export class MessageService {
    private repository: MessageRepository;

    constructor(repository?: MessageRepository) {
        this.repository = repository || new MessageRepository();
    }

    /**
     * Get message by ID
     */
    async getById(id: string): Promise<Message> {
        const message = await this.repository.findById(id);
        if (!message) throw new NotFoundException('Message', id);
        return message;
    }

    /**
     * Get messages for booking request
     */
    async getByBookingRequest(bookingRequestId: string, limit: number = 50): Promise<Message[]> {
        return this.repository.getByBookingRequest(bookingRequestId, limit);
    }

    /**
     * Send a message
     */
    async send(dto: SendMessageDto, senderId: string, senderType: SenderType): Promise<Message> {
        const message = new Message({
            id: crypto.randomUUID(),
            bookingRequestId: dto.bookingRequestId,
            senderType,
            senderId,
            type: (dto.type || 'text') as MessageType,
            content: dto.content,
            attachments: dto.attachments as Attachment[] || [],
            isRead: false,
            readAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return this.repository.create(message);
    }

    /**
     * Get unread messages
     */
    async getUnread(bookingRequestId: string, forSenderType: UserSenderType): Promise<Message[]> {
        return this.repository.getUnread(bookingRequestId, forSenderType);
    }

    /**
     * Mark messages as read
     */
    async markAsRead(messageIds: string[]): Promise<void> {
        await this.repository.markAsRead(messageIds);
    }

    /**
     * Mark all messages in booking as read
     */
    async markAllAsRead(bookingRequestId: string, forSenderType: UserSenderType): Promise<void> {
        const unread = await this.getUnread(bookingRequestId, forSenderType);
        const ids = unread.map(m => m.id);
        if (ids.length > 0) {
            await this.markAsRead(ids);
        }
    }

    /**
     * Get unread count
     */
    async getUnreadCount(bookingRequestId: string, forSenderType: UserSenderType): Promise<number> {
        return this.repository.getUnreadCount(bookingRequestId, forSenderType);
    }

    /**
     * Get latest message
     */
    async getLatest(bookingRequestId: string): Promise<Message | null> {
        return this.repository.getLatest(bookingRequestId);
    }
}

// Singleton instance
export const messageService = new MessageService();
