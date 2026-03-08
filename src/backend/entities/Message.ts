/**
 * Message Entity
 * 
 * Communication thread messages between planners and vendors
 */

import { BaseEntity, BaseEntityData } from './BaseEntity';

export type SenderType = 'planner' | 'vendor' | 'system';
export type MessageType = 'text' | 'file' | 'quote' | 'status_update';

export interface Attachment {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
}

export interface MessageData extends BaseEntityData {
    bookingRequestId: string;
    senderType: SenderType;
    senderId: string;

    type: MessageType;
    content: string;
    attachments: Attachment[];

    isRead: boolean;
    readAt: Date | null;
}

export interface MessageRow {
    id: string;
    booking_request_id: string;
    sender_type: string;
    sender_id: string;
    type: string;
    content: string;
    attachments: string; // JSON
    is_read: boolean;
    read_at: string | null;
    created_at: string;
    updated_at: string;
}

export class Message extends BaseEntity {
    private _bookingRequestId: string;
    private _senderType: SenderType;
    private _senderId: string;
    private _type: MessageType;
    private _content: string;
    private _attachments: Attachment[];
    private _isRead: boolean;
    private _readAt: Date | null;

    constructor(data: MessageData) {
        super(data);
        this._bookingRequestId = data.bookingRequestId;
        this._senderType = data.senderType;
        this._senderId = data.senderId;
        this._type = data.type;
        this._content = data.content;
        this._attachments = data.attachments;
        this._isRead = data.isRead;
        this._readAt = data.readAt;
    }

    // Getters
    get bookingRequestId(): string { return this._bookingRequestId; }
    get senderType(): SenderType { return this._senderType; }
    get senderId(): string { return this._senderId; }
    get type(): MessageType { return this._type; }
    get content(): string { return this._content; }
    get attachments(): Attachment[] { return [...this._attachments]; }
    get isRead(): boolean { return this._isRead; }
    get readAt(): Date | null { return this._readAt; }

    /**
     * Mark as read
     */
    markRead(): void {
        if (!this._isRead) {
            this._isRead = true;
            this._readAt = new Date();
            this.touch();
        }
    }

    /**
     * Add attachment
     */
    addAttachment(attachment: Omit<Attachment, 'id'>): void {
        this._attachments.push({
            id: crypto.randomUUID(),
            ...attachment,
        });
        this.touch();
    }

    /**
     * Has attachments?
     */
    hasAttachments(): boolean {
        return this._attachments.length > 0;
    }

    /**
     * Is from planner?
     */
    isFromPlanner(): boolean {
        return this._senderType === 'planner';
    }

    /**
     * Is from vendor?
     */
    isFromVendor(): boolean {
        return this._senderType === 'vendor';
    }

    /**
     * Is system message?
     */
    isSystemMessage(): boolean {
        return this._senderType === 'system';
    }

    toRow(): MessageRow {
        return {
            id: this.id,
            booking_request_id: this._bookingRequestId,
            sender_type: this._senderType,
            sender_id: this._senderId,
            type: this._type,
            content: this._content,
            attachments: JSON.stringify(this._attachments),
            is_read: this._isRead,
            read_at: this._readAt?.toISOString() ?? null,
            created_at: this.createdAt.toISOString(),
            updated_at: this.updatedAt.toISOString(),
        };
    }

    static fromRow(row: MessageRow): Message {
        return new Message({
            id: row.id,
            bookingRequestId: row.booking_request_id,
            senderType: row.sender_type as SenderType,
            senderId: row.sender_id,
            type: row.type as MessageType,
            content: row.content,
            attachments: JSON.parse(row.attachments || '[]'),
            isRead: row.is_read,
            readAt: row.read_at ? new Date(row.read_at) : null,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
        });
    }

    toJSON(): MessageData {
        return {
            id: this.id,
            bookingRequestId: this._bookingRequestId,
            senderType: this._senderType,
            senderId: this._senderId,
            type: this._type,
            content: this._content,
            attachments: this._attachments,
            isRead: this._isRead,
            readAt: this._readAt,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}
