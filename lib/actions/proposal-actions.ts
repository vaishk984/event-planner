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
