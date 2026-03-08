// Timeline Store
// Manages run sheet items for event functions

import type { TimelineItem, TimelineStatus, FunctionType } from '@/types/domain'

// In-memory store (would be database in production)
let timelineItems: TimelineItem[] = []

// Templates for common function run sheets
export const TIMELINE_TEMPLATES: Record<FunctionType, Omit<TimelineItem, 'id' | 'functionId' | 'eventId' | 'createdAt' | 'updatedAt'>[]> = {
    wedding: [
        { startTime: '06:00', title: 'Venue opens, decor setup begins', owner: 'Decorator', status: 'pending', order: 1 },
        { startTime: '08:00', title: 'Catering team arrives', owner: 'Caterer', status: 'pending', order: 2 },
        { startTime: '09:00', title: 'Sound & lighting check', owner: 'DJ/Sound', status: 'pending', order: 3 },
        { startTime: '10:00', title: 'Photography team arrives', owner: 'Photographer', status: 'pending', order: 4 },
        { startTime: '10:30', title: 'Bride getting ready', owner: 'Makeup Artist', status: 'pending', order: 5 },
        { startTime: '11:00', title: 'Groom baraat arrives', owner: 'Coordinator', status: 'pending', order: 6 },
        { startTime: '11:30', title: 'Welcome ceremony (Milni)', owner: 'Pandit', status: 'pending', order: 7 },
        { startTime: '12:00', title: 'Main wedding ceremony', owner: 'Pandit', status: 'pending', order: 8 },
        { startTime: '14:00', title: 'Lunch service begins', owner: 'Caterer', status: 'pending', order: 9 },
        { startTime: '16:00', title: 'Vidai ceremony', owner: 'Coordinator', status: 'pending', order: 10 },
    ],
    sangeet: [
        { startTime: '17:00', title: 'Venue setup & sound check', owner: 'DJ/Sound', status: 'pending', order: 1 },
        { startTime: '18:00', title: 'Dance floor ready', owner: 'Decorator', status: 'pending', order: 2 },
        { startTime: '19:00', title: 'Guest arrival & welcome drinks', owner: 'Caterer', status: 'pending', order: 3 },
        { startTime: '19:30', title: 'Family performances begin', owner: 'Choreographer', status: 'pending', order: 4 },
        { startTime: '21:00', title: 'Couple performance', owner: 'Choreographer', status: 'pending', order: 5 },
        { startTime: '21:30', title: 'Open dance floor', owner: 'DJ', status: 'pending', order: 6 },
        { startTime: '22:00', title: 'Dinner service', owner: 'Caterer', status: 'pending', order: 7 },
        { startTime: '23:30', title: 'Event wrap-up', owner: 'Coordinator', status: 'pending', order: 8 },
    ],
    mehendi: [
        { startTime: '10:00', title: 'Setup & decor', owner: 'Decorator', status: 'pending', order: 1 },
        { startTime: '11:00', title: 'Mehendi artists arrive', owner: 'Mehendi Artist', status: 'pending', order: 2 },
        { startTime: '11:30', title: 'Bride mehendi begins', owner: 'Mehendi Artist', status: 'pending', order: 3 },
        { startTime: '12:00', title: 'Guest mehendi starts', owner: 'Mehendi Team', status: 'pending', order: 4 },
        { startTime: '13:00', title: 'Lunch service', owner: 'Caterer', status: 'pending', order: 5 },
        { startTime: '15:00', title: 'Music & entertainment', owner: 'DJ/Singer', status: 'pending', order: 6 },
        { startTime: '17:00', title: 'Photography session', owner: 'Photographer', status: 'pending', order: 7 },
        { startTime: '18:00', title: 'Event concludes', owner: 'Coordinator', status: 'pending', order: 8 },
    ],
    reception: [
        { startTime: '17:00', title: 'Venue setup & decor', owner: 'Decorator', status: 'pending', order: 1 },
        { startTime: '18:00', title: 'Sound & lighting check', owner: 'DJ/Sound', status: 'pending', order: 2 },
        { startTime: '19:00', title: 'Guest arrival begins', owner: 'Coordinator', status: 'pending', order: 3 },
        { startTime: '19:30', title: 'Couple grand entry', owner: 'Anchor', status: 'pending', order: 4 },
        { startTime: '20:00', title: 'Cake cutting & toast', owner: 'Anchor', status: 'pending', order: 5 },
        { startTime: '20:30', title: 'Dinner service begins', owner: 'Caterer', status: 'pending', order: 6 },
        { startTime: '21:30', title: 'First dance', owner: 'DJ', status: 'pending', order: 7 },
        { startTime: '22:00', title: 'Open dance floor', owner: 'DJ', status: 'pending', order: 8 },
        { startTime: '23:30', title: 'Event wrap-up', owner: 'Coordinator', status: 'pending', order: 9 },
    ],
    haldi: [
        { startTime: '09:00', title: 'Setup & decor', owner: 'Decorator', status: 'pending', order: 1 },
        { startTime: '10:00', title: 'Haldi ceremony begins', owner: 'Family', status: 'pending', order: 2 },
        { startTime: '11:00', title: 'Photo session', owner: 'Photographer', status: 'pending', order: 3 },
        { startTime: '12:00', title: 'Lunch', owner: 'Caterer', status: 'pending', order: 4 },
        { startTime: '13:00', title: 'Event concludes', owner: 'Coordinator', status: 'pending', order: 5 },
    ],
    cocktail: [
        { startTime: '18:00', title: 'Setup & bar ready', owner: 'Bartender', status: 'pending', order: 1 },
        { startTime: '19:00', title: 'Guest arrival', owner: 'Coordinator', status: 'pending', order: 2 },
        { startTime: '20:00', title: 'Appetizers served', owner: 'Caterer', status: 'pending', order: 3 },
        { startTime: '21:00', title: 'Entertainment/Music', owner: 'DJ', status: 'pending', order: 4 },
        { startTime: '22:00', title: 'Event wrap-up', owner: 'Coordinator', status: 'pending', order: 5 },
    ],
    after_party: [
        { startTime: '23:00', title: 'Venue transition', owner: 'Coordinator', status: 'pending', order: 1 },
        { startTime: '23:30', title: 'Party begins', owner: 'DJ', status: 'pending', order: 2 },
        { startTime: '02:00', title: 'Party ends', owner: 'Coordinator', status: 'pending', order: 3 },
    ],
    brunch: [
        { startTime: '10:00', title: 'Setup & decor', owner: 'Decorator', status: 'pending', order: 1 },
        { startTime: '11:00', title: 'Guest arrival', owner: 'Coordinator', status: 'pending', order: 2 },
        { startTime: '11:30', title: 'Brunch service', owner: 'Caterer', status: 'pending', order: 3 },
        { startTime: '13:00', title: 'Event concludes', owner: 'Coordinator', status: 'pending', order: 4 },
    ],
    custom: [],
}

// Get all timeline items for a function
export function getTimelineForFunction(functionId: string): TimelineItem[] {
    return timelineItems
        .filter(item => item.functionId === functionId)
        .sort((a, b) => a.order - b.order)
}

// Get all timeline items for an event
export function getTimelineForEvent(eventId: string): TimelineItem[] {
    return timelineItems
        .filter(item => item.eventId === eventId)
        .sort((a, b) => {
            if (a.startTime !== b.startTime) {
                return a.startTime.localeCompare(b.startTime)
            }
            return a.order - b.order
        })
}

// Create a timeline item
export function createTimelineItem(data: Omit<TimelineItem, 'id' | 'createdAt' | 'updatedAt'>): TimelineItem {
    const item: TimelineItem = {
        ...data,
        id: `timeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
    timelineItems.push(item)
    return item
}

// Update a timeline item
export function updateTimelineItem(id: string, updates: Partial<TimelineItem>): TimelineItem | null {
    const index = timelineItems.findIndex(item => item.id === id)
    if (index === -1) return null

    timelineItems[index] = {
        ...timelineItems[index],
        ...updates,
        updatedAt: new Date().toISOString(),
    }
    return timelineItems[index]
}

// Delete a timeline item
export function deleteTimelineItem(id: string): boolean {
    const index = timelineItems.findIndex(item => item.id === id)
    if (index === -1) return false

    timelineItems.splice(index, 1)
    return true
}

// Update status
export function updateTimelineStatus(id: string, status: TimelineStatus): TimelineItem | null {
    return updateTimelineItem(id, {
        status,
        ...(status === 'in_progress' ? { actualStartTime: new Date().toISOString() } : {}),
        ...(status === 'completed' ? { actualEndTime: new Date().toISOString() } : {}),
    })
}

// Apply a template to a function
export function applyTemplateToFunction(
    functionId: string,
    eventId: string,
    functionType: FunctionType
): TimelineItem[] {
    const template = TIMELINE_TEMPLATES[functionType] || []
    const items: TimelineItem[] = []

    template.forEach(item => {
        const newItem = createTimelineItem({
            ...item,
            functionId,
            eventId,
        })
        items.push(newItem)
    })

    return items
}

// Get timeline stats
export function getTimelineStats(functionId: string) {
    const items = getTimelineForFunction(functionId)
    return {
        total: items.length,
        pending: items.filter(i => i.status === 'pending').length,
        inProgress: items.filter(i => i.status === 'in_progress').length,
        completed: items.filter(i => i.status === 'completed').length,
        delayed: items.filter(i => i.status === 'delayed').length,
    }
}
