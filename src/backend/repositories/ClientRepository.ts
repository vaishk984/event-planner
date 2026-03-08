/**
 * ClientRepository
 * 
 * Data access for Client entities.
 */

import { BaseRepository } from './BaseRepository';
import { Client, ClientRow, ClientStatus } from '../entities';

export class ClientRepository extends BaseRepository<Client, ClientRow> {
    protected tableName = 'clients';
    protected entityName = 'Client';

    protected toEntity(row: ClientRow): Client {
        return Client.fromRow(row);
    }

    protected toRow(entity: Partial<Client>): Partial<ClientRow> {
        if (entity instanceof Client) {
            return entity.toRow();
        }
        return entity as unknown as Partial<ClientRow>;
    }

    /**
     * Get clients by planner
     */
    async getByPlanner(plannerId: string): Promise<Client[]> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('planner_id', plannerId)
            .order('name');

        if (error) throw error;
        return (data || []).map(row => this.toEntity(row as ClientRow));
    }

    /**
     * Get by status
     */
    async getByStatus(plannerId: string, status: ClientStatus): Promise<Client[]> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('planner_id', plannerId)
            .eq('status', status)
            .order('name');

        if (error) throw error;
        return (data || []).map(row => this.toEntity(row as ClientRow));
    }

    /**
     * Search clients
     */
    async search(plannerId: string, query: string): Promise<Client[]> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('planner_id', plannerId)
            .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
            .order('name')
            .limit(20);

        if (error) throw error;
        return (data || []).map(row => this.toEntity(row as ClientRow));
    }

    /**
     * Get high-value clients
     */
    async getHighValue(plannerId: string, threshold: number = 500000): Promise<Client[]> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('planner_id', plannerId)
            .gte('total_spend', threshold)
            .order('total_spend', { ascending: false });

        if (error) throw error;
        return (data || []).map(row => this.toEntity(row as ClientRow));
    }

    /**
     * Get by email
     */
    async getByEmail(plannerId: string, email: string): Promise<Client | null> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select('*')
            .eq('planner_id', plannerId)
            .eq('email', email)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data ? this.toEntity(data as ClientRow) : null;
    }

    /**
     * Get stats
     */
    async getStats(plannerId: string): Promise<{
        total: number;
        active: number;
        prospects: number;
        totalRevenue: number;
    }> {
        const clients = await this.getByPlanner(plannerId);

        return {
            total: clients.length,
            active: clients.filter(c => c.status === 'active').length,
            prospects: clients.filter(c => c.status === 'prospect').length,
            totalRevenue: clients.reduce((sum, c) => sum + c.totalSpend, 0),
        };
    }
}
