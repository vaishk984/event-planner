# PlannerOS Development Rulebook

> **Version:** 1.0  
> **Last Updated:** January 2026  
> **Purpose:** Standards and guidelines for consistent development across the PlannerOS codebase

---

## Table of Contents

1. [Project Architecture](#1-project-architecture)
2. [Directory Structure](#2-directory-structure)
3. [Backend Development Rules](#3-backend-development-rules)
4. [Frontend Development Rules](#4-frontend-development-rules)
5. [API Design Standards](#5-api-design-standards)
6. [Coding Conventions](#6-coding-conventions)
7. [Security Guidelines](#7-security-guidelines)
8. [Testing Standards](#8-testing-standards)

---

## 1. Project Architecture

### 1.1 Core Principles

| Principle | Description |
|-----------|-------------|
| **Layered Architecture** | Strict separation: Controllers → Services → Repositories |
| **Single Responsibility** | Each class/module has one clear purpose |
| **Dependency Injection** | Use the DI container for service management |
| **Domain-Driven Design** | Rich domain entities with business logic |
| **DTO Pattern** | Never expose entities directly to API clients |

### 1.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │  Components │ →  │   Hooks     │ →  │   API Client        │  │
│  └─────────────┘    └─────────────┘    └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                         API LAYER                                │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │ API Routes  │ →  │ Middleware  │ →  │   Controllers       │  │
│  └─────────────┘    └─────────────┘    └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      BUSINESS LAYER                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │  Services   │ ←→ │  Entities   │    │   Exceptions        │  │
│  └─────────────┘    └─────────────┘    └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                 │
│  ┌─────────────┐                       ┌─────────────────────┐  │
│  │ Repositories│ ──────────────────→   │   Supabase          │  │
│  └─────────────┘                       └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 Layer Responsibilities

| Layer | Responsibility | ❌ NOT Allowed |
|-------|----------------|----------------|
| **Controllers** | Parse requests, call services, return responses | Business logic, database access |
| **Services** | Business logic, validation, orchestration | Direct HTTP handling, SQL |
| **Repositories** | Data access, CRUD operations | Business rules, HTTP concerns |
| **Entities** | Domain models, state machines | Database operations |

---

## 2. Directory Structure

### 2.1 Required Structure

```
planner-os-main/
├── src/
│   ├── backend/                 # All server-side code
│   │   ├── config/              # App configuration
│   │   ├── controllers/         # Request handlers
│   │   ├── core/                # DI container, infrastructure
│   │   ├── dto/                 # Data transfer objects
│   │   │   ├── request/         # Input validation schemas
│   │   │   └── response/        # Output mappers
│   │   ├── entities/            # Domain models
│   │   ├── exceptions/          # Custom error classes
│   │   ├── middleware/          # Cross-cutting concerns
│   │   ├── repositories/        # Data access layer
│   │   ├── services/            # Business logic
│   │   └── utils/               # Shared utilities
│   ├── frontend/                # Client-side utilities
│   │   ├── hooks/               # React hooks
│   │   └── services/            # API client
│   └── shared/                  # Shared types
├── app/                         # Next.js app router
│   └── api/v1/                  # Versioned API routes
└── components/                  # React components
```

### 2.2 File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Entity | `PascalCase.ts` | `Event.ts`, `Vendor.ts` |
| Service | `PascalCase + Service.ts` | `EventService.ts` |
| Repository | `PascalCase + Repository.ts` | `EventRepository.ts` |
| Controller | `PascalCase + Controller.ts` | `EventController.ts` |
| DTO | `kebab-case.dto.ts` | `event.dto.ts` |
| Middleware | `kebab-case.middleware.ts` | `auth.middleware.ts` |
| Index files | `index.ts` | Required in every folder |

---

## 3. Backend Development Rules

### 3.1 Entity Rules

```typescript
// ✅ CORRECT: Entity with business logic
export class Event extends BaseEntity {
  // Domain methods
  canTransitionTo(status: EventStatus): boolean { ... }
  
  // Factory methods
  static fromDatabase(data: Record<string, unknown>): Event { ... }
  
  // Serialization
  toJSON(): EventData { ... }
}

// ❌ WRONG: Anemic entity with no logic
export class Event {
  id: string;
  name: string;
  // Just data, no methods
}
```

### 3.2 Service Rules

```typescript
// ✅ CORRECT: Service orchestrates business logic
export class EventService {
  constructor(private eventRepo: EventRepository) {}
  
  async updateStatus(id: string, status: EventStatus): Promise<EventResponseDto> {
    const event = await this.eventRepo.findByIdOrThrow(id);
    
    // Business rule validation
    if (!event.canTransitionTo(status)) {
      throw new BusinessException('Invalid transition');
    }
    
    const updated = await this.eventRepo.updateStatus(id, status);
    return EventMapper.toResponse(updated);
  }
}

// ❌ WRONG: Service with HTTP concerns
export class EventService {
  async updateStatus(request: NextRequest) { // NO! Request belongs in controller
    const body = await request.json();
    // ...
  }
}
```

### 3.3 Repository Rules

```typescript
// ✅ CORRECT: Repository handles data access only
export class EventRepository extends BaseRepository<Event, EventRow> {
  async findByStatus(status: EventStatus): Promise<Event[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('status', status);
    // ...
  }
}

// ❌ WRONG: Repository with business logic
export class EventRepository {
  async updateStatus(id: string, status: string) {
    // Business validation should NOT be here
    if (status === 'completed' && !event.hasAllTasksDone()) { 
      throw new Error('Cannot complete'); // NO! This belongs in Service
    }
  }
}
```

### 3.4 Controller Rules

```typescript
// ✅ CORRECT: Thin controller delegates to service
export class EventController {
  async create(request: NextRequest): Promise<NextResponse> {
    const body = await validateBody(request, CreateEventSchema);
    const userId = await this.getAuthenticatedUserId(request);
    
    const result = await this.eventService.create(body, userId);
    
    return ApiResponse.created(result);
  }
}

// ❌ WRONG: Fat controller with business logic
export class EventController {
  async create(request: NextRequest) {
    const body = await request.json();
    
    // NO! Business logic should be in service
    if (body.budgetMin > body.budgetMax) {
      throw new Error('Invalid budget');
    }
    
    // NO! Database access should be in repository
    const { data } = await supabase.from('events').insert(body);
  }
}
```

### 3.5 DTO & Validation Rules

```typescript
// ✅ CORRECT: Zod schema for request validation
export const CreateEventSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(['wedding', 'corporate', 'birthday', 'social', 'other']),
  date: z.string().datetime(),
  budgetMin: z.number().positive(),
  budgetMax: z.number().positive(),
}).refine(data => data.budgetMax >= data.budgetMin, {
  message: 'Max budget must be >= min budget',
});

// Response DTOs use interfaces + mappers
export interface EventResponseDto {
  id: string;
  name: string;
  // Only expose what client needs
}

export class EventMapper {
  static toResponse(event: Event): EventResponseDto { ... }
}
```

### 3.6 Exception Handling

```typescript
// Use specific exception types
throw new NotFoundException('Event', id);           // 404
throw new ValidationException(zodErrors);          // 400
throw new UnauthorizedException('Invalid token');  // 401
throw new ForbiddenException('Not your event');    // 403
throw new ConflictException.duplicate('Event', 'name', name);  // 409
throw new BusinessException('Cannot complete event with pending tasks');  // 422
```

---

## 4. Frontend Development Rules

### 4.1 API Client Usage

```typescript
// ✅ CORRECT: Use typed API services
import { eventApi } from '@/src/frontend/services';

const events = await eventApi.list({ page: 1, status: 'active' });
const event = await eventApi.getById(id);

// ❌ WRONG: Direct fetch calls
const response = await fetch('/api/v1/events'); // NO! Use eventApi
```

### 4.2 React Hooks

```typescript
// ✅ CORRECT: Use custom hooks for data fetching
function EventList() {
  const { events, isLoading, error, refetch } = useEvents({ status: 'active' });
  
  if (isLoading) return <Loading />;
  if (error) return <Error error={error} />;
  
  return <EventTable events={events} />;
}

// ❌ WRONG: useEffect with manual fetch
function EventList() {
  const [events, setEvents] = useState([]);
  
  useEffect(() => {
    fetch('/api/v1/events')  // NO! Use hooks
      .then(r => r.json())
      .then(setEvents);
  }, []);
}
```

---

## 5. API Design Standards

### 5.1 URL Structure

```
/api/v1/{resource}           # Collection (GET list, POST create)
/api/v1/{resource}/{id}      # Single item (GET, PUT, DELETE)
/api/v1/{resource}/{id}/{action}  # Actions (POST/PATCH)
```

### 5.2 HTTP Methods

| Method | Purpose | Request Body | Response |
|--------|---------|--------------|----------|
| GET | Retrieve | None | Resource(s) |
| POST | Create | Full resource | Created resource |
| PUT | Full update | Full resource | Updated resource |
| PATCH | Partial update | Changed fields | Updated resource |
| DELETE | Remove | None | 204 or deleted ID |

### 5.3 Response Format

```typescript
// Success response
{
  "success": true,
  "data": { ... },
  "meta": { "timestamp": "2026-01-27T..." }
}

// Paginated response
{
  "success": true,
  "data": { "items": [...], "meta": { "page": 1, "limit": 20, "total": 100 } }
}

// Error response
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Event not found",
    "details": { "id": "abc123" }
  }
}
```

### 5.4 Status Codes

| Code | Usage |
|------|-------|
| 200 | Successful GET/PUT/PATCH |
| 201 | Successful POST (created) |
| 204 | Successful DELETE (no content) |
| 400 | Validation error |
| 401 | Not authenticated |
| 403 | Not authorized |
| 404 | Resource not found |
| 409 | Conflict (duplicate) |
| 422 | Business rule violation |
| 500 | Server error |

---

## 6. Coding Conventions

### 6.1 TypeScript Rules

- **Strict mode** enabled (`strict: true`)
- **No `any`** - use `unknown` and type guards
- **Export types** with `type` keyword when only used as types
- **Prefer interfaces** over type aliases for objects

### 6.2 Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Classes | PascalCase | `EventService` |
| Functions | camelCase | `getEventById` |
| Constants | UPPER_SNAKE | `MAX_PAGE_SIZE` |
| Interfaces | PascalCase | `EventData` |
| Type aliases | PascalCase | `EventStatus` |
| Enums | PascalCase | `EventType` |
| Files | kebab-case or PascalCase | `event-api.ts` or `EventService.ts` |

### 6.3 Import Order

```typescript
// 1. External packages
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// 2. Internal absolute imports
import { EventService } from '@/src/backend/services';
import { ApiResponse } from '@/src/backend/utils';

// 3. Relative imports
import { validateBody } from '../middleware';
```

### 6.4 Documentation

```typescript
/**
 * Brief description of the class/function.
 * 
 * @param id - Event identifier
 * @returns The event or null if not found
 * @throws NotFoundException if event doesn't exist
 */
```

---

## 7. Security Guidelines

### 7.1 Authentication

- All protected routes require valid JWT in `Authorization: Bearer <token>`
- Use `withAuth` middleware for protected endpoints
- Never trust client-side auth state for server decisions

### 7.2 Authorization

- Check resource ownership in services, not controllers
- Use role-based permissions from auth config
- Log all authorization failures

### 7.3 Data Validation

- **Always validate** incoming data with Zod schemas
- **Sanitize** user input before database queries
- **Never** expose internal IDs or sensitive data

### 7.4 Rate Limiting

- API endpoints use rate limiting middleware
- Default: 100 requests per IP per minute
- Adjust per endpoint based on cost

---

## 8. Testing Standards

### 8.1 Test Categories

| Type | Purpose | Location |
|------|---------|----------|
| Unit | Test single functions/classes | `*.test.ts` |
| Integration | Test service + repo together | `*.integration.test.ts` |
| E2E | Test full API flows | `e2e/*.test.ts` |

### 8.2 Test Naming

```typescript
describe('EventService', () => {
  describe('updateStatus', () => {
    it('should transition from draft to proposal_sent', () => { ... });
    it('should throw BusinessException for invalid transition', () => { ... });
  });
});
```

---

## Quick Reference Card

| When you need to... | Go to... |
|---------------------|----------|
| Add a new entity | `src/backend/entities/` |
| Add validation schema | `src/backend/dto/request/` |
| Add business logic | `src/backend/services/` |
| Add database query | `src/backend/repositories/` |
| Add API endpoint | `app/api/v1/` + `src/backend/controllers/` |
| Add React data hook | `src/frontend/hooks/` |
| Add cross-cutting logic | `src/backend/middleware/` |
| Throw an error | Use exceptions from `src/backend/exceptions/` |

---

> **Remember:** When in doubt, follow existing patterns in the codebase. Consistency is key!
