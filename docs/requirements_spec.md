# Software Requirements Specification (SRS) - PlannerOS

## 1. Introduction
PlannerOS is a "Zero Investment" SaaS platform designed to streamline event planning for agencies. It connects Planners, Clients, and Vendors in a unified workflow from consultation to settlement.

## 2. Actors (Who interacts with the system)

### Primary Actors (Human Users)
| Actor | Role | Responsibilities |
| :--- | :--- | :--- |
| **Event Planner** | System owner / operator | Create/manage events, Plan Phase 2, Manage vendors, Emergency reassignment. |
| **Client** | Event requester / customer | Review plans, Request revisions, Approve/Pay, Track live progress. |
| **Vendor** | Service provider | Maintain availability, Accept/Reject tasks, Upload proof of work. |

### Secondary Actors
| Actor | Role | Responsibilities |
| :--- | :--- | :--- |
| **PlannerOS Automatic System** | Backend automation | Availability checking, Task generation, Notifications, Invoice generation. |
| **Payment Gateway** | Payment processing | Handle deposits, Final payments, Vendor payouts. |
| **Notification Service** | Communication | Email/Push notifications. |

## 3. Entities (Data Model)
- **User**: The base entity for all Actors (linked via Roles).
- **Event**: The core container. Attributes: Type, Date, Budget, Guest Count, Theme.
- **ServiceCategory**: Master list (e.g., "Photography", "Catering").
- **VendorProfile**: Attributes: Service Category, Base Pricing, Location, Rating.
- **Package**: A proposal configuration (e.g., "Gold Package" for Event ID 123).
- **Task**: A unit of work assigned to a Vendor for a specific Event. Status: Pending -> Accepted -> Done.
- **Invoice**: Financial record linking Event -> Client (Receivable) or Event -> Vendor (Payable).

## 4. Functional Requirements (Verified & Refined)

### 4.1 User Management
- **FR 1.1**: User registration (Planner, Vendor, Client).
- **FR 1.2**: Role-Based Access Control (RBAC).
- **FR 1.3**: Login / logout functionality.
- **FR 1.4**: Password reset flow.

### 4.2 Event Management
- **FR 2.1**: Create / edit / delete events.
- **FR 2.2**: Store event details: Date & time, Venue, Guest count, Budget, Event type.

### 4.3 Phase 2: Planning & Feasibility (Key Feature)
- **FR 3.1**: Capture client requirements.
- **FR 3.2**: Research & concept planning.
- **FR 3.3**: Budget creation & allocation.
- **FR 3.4**: Venue & date selection.
- **FR 3.5**: Vendor availability checking (Availability Logic).
- **FR 3.6**: Package creation (Good / Better / Best).
- **FR 3.7**: Client revision requests.
- **FR 3.8**: Final approval & event lock.

### 4.4 Vendor Management
- **FR 4.1**: Vendor onboarding.
- **FR 4.2**: Service catalog management.
- **FR 4.3**: Availability calendar interaction.
- **FR 4.4**: Task acceptance / rejection.
- **FR 4.5**: Proof-of-work upload.

### 4.5 Task & Workflow Management
- **FR 5.1**: Automatic task generation.
- **FR 5.2**: Task status tracking.
- **FR 5.3**: Emergency reassignment.
- **FR 5.4**: Manual override by planner.

### 4.6 Live Event Tracking
- **FR 6.1**: Real-time task updates.
- **FR 6.2**: Client-facing live dashboard.
- **FR 6.3**: System notifications.

### 4.7 Payments & Settlement
- **FR 7.1**: Deposit handling.
- **FR 7.2**: Final invoice generation.
- **FR 7.3**: Vendor payout calculation.

### 4.8 Feedback & Evaluation
- **FR 8.1**: Client feedback collection.
- **FR 8.2**: Vendor performance scoring.
- **FR 8.3**: Event success metrics.

## 5. Non-Functional Requirements (Verified & Refined)

### 5.1 Performance
- **NFR 1.1**: Page load time < 3 seconds.
- **NFR 1.2**: Real-time updates latency < 1 second.

### 5.2 Scalability
- **NFR 2.1**: Support multiple concurrent events.
- **NFR 2.2**: Horizontal scaling readiness (via stateless services).

### 5.3 Security
- **NFR 3.1**: JWT-based authentication.
- **NFR 3.2**: Role-based authorization.
- **NFR 3.3**: Secure file uploads.
- **NFR 3.4**: HTTPS-only communication.

### 5.4 Reliability
- **NFR 4.1**: 99% uptime target.
- **NFR 4.2**: Graceful failure handling (with automatic retries for transient failures).

### 5.5 Maintainability
- **NFR 5.1**: Modular architecture.
- **NFR 5.2**: Clean, versioned APIs.
- **NFR 5.3**: Proper technical documentation.

### 5.6 Usability
- **NFR 6.1**: Simple UI for vendors (Mobile-first design).
- **NFR 6.2**: Minimal clicks during live events.
