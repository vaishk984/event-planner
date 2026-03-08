# PlannerOS - Project Context

> **Use this document to onboard AI assistants or new team members to the project.**

---

## The Problem We Solve

**Indian wedding and event planners face a fragmented workflow nightmare:**

### 1. Vendor Chaos
Planners juggle 15-30+ vendors per event across WhatsApp, email, and phone calls. Quote requests get lost, pricing negotiations are scattered across chats, and there's no central record of agreements.

### 2. Budget Blindness
Tracking expenses across multiple functions (Sangeet, Mehendi, Wedding, Reception) with different vendors leads to budget overruns. Planners often discover they're over budget when it's too late.

### 3. Payment Tracking Hell
Managing deposits, milestones, and final payments to dozens of vendors with different schedules causes missed payments, duplicate payments, and cash flow issues.

### 4. Client Communication Gaps
No single source of truth for client preferences, event history, or lifecycle value. Planners lose repeat business because they can't track relationships.

### 5. Multi-Event Complexity
Indian weddings have 5-10+ separate functions, each needing its own venue, vendors, timeline, and budget. Managing this complexity manually leads to errors.

---

## Our Solution

**PlannerOS is an all-in-one B2B SaaS platform** that gives wedding planners a complete operating system:

| Feature | Benefit |
|---------|---------|
| **Unified Vendor Management** | Send quote requests, negotiate, and confirm bookings all in one place with full audit trail |
| **Smart Budget Tracking** | Real-time budget vs actual spending by category and function with overspend alerts |
| **Payment Scheduler** | Track all vendor payments, get overdue alerts, and maintain payment history |
| **Client CRM** | Track client relationships, preferences, lifetime value, and event history |
| **Multi-Function Support** | Native support for Indian wedding complexity with multiple sub-events per main event |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16 (App Router), React, TailwindCSS |
| **Backend** | Next.js API Routes with layered architecture |
| **Database** | Supabase (PostgreSQL) with Row Level Security |
| **Validation** | Zod schemas for DTOs |
| **Auth** | Supabase Auth |

---

## Architecture Pattern

Clean layered architecture:

```
API Routes → Controllers → Services → Repositories → Database
```

### Key Directories

| Directory | Purpose |
|-----------|---------|
| `src/backend/entities/` | Domain models with Row types |
| `src/backend/dto/request/` | Zod-validated request schemas |
| `src/backend/repositories/` | Database layer (extends BaseRepository) |
| `src/backend/services/` | Business logic layer |
| `src/backend/controllers/` | Thin controllers delegating to services |
| `app/api/v1/` | Next.js route handlers with middleware |
| `lib/actions/` | Frontend server actions |

---

## Core Entities

| Entity | Purpose |
|--------|---------|
| **Event** | Main event container |
| **EventFunction** | Sub-events (Sangeet, Mehendi, Reception, etc.) |
| **BookingRequest** | Planner-vendor workflow with status machine |
| **BudgetItem** | Budget tracking by category |
| **Payment** | Financial transactions + overdue detection |
| **Message** | Planner-vendor communication threads |
| **Client** | CRM with preferences + lifetime value |
| **Vendor** | Vendor profiles and services |
| **Lead** | Lead management and scoring |
| **Task** | Checklist/task management |

---

## API Endpoints

### Core APIs
- `/api/v1/events` - Event CRUD + status management
- `/api/v1/vendors` - Vendor management
- `/api/v1/leads` - Lead management + scoring
- `/api/v1/tasks` - Checklist management
- `/api/v1/timeline` - Timeline management

### New APIs (Recently Implemented)
- `/api/v1/bookings` - Quote workflow (submit, accept, decline, cancel)
- `/api/v1/budget` - Budget CRUD + event summaries + categories
- `/api/v1/payments` - Payment tracking + complete + overdue alerts
- `/api/v1/messages` - Messaging + read tracking
- `/api/v1/clients` - CRM + search + high-value filtering

---

## Database

Supabase PostgreSQL with:
- **9 migration files** in `supabase/migrations/`
- **Full RLS policies** for multi-tenant security
- **Performance indexes** on all key columns

### Recent Tables Added
- `clients` - CRM data with preferences
- `event_functions` - Sub-events per main event
- `booking_requests` - Vendor workflow with status machine
- `budget_items` - Budget tracking
- `financial_payments` - Payment records
- `booking_messages` - Communication threads

---

## Key Files to Reference

| File | Purpose |
|------|---------|
| `docs/planning/MASTER_PLAN.md` | Project roadmap and phases |
| `docs/DEVELOPMENT_RULEBOOK.md` | Coding standards and conventions |
| `docs/ARCHITECTURE.md` | System architecture details |
| `src/backend/repositories/BaseRepository.ts` | Repository pattern implementation |
| `src/backend/middleware/` | Auth, logging, rate limiting middleware |

---

## Frontend Server Actions

Located in `lib/actions/`:
- `event-actions.ts` - Event operations
- `booking-actions.ts` - Booking workflow
- `budget-actions.ts` - Budget management
- `payment-actions.ts` - Payment tracking
- `message-actions.ts` - Messaging
- `client-actions.ts` - CRM operations

---

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# Run database migrations
# (Apply migrations in supabase/migrations/ to your Supabase instance)

# Start development server
npm run dev
```

---

*Last Updated: February 2026*
