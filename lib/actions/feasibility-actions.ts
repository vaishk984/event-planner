/**
 * Feasibility Actions (Server Actions)
 * 
 * Server-side entry point for the "Feasibility Engine" module.
 * Called by the planner UI when starting the Phase 2 workflow.
 */

'use server'

import { feasibilityRepository, type FeasibilityReport } from '@/lib/repositories/feasibility-repository';

export async function checkEventFeasibility(
    date: string,
    budgetMax: number,
    venueId?: string,
    guestCount?: number
): Promise<FeasibilityReport> {

    // Simulate a slight network delay to feel like "Processing..."
    await new Promise(resolve => setTimeout(resolve, 800));

    // Run the logic
    return feasibilityRepository.checkFeasibility(date, budgetMax, venueId, guestCount);
}
