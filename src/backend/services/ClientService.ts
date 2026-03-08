/**
 * ClientService
 * 
 * Business logic for client/CRM operations.
 */

import { Client, ClientStatus, ClientPreferences } from '../entities';
import { ClientRepository } from '../repositories';
import { CreateClientDto, UpdateClientDto } from '../dto/request';
import { NotFoundException } from '../exceptions';

export class ClientService {
    private repository: ClientRepository;

    constructor(repository?: ClientRepository) {
        this.repository = repository || new ClientRepository();
    }

    /**
     * Get client by ID
     */
    async getById(id: string): Promise<Client> {
        const client = await this.repository.findById(id);
        if (!client) throw new NotFoundException('Client', id);
        return client;
    }

    /**
     * Get all clients for planner
     */
    async getByPlanner(plannerId: string): Promise<Client[]> {
        return this.repository.getByPlanner(plannerId);
    }

    /**
     * Get clients by status
     */
    async getByStatus(plannerId: string, status: ClientStatus): Promise<Client[]> {
        return this.repository.getByStatus(plannerId, status);
    }

    /**
     * Search clients
     */
    async search(plannerId: string, query: string): Promise<Client[]> {
        return this.repository.search(plannerId, query);
    }

    /**
     * Get high-value clients
     */
    async getHighValue(plannerId: string): Promise<Client[]> {
        return this.repository.getHighValue(plannerId);
    }

    /**
     * Create a client
     */
    async create(dto: CreateClientDto, plannerId: string): Promise<Client> {
        // Check for duplicate email
        if (dto.email) {
            const existing = await this.repository.getByEmail(plannerId, dto.email);
            if (existing) {
                throw new Error('Client with this email already exists');
            }
        }

        const defaultPreferences: ClientPreferences = {
            communicationMethod: 'whatsapp',
            budgetRange: null,
            preferredVenues: [],
            dietaryRestrictions: [],
            notes: '',
        };

        const client = new Client({
            id: crypto.randomUUID(),
            plannerId,
            name: dto.name,
            email: dto.email || null,
            phone: dto.phone || null,
            alternatePhone: dto.alternatePhone || null,
            status: 'prospect',
            address: dto.address || null,
            city: dto.city || null,
            state: dto.state || null,
            preferences: dto.preferences ? { ...defaultPreferences, ...dto.preferences } : defaultPreferences,
            totalEvents: 0,
            totalSpend: 0,
            currency: 'INR',
            referralSource: dto.referralSource || null,
            notes: dto.notes || null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return this.repository.create(client);
    }

    /**
     * Update a client
     */
    async update(id: string, dto: UpdateClientDto): Promise<Client> {
        const client = await this.getById(id);

        if (dto.name !== undefined) client.name = dto.name;
        if (dto.email !== undefined) client.email = dto.email;
        if (dto.phone !== undefined) client.phone = dto.phone;
        if (dto.alternatePhone !== undefined) client.alternatePhone = dto.alternatePhone;
        if (dto.status !== undefined) client.status = dto.status as ClientStatus;
        if (dto.address !== undefined) client.address = dto.address;
        if (dto.city !== undefined) client.city = dto.city;
        if (dto.state !== undefined) client.state = dto.state;
        if (dto.preferences !== undefined) client.updatePreferences(dto.preferences);
        if (dto.notes !== undefined) client.notes = dto.notes;

        return this.repository.update(id, client);
    }

    /**
     * Record event for client (updates stats)
     */
    async recordEvent(id: string, eventAmount: number): Promise<Client> {
        const client = await this.getById(id);
        client.recordEvent(eventAmount);
        return this.repository.update(id, client);
    }

    /**
     * Delete a client
     */
    async delete(id: string): Promise<void> {
        await this.getById(id);
        await this.repository.delete(id);
    }

    /**
     * Get client stats
     */
    async getStats(plannerId: string): Promise<{
        total: number;
        active: number;
        prospects: number;
        totalRevenue: number;
    }> {
        return this.repository.getStats(plannerId);
    }
}

// Singleton instance
export const clientService = new ClientService();
