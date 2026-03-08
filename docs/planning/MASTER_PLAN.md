# PlannerOS - System Design & Development Planning

## Overview
PlannerOS is a professional event planning platform designed for Indian wedding planners. It supports the complete workflow from client intake to event day execution.

---

## Domain Knowledge (Wedding Planning)

### Planner Mindset
Planners think: **"What must happen, when, and who is responsible?"**
- Sequencing → Coordination → Fallbacks → Guest Experience

### 9 Planning Phases
1. **Concept** - Theme, style, mood board
2. **Multi-Day Breakdown** - Mehendi, Sangeet, Wedding, Reception
3. **Service Planning** - Assign vendors per function
4. **Budget Allocation** - Category-wise splits
5. **Timeline/Run Sheet** - Minute-level schedules
6. **Vendor Coordination** - Task lists, confirmations
7. **Risk Planning** - Backups, contingencies
8. **Event Day Execution** - Live dashboard
9. **Post-Event Closure** - Invoicing, ratings

### 8 Service Categories
1. Venue & Infrastructure
2. Decoration & Design
3. Food & Beverage
4. Entertainment
5. Photography & Video
6. Bridal & Groom Services
7. Logistics
8. Guest Experience

### Budget Split (Industry Standard)
| Category | % Range |
|----------|---------|
| Venue | 20-30% |
| Food | 25-35% |
| Decor | 15-25% |
| Entertainment | 5-10% |
| Photography | 5-10% |
| Logistics | 5-10% |

---

## Development Roadmap

### ✅ Phase 1: Foundation
- [x] Multi-day event structure (EventFunction type)
- [x] Functions panel with quick-add templates
- [x] Per-function venues, dates, guests, budgets

### 🔄 Phase 2: Timeline Builder (Current)
- [ ] TimelineItem type
- [ ] Run sheet UI per function
- [ ] Activity scheduling with owners
- [ ] Status tracking

### 📋 Phase 3: Budget Management
- [ ] Category-wise budget splits
- [ ] Over-budget warnings
- [ ] Rebalancing tools

### 📋 Phase 4: Vendor Coordination
- [ ] Per-function vendor assignment
- [ ] Task lists for vendors
- [ ] Proof-of-work uploads

### 📋 Phase 5: Event Day Dashboard
- [ ] Live status view
- [ ] Delay alerts
- [ ] At-risk item highlighting

### 📋 Phase 6: Post-Event
- [ ] Auto-invoice generation
- [ ] Vendor payouts
- [ ] Ratings & feedback

---

## Architecture

### Route Structure
```
/planner          - Planner dashboard
/planner/events   - Event list
/planner/events/[id]/functions  - Multi-day functions
/planner/events/[id]/timeline   - Run sheets
/vendor           - Vendor portal (blue theme)
/client/proposal/[token]        - Client proposal view
```

### Key Types
- `Event` - Main event container
- `EventFunction` - Sub-events (Mehendi, Wedding, etc.)
- `TimelineItem` - Activities in run sheet
- `BookingRequest` - Planner ↔ Vendor connection
