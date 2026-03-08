/**
 * BookingService
 * 
 * Business logic for BookingRequest operations (planner-vendor workflow).
 */

import { BookingRequest, BookingStatus, Message } from '../entities';
import { BookingRepository, MessageRepository } from '../repositories';
import {
    CreateBookingRequestDto,
    UpdateBookingRequestDto,
    SubmitQuoteDto,
    AcceptQuoteDto
} from '../dto/request';
import { NotFoundException, BusinessException } from '../exceptions';

export class BookingService {
    private repository: BookingRepository;
    private messageRepository: MessageRepository;

    constructor(repository?: BookingRepository, messageRepo?: MessageRepository) {
        this.repository = repository || new BookingRepository();
        this.messageRepository = messageRepo || new MessageRepository();
    }

    /**
     * Get booking by ID
     */
    async getById(id: string): Promise<BookingRequest> {
        const booking = await this.repository.findById(id);
        if (!booking) throw new NotFoundException('BookingRequest', id);
        return booking;
    }

    /**
     * Get bookings for event
     */
    async getByEvent(eventId: string): Promise<BookingRequest[]> {
        return this.repository.getByEvent(eventId);
    }

    /**
     * Get bookings for vendor
     */
    async getByVendor(vendorId: string): Promise<BookingRequest[]> {
        return this.repository.getByVendor(vendorId);
    }

    /**
     * Get pending requests for vendor
     */
    async getPendingForVendor(vendorId: string): Promise<BookingRequest[]> {
        return this.repository.getPendingForVendor(vendorId);
    }

    /**
     * Get active bookings for planner
     */
    async getActiveForPlanner(plannerId: string): Promise<BookingRequest[]> {
        return this.repository.getActive(plannerId);
    }

    /**
     * Create a new booking request (planner action)
     */
    async create(dto: CreateBookingRequestDto, plannerId: string): Promise<BookingRequest> {
        const booking = new BookingRequest({
            id: crypto.randomUUID(),
            eventId: dto.eventId,
            functionId: dto.functionId || null,
            vendorId: dto.vendorId,
            plannerId,
            status: 'quote_requested',
            service: dto.serviceCategory,
            serviceDetails: dto.serviceDetails || null,
            quotedAmount: null,
            agreedAmount: null,
            currency: 'INR',
            paymentSchedule: [],
            requestedDate: new Date(),
            responseDate: null,
            confirmationDate: null,
            notes: dto.notes || null,
            internalNotes: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const created = await this.repository.create(booking);

        // Create system message
        await this.addSystemMessage(
            created.id,
            `Quote requested for ${dto.serviceCategory}`
        );

        return created;
    }

    /**
     * Update booking request
     */
    async update(id: string, dto: UpdateBookingRequestDto): Promise<BookingRequest> {
        const booking = await this.getById(id);

        if (dto.serviceDetails !== undefined) booking.serviceDetails = dto.serviceDetails;
        if (dto.notes !== undefined) booking.notes = dto.notes;
        if (dto.internalNotes !== undefined) booking.internalNotes = dto.internalNotes;

        return this.repository.update(id, booking);
    }

    /**
     * Submit quote (vendor action)
     */
    async submitQuote(id: string, dto: SubmitQuoteDto): Promise<BookingRequest> {
        const booking = await this.getById(id);

        if (booking.status !== 'quote_requested') {
            throw new BusinessException('Can only submit quote when status is quote_requested');
        }

        booking.submitQuote(dto.amount);

        // Add payment schedule if provided
        if (dto.paymentSchedule) {
            for (const milestone of dto.paymentSchedule) {
                booking.addPaymentMilestone({
                    name: milestone.name,
                    amount: milestone.amount,
                    dueDate: milestone.dueDate,
                    paidDate: milestone.paidDate ?? null,
                });
            }
        }

        const updated = await this.repository.update(id, booking);

        // Create system message
        await this.addSystemMessage(
            id,
            `Quote submitted: ₹${dto.amount.toLocaleString()}`
        );

        return updated;
    }

    /**
     * Accept quote (planner action)
     */
    async acceptQuote(id: string, dto: AcceptQuoteDto): Promise<BookingRequest> {
        const booking = await this.getById(id);
        booking.acceptQuote(dto.agreedAmount);

        // Add/update payment schedule if provided
        if (dto.paymentSchedule) {
            for (const milestone of dto.paymentSchedule) {
                booking.addPaymentMilestone({
                    name: milestone.name,
                    amount: milestone.amount,
                    dueDate: milestone.dueDate,
                    paidDate: milestone.paidDate ?? null,
                });
            }
        }

        const updated = await this.repository.update(id, booking);

        // Create system message
        const amount = dto.agreedAmount ?? booking.quotedAmount;
        await this.addSystemMessage(
            id,
            `Booking confirmed at ₹${amount?.toLocaleString()}`
        );

        return updated;
    }

    /**
     * Decline quote (planner action)
     */
    async declineQuote(id: string, reason?: string): Promise<BookingRequest> {
        const booking = await this.getById(id);
        booking.transitionTo('declined');
        if (reason) booking.notes = reason;

        const updated = await this.repository.update(id, booking);

        await this.addSystemMessage(id, 'Booking declined');

        return updated;
    }

    /**
     * Cancel booking
     */
    async cancel(id: string, reason?: string): Promise<BookingRequest> {
        const booking = await this.getById(id);

        if (!booking.canTransitionTo('cancelled')) {
            throw new BusinessException('Cannot cancel this booking');
        }

        booking.transitionTo('cancelled');
        if (reason) booking.notes = reason;

        const updated = await this.repository.update(id, booking);

        await this.addSystemMessage(id, `Booking cancelled${reason ? ': ' + reason : ''}`);

        return updated;
    }

    /**
     * Mark milestone as paid
     */
    async markMilestonePaid(id: string, milestoneId: string): Promise<BookingRequest> {
        const booking = await this.getById(id);
        booking.markMilestonePaid(milestoneId);

        // Check if deposit is paid and update status
        if (booking.status === 'confirmed' && booking.getTotalPaid() > 0) {
            booking.transitionTo('deposit_paid');
        }

        return this.repository.update(id, booking);
    }

    /**
     * Get booking stats by status
     */
    async getStats(plannerId: string): Promise<Record<BookingStatus, number>> {
        return this.repository.countByStatus(plannerId);
    }

    /**
     * Add system message to booking thread
     */
    private async addSystemMessage(bookingRequestId: string, content: string): Promise<void> {
        const message = new Message({
            id: crypto.randomUUID(),
            bookingRequestId,
            senderType: 'system',
            senderId: 'system',
            type: 'status_update',
            content,
            attachments: [],
            isRead: false,
            readAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await this.messageRepository.create(message);
    }
}

// Singleton instance
export const bookingService = new BookingService();
