# Implementation Plan - PlannerOS

## Goal Description
Build "PlannerOS", a comprehensive SaaS platform for Event Planning Agencies. The system streamlines the entire lifecycle of an event from initial setup and client consultation to live execution and financial closure.

## User Review Required
> [!IMPORTANT]
> **Tech Stack Selection**: I propose using **Next.js** (React) for the framework due to its suitability for SaaS applications (SEO, Routing, Server Components). For styling, **Tailwind CSS** is recommended for rapid, modern UI development. Please confirm if this works or if you prefer a different stack (e.g., Vite/React, plain HTML/CSS).

## Proposed Architecture

### Tech Stack (Zero Investment & High Performance)
- **Framework**: Next.js 14+ (App Router)
    - *Comparison*: Chosen over independent Express/React for easier "Zero Investment" deployment on Vercel (no cold starts, integrated API routes).
- **Backend Services**: Next.js API Routes (serverless) + Supabase (BaaS).
- **Database**: Supabase (PostgreSQL) - *Free Tier handles Auth, DB, Storage, Realtime*.
- **Styling**: Tailwind CSS + Shadcn/UI (for minimalist, premium look).
- **CI/CD**: GitHub Actions -> Vercel (Frontend/API).
- **Mobile Companion**: Mobile-responsive Web App initially (PWA), React Native (Expo) for Phase 2.

### Core Modules (Modular Architecture)
1.  **Module 1: Authentication & Roles**
    - Supabase Auth with Row Level Security (RLS).
    - Roles: Admin, Planner, Vendor, Client.
2.  **Module 2: Event Management**
    - "Draft -> Planned -> Live" State Machine.
    - Vision Board with storage in Supabase Storage.
3.  **Module 3: Planning Engine (The Brain)**
    - Feasibility logic executed via server-side logic (Next.js Actions).
4.  **Module 4: Vendor Availability**
    - Real-time availability checks using Supabase Realtime.
5.  **Module 5: Task Dispatch**
    - Auto-generation of tasks triggers.
6.  **Module 6: Live Execution**
    - "Mission Control" dashboard with live updates.
7.  **Module 7: Settlement**
    - Invoicing and simple payout tracking.

## Proposed Changes (Initial Setup)

### System
#### [NEW] /planner-os (Root Directory)
- Initialize Next.js project with Tailwind.
- Install `supabase-js`, `lucide-react`, `shadcn-ui`.

### Environment Management
- `.env.local` for Supabase keys (anon key + URL).

### Component Structure
- `/app/(auth)`: Route groups for login/signup.
- `/app/(dashboard)`: Protected dashboard routes.
- `/lib/supabase`: Supabase Client initialization.
- `/components/modules`: Feature-specific components (e.g., `EventWizard`).

## Verification Plan

### Automated Tests
- Run `npm run build` to ensure type safety and build validity.
- Use `npm run lint` for code quality.

### Manual Verification
- **Phase 0 Check**: Verify Admin can add a Team Member and a Vendor.
- **Phase 1 Check**: Verify "New Event" flow creates a Vision Board.
- **Phase 2 Check**: Verify "Feasibility Check" logic correctly flags conflict (mocked).
