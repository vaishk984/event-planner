// Event Functions Store
// Manages multi-day event functions (Mehendi, Sangeet, Wedding, Reception)

import type { EventFunction, FunctionType } from '@/types/domain'

// In-memory store (would be database in production)
let eventFunctions: EventFunction[] = []

// Function templates for quick creation
export const FUNCTION_TEMPLATES: Record<FunctionType, { name: string; duration: string; defaultGuests: number }> = {
    mehendi: { name: 'Mehendi Ceremony', duration: '4 hours', defaultGuests: 100 },
    haldi: { name: 'Haldi Ceremony', duration: '2 hours', defaultGuests: 50 },
    sangeet: { name: 'Sangeet Night', duration: '5 hours', defaultGuests: 200 },
    wedding: { name: 'Wedding Ceremony', duration: '6 hours', defaultGuests: 300 },
    reception: { name: 'Reception', duration: '4 hours', defaultGuests: 400 },
    cocktail: { name: 'Cocktail Party', duration: '3 hours', defaultGuests: 150 },
    after_party: { name: 'After Party', duration: '3 hours', defaultGuests: 100 },
    brunch: { name: 'Wedding Brunch', duration: '3 hours', defaultGuests: 100 },
    custom: { name: 'Custom Function', duration: '3 hours', defaultGuests: 100 },
}

// Get all functions for an event
export function getFunctionsForEvent(eventId: string): EventFunction[] {
    return eventFunctions
        .filter(f => f.eventId === eventId)
        .sort((a, b) => a.day - b.day)
}

// Get a single function
export function getFunction(functionId: string): EventFunction | undefined {
    return eventFunctions.find(f => f.id === functionId)
}

// Create a new function
export function createFunction(data: Omit<EventFunction, 'id' | 'createdAt' | 'updatedAt'>): EventFunction {
    const newFunction: EventFunction = {
        ...data,
        id: `func_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
    eventFunctions.push(newFunction)
    return newFunction
}

// Update a function
export function updateFunction(functionId: string, updates: Partial<EventFunction>): EventFunction | null {
    const index = eventFunctions.findIndex(f => f.id === functionId)
    if (index === -1) return null

    eventFunctions[index] = {
        ...eventFunctions[index],
        ...updates,
        updatedAt: new Date().toISOString(),
    }
    return eventFunctions[index]
}

// Delete a function
export function deleteFunction(functionId: string): boolean {
    const index = eventFunctions.findIndex(f => f.id === functionId)
    if (index === -1) return false

    eventFunctions.splice(index, 1)
    return true
}

// Get total budget across all functions
export function getTotalFunctionBudget(eventId: string): number {
    return getFunctionsForEvent(eventId).reduce((sum, f) => sum + f.budget, 0)
}

// Get total guests (max across functions)
export function getMaxGuestCount(eventId: string): number {
    const functions = getFunctionsForEvent(eventId)
    if (functions.length === 0) return 0
    return Math.max(...functions.map(f => f.guestCount))
}
