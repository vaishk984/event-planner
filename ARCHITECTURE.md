# PlannerOS: System Architecture & Design Patterns

**Version:** 2.0  
**Last Updated:** 2024-12-31  
**Status:** Active Reference Document

> ⚠️ **IMPORTANT:** This document is the single source of truth for all development decisions. Reference it before implementing any feature.

---

## 1. Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                 │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Planner    │  │    Client    │  │    Vendor    │              │
│  │   Portal     │  │    Portal    │  │    Portal    │              │
│  │  (Desktop)   │  │   (Mobile)   │  │   (Mobile)   │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER (Next.js)                     │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐│
│  │   Pages/    │  │ Components  │  │  Providers  │  │   Hooks    ││
│  │   Routes    │  │    (UI)     │  │  (Context)  │  │  (Logic)   ││
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘│
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │
│  │   Server    │  │    API      │  │ Middleware  │               │
│  │   Actions   │  │   Routes    │  │  (Auth)     │               │
│  └─────────────┘  └─────────────┘  └─────────────┘               │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       SERVICE LAYER (lib/)                           │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐│
│  │   Domain    │  │    Data     │  │  Business   │  │  External  ││
│  │   Models    │  │   Access    │  │    Logic    │  │  Services  ││
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘│
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     DATA LAYER (Supabase)                            │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐│
│  │  PostgreSQL │  │   Storage   │  │  Realtime   │  │    Auth    ││
│  │     (RLS)   │  │   (Files)   │  │ (WebSocket) │  │   (JWT)    ││
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Module Architecture

```
planner-os/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/              # Planner protected routes
│   │   └── planner/
│   ├── (client)/                 # Client public routes
│   │   └── client/[token]/
│   ├── (vendor)/                 # Vendor protected routes
│   │   └── vendor/
│   ├── (capture)/                # Full-screen capture mode
│   │   └── capture/
│   └── api/                      # API routes
│       └── v1/
│
├── components/                    # Reusable UI components
│   ├── ui/                       # Atomic components (Button, Input)
│   ├── layout/                   # Layout components (Sidebar, Header)
│   ├── features/                 # Feature components
│   │   ├── events/
│   │   ├── vendors/
│   │   ├── proposals/
│   │   └── tasks/
│   └── providers/                # Context providers
│
├── lib/                          # Business logic & utilities
│   ├── domain/                   # Domain models & types
│   │   ├── event.ts
│   │   ├── vendor.ts
│   │   ├── task.ts
│   │   └── proposal.ts
│   ├── services/                 # Business logic services
│   │   ├── event-service.ts
│   │   ├── vendor-service.ts
│   │   └── proposal-service.ts
│   ├── repositories/             # Data access layer
│   │   ├── event-repository.ts
│   │   ├── vendor-repository.ts
│   │   └── base-repository.ts
│   ├── utils/                    # Pure utility functions
│   └── config/                   # Configuration constants
│
├── hooks/                        # Custom React hooks
│   ├── use-events.ts
│   ├── use-vendors.ts
│   └── use-auth.ts
│
└── types/                        # TypeScript type definitions
    ├── database.ts               # Database schema types
    ├── api.ts                    # API request/response types
    └── index.ts                  # Shared types
```

---

## 2. Design Patterns

### 2.1 Repository Pattern

All data access goes through repositories. Never access database directly from components.

```typescript
// lib/repositories/base-repository.ts
export abstract class BaseRepository<T> {
  protected abstract tableName: string;
  
  async findById(id: string): Promise<T | null> { ... }
  async findMany(filter?: Partial<T>): Promise<T[]> { ... }
  async create(data: Omit<T, 'id' | 'createdAt'>): Promise<T> { ... }
  async update(id: string, data: Partial<T>): Promise<T> { ... }
  async delete(id: string): Promise<void> { ... }
}

// lib/repositories/event-repository.ts
export class EventRepository extends BaseRepository<Event> {
  protected tableName = 'events';
  
  async findByPlannerId(plannerId: string): Promise<Event[]> { ... }
  async findByStatus(status: EventStatus): Promise<Event[]> { ... }
}
```

### 2.2 Service Pattern

Business logic lives in services. Services orchestrate repositories.

```typescript
// lib/services/event-service.ts
export class EventService {
  constructor(
    private eventRepo: EventRepository,
    private vendorRepo: VendorRepository,
    private taskRepo: TaskRepository
  ) {}
  
  async createEventFromSubmission(submission: ClientSubmission): Promise<Event> {
    // 1. Validate submission
    // 2. Create event record
    // 3. Link vendors
    // 4. Return created event
  }
  
  async lockEvent(eventId: string): Promise<Event> {
    // 1. Validate can lock
    // 2. Update status
    // 3. Generate tasks
    // 4. Notify vendors
  }
}
```

### 2.3 Domain Model Pattern

Each entity has a well-defined domain model with validation.

```typescript
// lib/domain/event.ts
export interface Event {
  id: string;
  plannerId: string;
  clientId?: string;
  status: EventStatus;
  type: EventType;
  date: string;
  endDate?: string;
  guestCount: number;
  budgetMin: number;
  budgetMax: number;
  city: string;
  venueType: 'personal' | 'showroom';
  createdAt: string;
  updatedAt: string;
}

export type EventStatus = 
  | 'draft'      // Initial creation
  | 'planning'   // In design phase
  | 'proposed'   // Sent to client
  | 'approved'   // Client approved (LOCKED)
  | 'live'       // Event day
  | 'completed'  // All tasks done
  | 'archived';  // Closed

export const EventValidation = {
  canEdit: (event: Event) => !['approved', 'live', 'completed', 'archived'].includes(event.status),
  canApprove: (event: Event) => event.status === 'proposed',
  canAddVendors: (event: Event) => ['draft', 'planning'].includes(event.status),
};
```

### 2.4 Provider Pattern (State Management)

Global state via React Context with typed providers.

```typescript
// components/providers/event-provider.tsx
interface EventContextValue {
  currentEvent: Event | null;
  loading: boolean;
  error: Error | null;
  actions: {
    loadEvent: (id: string) => Promise<void>;
    updateEvent: (data: Partial<Event>) => Promise<void>;
    addVendor: (vendorId: string) => Promise<void>;
    removeVendor: (vendorId: string) => Promise<void>;
  };
}

export const EventProvider: React.FC<PropsWithChildren> = ({ children }) => {
  // Implementation
};

export const useEvent = () => useContext(EventContext);
```

---

## 3. Data Flow

### 3.1 Read Flow (Query)

```
Component → Hook → Repository → Supabase → Data
    ↑                                        │
    └────────────────────────────────────────┘
```

### 3.2 Write Flow (Mutation)

```
Component → Action → Service → Repository → Supabase
                        │
                        └→ Validate
                        └→ Transform
                        └→ Side Effects
```

---

## 4. API Contracts

### 4.1 Response Format

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  meta?: {
    count?: number;
    page?: number;
    limit?: number;
  };
}
```

### 4.2 Action Result Pattern

```typescript
type ActionResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string; code?: string };
```

---

## 5. State Machine Definitions

### 5.1 Event States
- `draft` → `planning` → `proposed` → `approved` → `live` → `completed` → `archived`

### 5.2 Task States
- `pending` → `accepted`/`rejected` → `in_progress` → `completed`

---

## 6. Security Rules

| Resource | Planner | Client | Vendor |
|----------|---------|--------|--------|
| Events (own) | CRUD | Read | Read |
| Proposals | CRUD | Read/Approve | None |
| Tasks | CRUD | Read | Update (own) |

---

## 7. Coding Standards

### 7.1 File Naming
- Components: `PascalCase.tsx`
- Utilities: `kebab-case.ts`
- Hooks: `use-camelCase.ts`

### 7.2 Import Aliases
```typescript
import { X } from '@/components/ui/x';
import { X } from '@/lib/services/x';
import type { X } from '@/types';
```

---

## 8. Development Checklist

Before implementing any feature:
- [ ] Check this architecture doc
- [ ] Define types first
- [ ] Create domain model
- [ ] Implement repository
- [ ] Implement service
- [ ] Create server action
- [ ] Build UI last
- [ ] Add error handling
