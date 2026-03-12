/**
 * Proposal Actions (Server Actions)
 * 
 * Server-side actions for proposal management.
 * Handles create, send, approve/reject with event locking.
 * 
 * Based on: docs/ARCHITECTURE.md (Section 3.2)
 */

'use server'

import { proposalRepository } from '@/lib/repositories/proposal-repository';
import { eventRepository } from '@/lib/repositories/event-repository';
import type { Proposal, ProposalItem, ActionResult } from '@/types/domain';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getUserId } from '@/lib/session';

export interface PlannerProposalSnapshot {
    id: string;
    event_id: string;
    version: number;
    token: string;
    status: string;
    snapshot_data: any;
    client_feedback: string | null;
    created_at: string;
    event_name?: string;
    client_name?: string;
    event_date?: string;
    guest_count?: number;
    city?: string;
}

/**
 * Create new proposal for event
 */
export async function createProposal(
    eventId: string,
    title: string,
    items: Omit<ProposalItem, 'id' | 'proposalId'>[],
    discount: number = 0,
    tier?: 'silver' | 'gold' | 'platinum' | 'custom'
): Promise<ActionResult<Proposal>> {
    // Verify event exists
    const event = await eventRepository.findById(eventId);
    if (!event) {
        return { success: false, error: 'Event not found', code: 'NOT_FOUND' };
    }

    const result = await proposalRepository.createProposal(eventId, title, items, discount, 0.18, tier);

    if (result.success) {
        revalidatePath(`/planner/events/${eventId}`);
        revalidatePath('/planner/proposals');
    }

    return result;
}

/**
 * Get proposal by ID
 */
export async function getProposal(id: string): Promise<Proposal | null> {
    return proposalRepository.findById(id);
}

/**
 * Get proposal by token (for client access)
 */
export async function getProposalByToken(token: string): Promise<Proposal | null> {
    return proposalRepository.findByToken(token);
}

/**
 * Get all proposals for an event
 */
export async function getEventProposals(eventId: string): Promise<Proposal[]> {
    return proposalRepository.findByEventId(eventId);
}

/**
 * Get latest proposal for an event
 */
export async function getLatestProposal(eventId: string): Promise<Proposal | null> {
    return proposalRepository.findLatestByEventId(eventId);
}

/**
 * Send proposal to client
 */
export async function sendProposal(id: string): Promise<ActionResult<Proposal>> {
    const result = await proposalRepository.markAsSent(id);

    if (result.success) {
        // Update event status to proposed
        const proposal = result.data;
        await eventRepository.update(proposal.eventId, { status: 'proposed' });

        revalidatePath('/planner/proposals');
        revalidatePath(`/planner/events/${proposal.eventId}`);
    }

    return result;
}

/**
 * Mark proposal as viewed (when client opens)
 */
export async function markProposalViewed(token: string): Promise<ActionResult<Proposal>> {
    const proposal = await proposalRepository.findByToken(token);
    if (!proposal) {
        return { success: false, error: 'Proposal not found', code: 'NOT_FOUND' };
    }

    return proposalRepository.markAsViewed(proposal.id);
}

/**
 * Client approves proposal - LOCKS THE EVENT
 */
export async function approveProposal(
    token: string,
    clientNotes?: string
): Promise<ActionResult<Proposal>> {
    const proposal = await proposalRepository.findByToken(token);
    if (!proposal) {
        return { success: false, error: 'Proposal not found', code: 'NOT_FOUND' };
    }

    // Approve proposal
    const result = await proposalRepository.approve(proposal.id, clientNotes);

    if (result.success) {
        // LOCK THE EVENT - transition to "approved" status
        await eventRepository.update(proposal.eventId, {
            status: 'approved',
        });

        revalidatePath('/planner/proposals');
        revalidatePath(`/planner/events/${proposal.eventId}`);
    }

    return result;
}

/**
 * Client rejects proposal
 */
export async function rejectProposal(
    token: string,
    clientNotes?: string
): Promise<ActionResult<Proposal>> {
    const proposal = await proposalRepository.findByToken(token);
    if (!proposal) {
        return { success: false, error: 'Proposal not found', code: 'NOT_FOUND' };
    }

    // Reject proposal
    const result = await proposalRepository.reject(proposal.id, clientNotes);

    if (result.success) {
        // Move event back to planning for revision
        await eventRepository.update(proposal.eventId, { status: 'planning' });

        revalidatePath('/planner/proposals');
        revalidatePath(`/planner/events/${proposal.eventId}`);
    }

    return result;
}

/**
 * Get pending proposals
 */
export async function getPendingProposals(): Promise<Proposal[]> {
    return proposalRepository.findPending();
}

/**
 * Get proposal snapshots for the current planner only.
 */
export async function getPlannerProposalSnapshots(): Promise<PlannerProposalSnapshot[]> {
    const plannerId = await getUserId();
    if (!plannerId) {
        return [];
    }

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('proposal_snapshots')
        .select(`
            id,
            event_id,
            version,
            token,
            status,
            snapshot_data,
            client_feedback,
            created_at,
            events!inner(
                name,
                client_name,
                date,
                guest_count,
                city,
                planner_id
            )
        `)
        .eq('events.planner_id', plannerId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching planner proposal snapshots:', error);
        return [];
    }

    return (data || []).map((proposal: any) => ({
        id: proposal.id,
        event_id: proposal.event_id,
        version: proposal.version,
        token: proposal.token,
        status: proposal.status,
        snapshot_data: proposal.snapshot_data,
        client_feedback: proposal.client_feedback,
        created_at: proposal.created_at,
        event_name: proposal.events?.name || proposal.snapshot_data?.eventName || 'Unknown Event',
        client_name: proposal.events?.client_name || proposal.snapshot_data?.clientName || 'Unknown Client',
        event_date: proposal.events?.date || proposal.snapshot_data?.date || '',
        guest_count: proposal.events?.guest_count || proposal.snapshot_data?.guestCount || 0,
        city: proposal.events?.city || proposal.snapshot_data?.city || '',
    }));
}
