/**
 * Lead Service
 * 
 * Business logic for Lead operations.
 */

import { LeadRepository, leadRepository } from '../repositories';
import { Lead, LeadStatus } from '../entities';
import { CreateLeadDto, UpdateLeadDto, QueryLeadsDto } from '../dto/request';
import { PaginatedResponseDto, createPaginatedResponse } from '../dto/response';
import { NotFoundException, BusinessException } from '../exceptions';
import { createLogger } from '../utils';

const logger = createLogger('LeadService');

// Lead response DTO
export interface LeadResponseDto {
    id: string;
    plannerId: string;
    name: string;
    email: string;
    phone?: string;
    eventType: string;
    budgetRange?: string;
    eventDate?: string;
    source: string;
    score: number;
    status: string;
    notes?: string;
    isHotLead: boolean;
    priorityLevel: 'high' | 'medium' | 'low';
    createdAt: string;
    updatedAt: string;
}

function toResponseDto(lead: Lead): LeadResponseDto {
    return {
        id: lead.id,
        plannerId: lead.plannerId,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        eventType: lead.eventType,
        budgetRange: lead.budgetRange,
        eventDate: lead.eventDate?.toISOString(),
        source: lead.source,
        score: lead.score,
        status: lead.status,
        notes: lead.notes,
        isHotLead: lead.isHotLead,
        priorityLevel: lead.priorityLevel,
        createdAt: lead.createdAt.toISOString(),
        updatedAt: lead.updatedAt.toISOString(),
    };
}

export class LeadService {
    constructor(private leadRepo: LeadRepository = leadRepository) { }

    async getById(id: string): Promise<LeadResponseDto> {
        const lead = await this.leadRepo.findByIdOrThrow(id);
        return toResponseDto(lead);
    }

    async getByPlanner(
        plannerId: string,
        query: QueryLeadsDto
    ): Promise<PaginatedResponseDto<LeadResponseDto>> {
        const result = await this.leadRepo.findByPlannerId(plannerId, {
            page: query.page,
            limit: query.limit,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
        });

        return createPaginatedResponse(
            result.data.map(toResponseDto),
            result.page,
            result.limit,
            result.total
        );
    }

    async getHotLeads(plannerId?: string): Promise<LeadResponseDto[]> {
        const leads = await this.leadRepo.findHotLeads(plannerId);
        return leads.map(toResponseDto);
    }

    async create(dto: CreateLeadDto, plannerId: string): Promise<LeadResponseDto> {
        logger.info('Creating new lead', { plannerId, email: dto.email });

        const lead = await this.leadRepo.create({
            plannerId,
            name: dto.name,
            email: dto.email,
            phone: dto.phone,
            eventType: dto.eventType,
            budgetRange: dto.budgetRange,
            eventDate: dto.eventDate ? new Date(dto.eventDate) : undefined,
            source: dto.source,
            score: 0, // Initial score
            status: 'new',
            notes: dto.notes,
        } as Partial<Lead>);

        logger.info('Lead created', { leadId: lead.id });
        return toResponseDto(lead);
    }

    async update(id: string, dto: UpdateLeadDto): Promise<LeadResponseDto> {
        await this.leadRepo.findByIdOrThrow(id);

        const updated = await this.leadRepo.update(id, {
            ...dto,
            eventDate: dto.eventDate ? new Date(dto.eventDate) : undefined,
        } as Partial<Lead>);

        logger.info('Lead updated', { leadId: id });
        return toResponseDto(updated);
    }

    async updateStatus(id: string, status: LeadStatus): Promise<LeadResponseDto> {
        const lead = await this.leadRepo.findByIdOrThrow(id);

        // Validate status transitions
        const validTransitions: Record<LeadStatus, LeadStatus[]> = {
            new: ['contacted', 'lost'],
            contacted: ['qualified', 'lost'],
            qualified: ['proposal_sent', 'lost'],
            proposal_sent: ['converted', 'lost'],
            converted: [],
            lost: ['new'], // Can be re-opened
        };

        if (!validTransitions[lead.status].includes(status)) {
            throw new BusinessException(
                `Cannot transition from '${lead.status}' to '${status}'`,
                'INVALID_TRANSITION'
            );
        }

        const updated = await this.leadRepo.updateStatus(id, status);
        logger.info('Lead status updated', { leadId: id, oldStatus: lead.status, newStatus: status });
        return toResponseDto(updated);
    }

    async updateScore(id: string, score: number): Promise<LeadResponseDto> {
        if (score < 0 || score > 100) {
            throw new BusinessException('Score must be between 0 and 100', 'INVALID_SCORE');
        }

        const updated = await this.leadRepo.updateScore(id, score);
        logger.info('Lead score updated', { leadId: id, score });
        return toResponseDto(updated);
    }

    async delete(id: string): Promise<void> {
        await this.leadRepo.findByIdOrThrow(id);
        await this.leadRepo.delete(id);
        logger.info('Lead deleted', { leadId: id });
    }

    async convertToEvent(id: string): Promise<LeadResponseDto> {
        const lead = await this.leadRepo.findByIdOrThrow(id);

        if (lead.status !== 'proposal_sent') {
            throw new BusinessException(
                'Lead must be in proposal_sent status to convert',
                'INVALID_STATE'
            );
        }

        // Mark as converted
        const updated = await this.leadRepo.updateStatus(id, 'converted');

        // TODO: Create event from lead data
        // const eventData = lead.toEventData();
        // await eventService.create(eventData, lead.plannerId);

        logger.info('Lead converted', { leadId: id });
        return toResponseDto(updated);
    }
}

export const leadService = new LeadService();
