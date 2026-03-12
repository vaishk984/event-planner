'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { EventPlan } from '@/lib/types/event-plan'
import { getEventVendors } from '@/lib/actions/event-vendor-actions'

// Selected vendor from Showroom
export interface SelectedVendor {
    id: string
    name: string
    category: string
    service: string
    cost: number
    imageUrl?: string
}

// Full event with all data
export interface EventData {
    id: string
    name: string
    status: 'requirements_captured' | 'designing' | 'proposal_sent' | 'approved' | 'in_progress' | 'completed'
    requirements: EventPlan
    selectedVendors: SelectedVendor[]
    designNotes: string
    proposalVersion: number
    proposalLocked: boolean
    createdAt: Date
    updatedAt: Date
}

interface EventContextType {
    // Current active event being edited
    activeEvent: EventData | null
    setActiveEvent: (event: EventData | null) => void

    // All events (mock storage)
    events: EventData[]

    // Create new event from wizard
    createEventFromWizard: (requirements: EventPlan) => string

    // Add vendor to active event
    addVendorToEvent: (vendor: SelectedVendor) => void
    removeVendorFromEvent: (vendorId: string) => void

    // Update design notes
    updateDesignNotes: (notes: string) => void

    // Proposal actions
    sendProposal: () => string // returns shareable token
    lockProposal: () => void
    approveEvent: () => Promise<void> // Manual approval
    createNewVersion: () => void

    // Get event by ID (async - fetches vendors from DB)
    getEventById: (id: string) => Promise<EventData | undefined>
}

const EventContext = createContext<EventContextType | undefined>(undefined)

function getActiveEventStorageKey(userId?: string | null) {
    return `planner_active_event:${userId || 'guest'}`
}

export function EventProvider({
    children,
    userId,
}: {
    children: ReactNode
    userId?: string | null
}) {
    const [events, setEvents] = useState<EventData[]>([])
    const [activeEvent, setActiveEvent] = useState<EventData | null>(null)
    const storageKey = getActiveEventStorageKey(userId)

    // Persist active event per account
    useEffect(() => {
        if (activeEvent) {
            localStorage.setItem(storageKey, JSON.stringify(activeEvent))
        } else {
            localStorage.removeItem(storageKey)
        }
    }, [activeEvent, storageKey])

    // Load active event for the current account
    useEffect(() => {
        setEvents([])
        setActiveEvent(null)
        const stored = localStorage.getItem(storageKey)
        if (stored) {
            try {
                const parsed = JSON.parse(stored)
                // Restore Date objects
                parsed.createdAt = new Date(parsed.createdAt)
                parsed.updatedAt = new Date(parsed.updatedAt)
                setActiveEvent(parsed)
                setEvents(prev => {
                    const remaining = prev.filter(event => event.id !== parsed.id)
                    return [...remaining, parsed]
                })
            } catch (e) {
                console.error('Failed to parse stored event', e)
                localStorage.removeItem(storageKey)
            }
        }
    }, [storageKey])

    // Create new event from wizard requirements
    const createEventFromWizard = (requirements: EventPlan): string => {
        const newId = `evt-${Date.now()}`
        const newEvent: EventData = {
            id: newId,
            name: requirements.basics.eventName || 'Untitled Event',
            status: 'requirements_captured',
            requirements,
            selectedVendors: [],
            designNotes: '',
            proposalVersion: 1,
            proposalLocked: false,
            createdAt: new Date(),
            updatedAt: new Date()
        }
        setEvents(prev => [...prev, newEvent])
        setActiveEvent(newEvent)
        return newId
    }

    // Add vendor to active event
    const addVendorToEvent = (vendor: SelectedVendor) => {
        if (!activeEvent) return

        // Check if vendor already added
        if (activeEvent.selectedVendors.find(v => v.id === vendor.id)) return

        const updated = {
            ...activeEvent,
            selectedVendors: [...activeEvent.selectedVendors, vendor],
            status: 'designing' as const,
            updatedAt: new Date()
        }
        setActiveEvent(updated)
        setEvents(prev => prev.map(e => e.id === updated.id ? updated : e))
    }

    // Remove vendor from active event
    const removeVendorFromEvent = (vendorId: string) => {
        if (!activeEvent) return

        const updated = {
            ...activeEvent,
            selectedVendors: activeEvent.selectedVendors.filter(v => v.id !== vendorId),
            updatedAt: new Date()
        }
        setActiveEvent(updated)
        setEvents(prev => prev.map(e => e.id === updated.id ? updated : e))
    }

    // Update design notes
    const updateDesignNotes = (notes: string) => {
        if (!activeEvent) return

        const updated = {
            ...activeEvent,
            designNotes: notes,
            updatedAt: new Date()
        }
        setActiveEvent(updated)
        setEvents(prev => prev.map(e => e.id === updated.id ? updated : e))
    }

    // Send proposal (generate shareable token)
    const sendProposal = (): string => {
        if (!activeEvent) return ''

        const token = `proposal-${activeEvent.id}-v${activeEvent.proposalVersion}`
        const updated = {
            ...activeEvent,
            status: 'proposal_sent' as const,
            updatedAt: new Date()
        }
        setActiveEvent(updated)
        setEvents(prev => prev.map(e => e.id === updated.id ? updated : e))
        return token
    }

    // Lock proposal after approval
    const lockProposal = () => {
        if (!activeEvent) return

        const updated = {
            ...activeEvent,
            proposalLocked: true,
            status: 'approved' as const,
            updatedAt: new Date()
        }
        setActiveEvent(updated)
        setEvents(prev => prev.map(e => e.id === updated.id ? updated : e))
    }

    // Approve event manually (connects to server)
    const approveEvent = async () => {
        if (!activeEvent) return

        // 1. Optimistic update
        lockProposal()

        // 2. Call server action (dynamic import to avoid server-client issues in context)
        // using the existing lockProposal mainly for now as the server action integration 
        // might require refactoring the provider to be async-aware or import properly.
        // For now, we stick to the local state pattern used elsewhere in this mock provider,
        // but we'll add the hook for real implementation.

        // In a real app, this would call `await updateEventStatus(activeEvent.id, 'approved')`
    }

    // Create new version (when changes needed after lock)
    const createNewVersion = () => {
        if (!activeEvent) return

        const updated = {
            ...activeEvent,
            proposalVersion: activeEvent.proposalVersion + 1,
            proposalLocked: false,
            status: 'designing' as const,
            updatedAt: new Date()
        }
        setActiveEvent(updated)
        setEvents(prev => prev.map(e => e.id === updated.id ? updated : e))
    }

    // Get event by ID and load vendors from DB
    const getEventById = async (id: string): Promise<EventData | undefined> => {
        const event = events.find(e => e.id === id) || (activeEvent?.id === id ? activeEvent : undefined)
        if (!event) return undefined

        try {
            // Fetch real vendors from database
            const eventVendors = await getEventVendors(id)

            // Map to SelectedVendor format
            const selectedVendors: SelectedVendor[] = eventVendors.map(ev => ({
                id: ev.vendorId,
                name: ev.vendorName || 'Unknown Vendor',
                category: ev.category,
                service: ev.vendorName || '',
                cost: ev.agreedAmount || 0,
                imageUrl: undefined
            }))

            return {
                ...event,
                selectedVendors
            }
        } catch (error) {
            console.error('Failed to load event vendors:', error)
            return event
        }
    }

    return (
        <EventContext.Provider value={{
            activeEvent,
            setActiveEvent,
            events,
            createEventFromWizard,
            addVendorToEvent,
            removeVendorFromEvent,
            updateDesignNotes,
            sendProposal,
            lockProposal,
            approveEvent,
            createNewVersion,
            getEventById
        }}>
            {children}
        </EventContext.Provider>
    )
}

export function useEventContext() {
    const context = useContext(EventContext)
    if (!context) {
        throw new Error('useEventContext must be used within EventProvider')
    }
    return context
}
