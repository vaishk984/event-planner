# Run Sheet / Timeline Builder

## Goal
Create minute-level timeline planning for event day execution. Each function gets its own run sheet with activities, times, and responsible parties.

---

## Example Run Sheet (Wedding Day)

| Time | Activity | Owner | Status |
|------|----------|-------|--------|
| 6:00 AM | Decor setup begins | Decorator | ⏳ |
| 9:00 AM | Sound check | DJ Team | ⏳ |
| 11:00 AM | Groom arrival | Coordinator | ⏳ |
| 12:00 PM | Wedding ceremony | Pandit | ⏳ |
| 2:00 PM | Lunch service | Caterer | ⏳ |
| 6:00 PM | Reception setup | Decorator | ⏳ |
| 7:30 PM | Couple entry | Anchor | ⏳ |

---

## Data Model

```typescript
export interface TimelineItem {
    id: string;
    functionId: string;
    eventId: string;
    
    startTime: string;      // "06:00"
    endTime?: string;
    duration?: number;      // minutes
    
    title: string;
    description?: string;
    location?: string;
    
    owner: string;          // "Decorator", "DJ"
    vendorId?: string;
    
    status: 'pending' | 'in_progress' | 'completed' | 'delayed';
    notes?: string;
    
    dependsOn?: string[];
}
```

---

## UI Components

### TimelinePanel
- Vertical timeline with time slots
- Status indicators (pending/in-progress/completed/delayed)
- Click to edit items
- Drag to reorder

### Quick Templates
- Wedding Ceremony template
- Reception template
- Sangeet template

---

## Files
- `types/domain.ts` - TimelineItem type
- `lib/stores/timeline-store.ts` - CRUD operations
- `components/events/timeline-panel.tsx` - UI component
