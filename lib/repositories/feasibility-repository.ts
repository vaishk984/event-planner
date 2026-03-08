/**
 * Workspace Feasibility Repository
 * 
 * "The Brain" Module 1 coverage.
 * Handles the "Pre-flight Check" logic:
 * - Date/Venue Availability Checks
 * - Budget Viability Scoring
 * - Vendor Availability Lookups
 * 
 * Based on: workspace_design_proposal.md (Module 1)
 */

import { BaseRepository } from './base-repository';
import { vendorRepository } from './vendor-repository';
import { eventRepository } from './event-repository';
import type { Vendor, Event, VendorAvailability } from '@/types/domain';

export type FeasibilityReport = {
    isFeasible: boolean;
    score: number; // 0-100 score of how "safe" this plan is
    conflicts: string[]; // List of hard blockers (e.g. Venue booked)
    warnings: string[]; // List of soft risks (e.g. 20% over budget)
    budgetAnalysis: {
        estimatedCost: number;
        budgetMax: number;
        status: 'under' | 'over' | 'tight';
    };
    vendorAvailability: {
        total: number;
        available: number;
        busy: number;
    };
};

class FeasibilityRepositoryClass extends BaseRepository<any> {
    protected storageKey = 'planner-os-feasibility'; // Not actually used for persistence
    protected entityName = 'feasibility';

    // This repository calculates on the fly, doesn't store state typically
    // accessing other repos to build the report.

    /**
     * Run full feasibility check
     */
    async checkFeasibility(
        date: string,
        budgetMax: number,
        venueId?: string,
        guestCount?: number,
        categoryBudgets?: Record<string, number> // e.g. { 'photography': 50000 }
    ): Promise<FeasibilityReport> {
        const conflicts: string[] = [];
        const warnings: string[] = [];

        // 1. Venue Check
        if (venueId) {
            const isVenueFree = await this.checkVenueAvailability(venueId, date);
            if (!isVenueFree) {
                conflicts.push(`Venue is already booked on ${date}`);
            }
        }

        // 2. Mock Global Vendor Availability Check 
        // (In real app, this queries the availability table)
        const allVendors = await vendorRepository.findAll();
        const availableVendors = allVendors.filter((v: any) => Math.random() > 0.3); // Mock 70% available

        // 3. Budget Viability Scoring
        // Simple heuristic: Base cost per guest + Category estimates
        const estimatedBaseCost = (guestCount || 0) * 1500; // ₹1500 per plate base

        // Sum up category estimates if provided, else use rough averages
        let categoryTotal = 0;
        if (categoryBudgets) {
            categoryTotal = Object.values(categoryBudgets).reduce((a, b) => a + b, 0);
        } else {
            // Rough automated estimate if planner hasn't entered detail yet
            categoryTotal = 200000; // Placeholder for decor/photo/etc
        }

        const totalEstimated = estimatedBaseCost + categoryTotal;
        const budgetStatus = totalEstimated > budgetMax ? 'over' : (totalEstimated > budgetMax * 0.9 ? 'tight' : 'under');

        if (budgetStatus === 'over') {
            warnings.push(`Estimated cost (₹${totalEstimated}) exceeds budget (₹${budgetMax})`);
        }

        // 4. Calculate Final Score
        // Start perfect, deduct for issues
        let score = 100;
        if (conflicts.length > 0) score = 0; // Hard fail
        if (budgetStatus === 'over') score -= 30;
        if (budgetStatus === 'tight') score -= 10;

        return {
            isFeasible: conflicts.length === 0,
            score,
            conflicts,
            warnings,
            budgetAnalysis: {
                estimatedCost: totalEstimated,
                budgetMax,
                status: budgetStatus
            },
            vendorAvailability: {
                total: allVendors.length,
                available: availableVendors.length,
                busy: allVendors.length - availableVendors.length
            }
        };
    }

    /**
     * Internal helper to check specific venue
     */
    private async checkVenueAvailability(venueId: string, date: string): Promise<boolean> {
        // Query existing events to see if any use this venue on this date
        const events = await eventRepository.findMany({ date }); // This is a loose check, normally would filter by venueId too
        // In this mock architecture, we assume 'date' collision is the main check for now
        // Real logic: find events where event.venueId === venueId && event.date === date
        return true; // Mock return
    }
}

export const feasibilityRepository = new FeasibilityRepositoryClass();
