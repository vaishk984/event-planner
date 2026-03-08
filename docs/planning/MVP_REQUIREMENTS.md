# PlannerOS MVP Feature Requirements

> What needs to be built BEFORE production checklist

---

## Current State Analysis

### ✅ What's Already Built

| Area | Features | Status |
|------|----------|--------|
| **Backend Entities** | Event, Function, Booking, Budget, Payment, Message, Client, Vendor, Lead, Task, Timeline | ✅ Complete |
| **API Routes** | 30+ endpoints across all entities | ✅ Complete |
| **Planner Dashboard** | Event list, event details, leads, tasks, invoices, quotes pages | 🟡 UI Only |
| **Vendor Portal** | Bookings, calendar, earnings, profile pages | 🟡 UI Only |
| **Admin Portal** | Planners list, vendors list pages | 🟡 UI Only |
| **Auth Pages** | Login, signup forms | 🟡 Mock Auth |

### ❌ What's Missing (Critical Gaps)

| Gap | Impact | Priority |
|-----|--------|----------|
| Real Supabase Auth | Can't actually log in users | 🔴 CRITICAL |
| Role-Based Access Control | No planner/vendor/admin separation | 🔴 CRITICAL |
| Frontend-Backend Integration | UI doesn't call real APIs | 🔴 CRITICAL |
| Data Persistence | Pages use mock data | 🔴 CRITICAL |
| Onboarding Flow | No way to create planner/vendor accounts | 🟠 HIGH |

---

## MVP Feature Roadmap (Before Production)

### Phase 0: Authentication & Roles (Week 1) 🔴 CRITICAL

```
Must complete FIRST - everything depends on this
```

#### 0.1 Supabase Auth Integration
- [ ] Replace mock auth with real Supabase Auth
- [ ] Create `auth/actions.ts` for login/signup/logout
- [ ] Store JWT token properly (httpOnly cookies)
- [ ] Add password reset flow
- [ ] Add email verification

#### 0.2 User Roles & Database
- [ ] Create `users` table extending `auth.users`
- [ ] Add `role` column: 'planner' | 'vendor' | 'admin'
- [ ] Create `planner_profiles` table
- [ ] Create `vendor_profiles` table
- [ ] Create `admin_profiles` table

#### 0.3 Role-Based Middleware
- [ ] Update middleware.ts with real JWT verification
- [ ] Route guards: /planner/* → planner role only
- [ ] Route guards: /vendor/* → vendor role only
- [ ] Route guards: /admin/* → admin role only
- [ ] Add 403 Forbidden page

#### 0.4 Signup Flows
- [ ] Planner signup form (name, email, company, phone)
- [ ] Vendor signup form (name, email, category, portfolio)
- [ ] Admin-only vendor verification workflow
- [ ] Email confirmation flow

---

### Phase 1: Planner Core Features (Week 2-3) 🟠 HIGH

```
Essential features for planner to manage events
```

#### 1.1 Event Management (Connect UI to API)
- [ ] Wire event list page to GET /api/v1/events
- [ ] Wire create event form to POST /api/v1/events
- [ ] Wire event details to GET /api/v1/events/:id
- [ ] Wire event update to PUT /api/v1/events/:id
- [ ] Wire delete event to DELETE /api/v1/events/:id
- [ ] Add event status workflow (draft → active → completed)

#### 1.2 Functions (Sub-Events) Management
- [ ] Wire function list to GET /api/v1/functions
- [ ] Wire create function form to POST /api/v1/functions
- [ ] Functions panel in event detail view
- [ ] Function templates (Mehendi, Sangeet, Wedding, Reception)
- [ ] Per-function date, venue, guest count

#### 1.3 Budget Tracking
- [ ] Budget overview widget on event page
- [ ] Budget items list with category breakdown
- [ ] Add/edit budget items
- [ ] Estimated vs Actual vs Paid tracking
- [ ] Over-budget warnings (red indicators)
- [ ] Category-wise pie chart

#### 1.4 Client (CRM) Management
- [ ] Client list page
- [ ] Client detail view
- [ ] Link client to event
- [ ] Client communication history
- [ ] Client lifetime value tracking

#### 1.5 Task Management
- [ ] Task list with filters (assignee, status, due date)
- [ ] Task creation with event/function context
- [ ] Task status: pending → in_progress → completed
- [ ] Task assignment to team members
- [ ] Overdue task alerts

---

### Phase 2: Vendor Features (Week 3-4) 🟠 HIGH

```
Essential features for vendors to respond to bookings
```

#### 2.1 Vendor Dashboard
- [ ] Wire dashboard stats to real data
- [ ] Active bookings count
- [ ] Pending quote requests
- [ ] Upcoming events calendar
- [ ] Earnings summary

#### 2.2 Booking Request Workflow
- [ ] View booking requests from planners
- [ ] Quote submission form
- [ ] Accept/Decline booking
- [ ] Booking status tracking
- [ ] Booking details (event info, requirements)

#### 2.3 Vendor Profile
- [ ] Profile edit form
- [ ] Portfolio/gallery upload
- [ ] Service categories selection
- [ ] Pricing information
- [ ] Availability calendar

#### 2.4 Vendor-Planner Messaging
- [ ] Message thread per booking
- [ ] Send/receive messages
- [ ] File attachment support
- [ ] Unread message indicators
- [ ] Real-time updates (optional)

---

### Phase 3: Planner-Vendor Workflow (Week 4-5) 🟡 MEDIUM

```
The core value proposition - connecting planners and vendors
```

#### 3.1 Vendor Discovery (for Planners)
- [ ] Vendor marketplace/search page
- [ ] Filter by category, location, price range
- [ ] Vendor profile view
- [ ] View vendor reviews/ratings
- [ ] "Favorite" vendor list

#### 3.2 Booking Request Flow (for Planners)
- [ ] Send quote request to vendor
- [ ] View received quotes
- [ ] Accept/Reject quote
- [ ] Booking confirmation
- [ ] Add booking to event budget

#### 3.3 Payment Tracking
- [ ] Payment schedule per booking
- [ ] Record payment made
- [ ] Payment reminders (due soon, overdue)
- [ ] Payment history
- [ ] Link payments to budget items

---

### Phase 4: Admin Portal (Week 5) 🟡 MEDIUM

```
Platform management for super admins
```

#### 4.1 User Management
- [ ] View all planners (list with search/filter)
- [ ] View all vendors (list with search/filter)
- [ ] Activate/deactivate accounts
- [ ] View user activity logs

#### 4.2 Vendor Verification
- [ ] Pending verification queue
- [ ] Review vendor documents
- [ ] Approve/Reject vendor
- [ ] Verification badge system

#### 4.3 Platform Analytics
- [ ] Total users (planners, vendors)
- [ ] Active events count
- [ ] Transaction volume
- [ ] Growth metrics

---

### Phase 5: Timeline & Run Sheets (Week 5-6) 🟢 NICE-TO-HAVE

```
Advanced feature for day-of event management
```

#### 5.1 Timeline Builder
- [ ] Create timeline items per function
- [ ] Time slots with activities
- [ ] Assign owner to each activity
- [ ] Drag-drop reordering

#### 5.2 Run Sheet View
- [ ] Printable run sheet
- [ ] Minute-by-minute schedule
- [ ] Activity completion tracking
- [ ] Live status dashboard (event day)

---

## Database Schema Additions Required

### New Tables Needed

```sql
-- User profiles extending Supabase auth
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    role TEXT NOT NULL CHECK (role IN ('planner', 'vendor', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Planner-specific profile
CREATE TABLE planner_profiles (
    id UUID PRIMARY KEY REFERENCES user_profiles(id),
    company_name TEXT NOT NULL,
    phone TEXT,
    city TEXT,
    experience_years INTEGER,
    bio TEXT
);

-- Extend vendor_profiles if not complete
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS verification_date TIMESTAMPTZ;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES user_profiles(id);
```

---

## Implementation Order (Recommended)

```
Week 1: Auth & Roles (Phase 0)
   ↓
Week 2: Planner Events & Functions (Phase 1.1, 1.2)
   ↓
Week 3: Planner Budget & CRM (Phase 1.3, 1.4, 1.5)
   ↓
Week 4: Vendor Portal (Phase 2)
   ↓
Week 5: Planner-Vendor Workflow + Admin (Phase 3, 4)
   ↓
Week 6: Timeline & Polish (Phase 5)
   ↓
Week 7+: Production Checklist (CI/CD, Monitoring, etc.)
```

---

## Summary: What to Build First

| Priority | Feature | Why |
|----------|---------|-----|
| 1️⃣ | Supabase Auth | Nothing works without real login |
| 2️⃣ | Role-based Access | Need planner/vendor separation |
| 3️⃣ | Event CRUD (connected) | Core planner workflow |
| 4️⃣ | Vendor Booking Response | Core vendor workflow |
| 5️⃣ | Planner-Vendor Messaging | Communication is essential |
| 6️⃣ | Budget Tracking | Money management is key value |
| 7️⃣ | Payment Tracking | Financial visibility |
| 8️⃣ | Admin Verification | Trust and quality control |

---

*Focus on Phase 0 & 1 first. These unlock the core value for planners.*
*Vendor features (Phase 2) can come after planners can create events.*
*Production checklist comes AFTER features are working.*
