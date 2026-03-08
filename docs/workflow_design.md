# Workflow & Request Flow - PlannerOS

## 1. System Workflow (End-to-End)

### Phase 0: System Setup
```mermaid
sequenceDiagram
    participant Admin as Admin/Planner
    participant System as PlannerOS
    participant Vendor as Vendor
    
    Admin->>System: Add Service Categories
    Admin->>System: Invite Vendors
    Vendor->>System: Register & Create Profile
    Vendor->>System: Upload Services & Pricing
    Vendor->>System: Set Availability Calendar
    System->>System: Index Vendor Data
```

### Phase 1: Client Consultation
```mermaid
sequenceDiagram
    participant Client as Client
    participant Planner as Planner
    participant System as PlannerOS
    
    Client->>Planner: Event Inquiry
    Planner->>System: Create New Event
    Planner->>System: Capture Requirements
    Planner->>System: Define Initial Concept
    Planner->>System: Enter Budget Range
    System->>System: Create Vision Board
```

### Phase 2: Planning & Feasibility (Iterative)
```mermaid
sequenceDiagram
    participant Planner as Planner
    participant System as PlannerOS (Brain)
    participant Client as Client
    
    Planner->>System: Request Feasibility Check
    System->>System: Check Vendor Availability
    System->>System: Check Venue Availability
    System->>System: Validate Budget
    System-->>Planner: Feasibility Report
    
    Planner->>System: Finalize Concept & Research
    Planner->>System: Allocate Budget
    Planner->>System: Shortlist Vendors
    Planner->>System: Plan Logistics
    
    Planner->>System: Generate Packages (Good/Better/Best)
    System-->>Client: Present Packages
    
    alt Client Requests Changes
        Client->>Planner: Request Revision
        Planner->>System: Update Package
        System-->>Client: Present Updated Package
    end
    
    Client->>System: Approve Package
    System->>System: Lock Event
    System->>System: Convert Soft Holds → Hard Bookings
```

### Phase 3: Automated Dispatch
```mermaid
sequenceDiagram
    participant Client as Client
    participant System as PlannerOS
    participant Vendor as Vendor
    
    Client->>System: Pay Deposit
    System->>System: Auto-Generate Tasks
    System->>Vendor: Send Task Notifications
    
    alt Vendor Accepts
        Vendor->>System: Accept Task
        System->>System: Confirm Assignment
    else Vendor Rejects
        Vendor->>System: Reject Task (Reason)
        System->>Planner: Alert & Suggest Backup
        Planner->>System: Assign Backup Vendor
    end
```

### Phase 4: Live Execution
```mermaid
sequenceDiagram
    participant Vendor as Vendor
    participant System as PlannerOS
    participant Client as Client
    participant Planner as Planner
    
    System->>System: Event Status → LIVE
    
    loop Task Execution
        Vendor->>System: Update Task Status
        Vendor->>System: Upload Proof of Work
        System-->>Client: Real-time Dashboard Update
    end
    
    opt Emergency Situation
        Planner->>System: Reassign Task
        System->>Vendor: Emergency Notification
    end
    
    System->>System: All Tasks Completed
```

### Phase 5: Closure & Evaluation
```mermaid
sequenceDiagram
    participant System as PlannerOS
    participant Client as Client
    participant Vendor as Vendor
    
    System->>System: Mark Event Completed
    System->>Client: Generate Final Invoice
    Client->>System: Pay Balance
    
    System->>Vendor: Process Payouts
    
    System->>Client: Request Feedback
    Client->>System: Submit Rating & Comments
    
    System->>System: Update Vendor Performance Scores
    System->>System: Archive Event
```

## 2. Request Flow (API Layer)

### Example 1: Client Approves Package
```mermaid
sequenceDiagram
    participant UI as Client UI
    participant API as Next.js API
    participant Auth as Auth Middleware
    participant DB as Supabase DB
    participant Queue as Task Queue
    participant Notif as Notification Service
    
    UI->>API: POST /api/packages/{id}/approve
    API->>Auth: Verify JWT Token
    Auth-->>API: User Authenticated (Client Role)
    
    API->>DB: UPDATE packages SET status='approved'
    API->>DB: UPDATE events SET status='planned'
    
    API->>Queue: Trigger Task Generation
    Queue->>DB: INSERT INTO event_tasks
    
    Queue->>Notif: Send Vendor Notifications
    Notif-->>Vendor: Push Notification
    
    API-->>UI: 200 OK {event_id, tasks_created}
```

### Example 2: Vendor Uploads Proof of Work
```mermaid
sequenceDiagram
    participant App as Vendor App
    participant API as Next.js API
    participant Auth as Auth Middleware
    participant Storage as Supabase Storage
    participant DB as Supabase DB
    participant WS as WebSocket/Realtime
    participant Client as Client Dashboard
    
    App->>API: POST /api/tasks/{id}/proof (FormData)
    API->>Auth: Verify JWT (Vendor Role)
    Auth-->>API: Authenticated
    
    API->>Storage: Upload Image/Video
    Storage-->>API: file_url
    
    API->>DB: INSERT INTO proof_of_work
    API->>DB: UPDATE event_tasks SET status='completed'
    
    DB->>WS: Trigger Realtime Event
    WS-->>Client: Live Update (Task Completed)
    
    API-->>App: 201 Created {proof_id, file_url}
```

### Example 3: Planner Checks Feasibility
```mermaid
sequenceDiagram
    participant UI as Planner UI
    participant API as Next.js Server Action
    participant DB as Supabase DB
    
    UI->>API: checkFeasibility(eventId, date)
    
    API->>DB: SELECT vendor_availability WHERE date=?
    API->>DB: SELECT event_tasks WHERE date=?
    
    API->>API: Calculate Conflicts
    API->>API: Calculate Budget vs Cost
    
    API-->>UI: {conflicts: [], budget_status: 'ok'}
```

## 3. State Transitions

### Event State Machine
```mermaid
stateDiagram-v2
    [*] --> Draft: Create Event
    Draft --> Planned: Package Approved
    Planned --> Live: Event Day Starts
    Live --> Completed: All Tasks Done
    Completed --> [*]: Archived
    
    Draft --> Cancelled: Client Cancels
    Planned --> Cancelled: Planner Cancels
```

### Task State Machine
```mermaid
stateDiagram-v2
    [*] --> Pending: Task Created
    Pending --> Accepted: Vendor Accepts
    Pending --> Rejected: Vendor Rejects
    Accepted --> InProgress: Vendor Starts
    InProgress --> Completed: Proof Uploaded
    Rejected --> Pending: Reassigned
```
