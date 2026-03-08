/**
 * MessageRepository
 * 
 * Data access for Message entities.
 */

import { BaseRepository } from './BaseRepository';
import { Message, MessageRow } from '../entities';

export class MessageRepository extends BaseRepository<Message, MessageRow> {
    protected tableName = 'booking_messages';
    protected entityName = 'Message';

    protected toEntity(row: MessageRow): Message {
        return Message.fromRow(row);
    }

    protected toRow(entity: Partial<Message>): Partial<MessageRow> {
        if (entity instanceof Message) {
            return entity.toRow();
        }
        return entity as unknown as Partial<MessageRow>;
    }

    /**
     * Get messages for booking
     */
    async getByBookingRequest(bookingRequestId: string, limit: number = 50): Promise<Message[]> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('booking_request_id', bookingRequestId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return (data || []).map(row => this.toEntity(row as MessageRow));
    }

    /**
     * Get unread messages
     */
    async getUnread(bookingRequestId: string, senderType: 'planner' | 'vendor'): Promise<Message[]> {
        const otherType = senderType === 'planner' ? 'vendor' : 'planner';

        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('booking_request_id', bookingRequestId)
            .eq('sender_type', otherType)
            .eq('is_read', false)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(row => this.toEntity(row as MessageRow));
    }

    /**
     * Mark as read
     */
    async markAsRead(messageIds: string[]): Promise<void> {
        const { error } = await this.supabase
            .from(this.tableName)
            .update({ is_read: true, read_at: new Date().toISOString() })
            .in('id', messageIds);

        if (error) throw error;
    }

    /**
     * Get unread count
     */
    async getUnreadCount(bookingRequestId: string, forSenderType: 'planner' | 'vendor'): Promise<number> {
        const otherType = forSenderType === 'planner' ? 'vendor' : 'planner';

        const { count, error } = await this.supabase
            .from(this.tableName)
            .select('*', { count: 'exact', head: true })
            .eq('booking_request_id', bookingRequestId)
            .eq('sender_type', otherType)
            .eq('is_read', false);

        if (error) throw error;
        return count || 0;
    }

    /**
     * Get latest message
     */
    async getLatest(bookingRequestId: string): Promise<Message | null> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('booking_request_id', bookingRequestId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data ? this.toEntity(data as MessageRow) : null;
    }
}
