/**
 * PlannerOS Domain Types
 * 
 * Single source of truth for all domain entities.
 * Based on: docs/system_design.md (Section 2.2)
 */

// ============================================
// EVENT DOMAIN
// ============================================

export type EventStatus =
    | 'submission'  // Raw client submission (not yet event)
    | 'draft'       // Converted to event, being designed
    | 'planning'    // In active design phase
    | 'proposed'    // Proposal sent to client
    | 'approved'    // Client approved (LOCKED)
    | 'live'        // Event day active
    | 'completed'   // All tasks done
    | 'archived';   // Closed and stored

export type EventType =
    | 'wedding'
    | 'birthday'
    | 'corporate'
    | 'baby_shower'
    | 'graduation'
    | 'anniversary'
    | 'engagement'
    | 'other';

export type VenueType = 'personal' | 'showroom';

export interface Event {
    id: string;
    plannerId: string;
    clientId?: string;
    submissionId?: string;  // Link to original submission

    // Core details
    status: EventStatus;
    type: EventType;
    name: string;

    publicToken?: string;
    proposalStatus?: 'draft' | 'sent' | 'approved' | 'declined';



    // Dates
    date: string;
    endDate?: string;
    isDateFlexible: boolean;

    // Location
    city: string;
    venueType: VenueType;
    venueName?: string;
    venueAddress?: string;

    // Capacity & Budget
    guestCount: number;
    budgetMin: number;
    budgetMax: number;

    // Client info
    clientName: string;
    clientPhone: string;
    clientEmail?: string;

    // Metadata
    source?: 'whatsapp' | 'instagram' | 'phone' | 'referral' | 'website' | 'portal' | 'walk_in' | 'other';
    notes?: string;

    // Timestamps
    createdAt: string;
    updatedAt: string;
}

// ============================================
// EVENT FUNCTION DOMAIN (Multi-Day Support)
// ============================================

export type FunctionType =
    | 'mehendi'
    | 'haldi'
    | 'sangeet'
    | 'wedding'
    | 'reception'
    | 'cocktail'
    | 'after_party'
    | 'brunch'
    | 'custom';

export type FunctionStatus = 'planning' | 'confirmed' | 'completed';

/**
 * EventFunction represents a single function/ceremony within a multi-day event.
 * A wedding can have: Mehendi (Day 1), Sangeet (Day 2), Wedding (Day 3), Reception (Day 4)
 */
export interface EventFunction {
    id: string;
    eventId: string;

    // Identity
    name: string;           // e.g., "Mehendi Ceremony"
    type: FunctionType;
    day: number;            // Day 1, Day 2, etc.

    // Schedule
    date: string;
    startTime?: string;     // e.g., "18:00"
    endTime?: string;       // e.g., "23:00"

    // Venue (can differ per function)
    venueName?: string;
    venueAddress?: string;
    venueType?: VenueType;

    // Capacity & Budget (per function)
    guestCount: number;
    budget: number;

    // Status & Notes
    status: FunctionStatus;
    notes?: string;

    // Timestamps
    createdAt: string;
    updatedAt: string;
}

// ============================================
// TIMELINE DOMAIN (Run Sheet)
// ============================================

export type TimelineStatus = 'pending' | 'in_progress' | 'completed' | 'delayed' | 'cancelled';

/**
 * TimelineItem represents a single activity in a function's run sheet.
 * Used for minute-level event day planning.
 */
export interface TimelineItem {
    id: string;
    functionId: string;     // Which function this belongs to
    eventId: string;

    // Timing
    startTime: string;      // "06:00" (24hr format)
    endTime?: string;       // "06:30"
    duration?: number;      // minutes

    // Details
    title: string;          // "Decor setup begins"
    description?: string;
    location?: string;      // "Main Hall", "Entrance"

    // Responsibility
    owner: string;          // "Decorator", "DJ Team", "Caterer"
    ownerPhone?: string;
    vendorId?: string;      // Link to vendor if applicable

    // Status
    status: TimelineStatus;
    actualStartTime?: string;
    actualEndTime?: string;
    notes?: string;

    // Dependencies (task must wait for these to complete)
    dependsOn?: string[];   // IDs of items this depends on

    // Order
    order: number;

    // Timestamps
    createdAt: string;
    updatedAt: string;
}

// ============================================
// BUDGET DOMAIN (Category-wise Budget Splits)
// ============================================

export type BudgetCategoryType =
    | 'venue'           // Hall, infrastructure, power
    | 'food'            // Catering, beverages, service
    | 'decor'           // Mandap, flowers, lighting
    | 'entertainment'   // DJ, anchor, performances
    | 'photography'     // Photo, video, drone
    | 'bridal'          // Makeup, mehendi, styling
    | 'logistics'       // Transport, hotels
    | 'guest'           // Welcome kits, signage
    | 'misc';           // Buffer/contingency

/**
 * Industry-standard budget percentages for weddings.
 * Used as default allocations and warnings.
 */
export const BUDGET_CATEGORY_DEFAULTS: Record<BudgetCategoryType, {
    name: string;
    minPercent: number;
    maxPercent: number;
    icon: string;
}> = {
    venue: { name: 'Venue & Infrastructure', minPercent: 20, maxPercent: 30, icon: 'building' },
    food: { name: 'Food & Beverage', minPercent: 25, maxPercent: 35, icon: 'utensils' },
    decor: { name: 'Decoration & Design', minPercent: 15, maxPercent: 25, icon: 'flower' },
    entertainment: { name: 'Entertainment', minPercent: 5, maxPercent: 10, icon: 'music' },
    photography: { name: 'Photography & Video', minPercent: 5, maxPercent: 10, icon: 'camera' },
    bridal: { name: 'Bridal & Groom', minPercent: 3, maxPercent: 8, icon: 'sparkles' },
    logistics: { name: 'Logistics', minPercent: 3, maxPercent: 8, icon: 'truck' },
    guest: { name: 'Guest Experience', minPercent: 2, maxPercent: 5, icon: 'gift' },
    misc: { name: 'Miscellaneous', minPercent: 5, maxPercent: 10, icon: 'box' },
};

/**
 * Budget allocation for a specific category within an event.
 */
export interface BudgetAllocation {
    id: string;
    eventId: string;
    category: BudgetCategoryType;

    // Amounts
    allocatedAmount: number;        // Planned budget for this category
    spentAmount: number;            // Actual spent so far

    // Percentage of total budget
    allocatedPercent: number;

    // Status
    status: 'under' | 'on_track' | 'warning' | 'over';

    // Notes
    notes?: string;

    // Timestamps
    createdAt: string;
    updatedAt: string;
}

// ============================================
// VENDOR ASSIGNMENT DOMAIN (Per-Function Vendors)
// ============================================

export type VendorAssignmentStatus =
    | 'requested'       // Booking request sent
    | 'confirmed'       // Vendor accepted
    | 'declined'        // Vendor declined
    | 'completed'       // Work done
    | 'cancelled';      // Planner cancelled

/**
 * Assigns a vendor to a specific function with tasks and budget.
 */
export interface VendorAssignment {
    id: string;
    eventId: string;
    functionId: string;         // Which function (Mehendi, Wedding, etc.)
    vendorId: string;           // Reference to vendor

    // Vendor details (denormalized for display)
    vendorName: string;
    vendorCategory: string;     // Photography, Catering, etc.
    vendorPhone?: string;

    // Assignment details
    budgetCategory: BudgetCategoryType;
    agreedAmount: number;       // Negotiated price
    paidAmount: number;         // Paid so far

    // Status
    status: VendorAssignmentStatus;

    // Tasks for this vendor
    tasks: VendorTask[];

    // Backup vendor
    backupVendorId?: string;
    backupVendorName?: string;

    // Event day
    arrivalTime?: string;       // Expected arrival
    arrivedAt?: string;         // Actual arrival
    departedAt?: string;

    // Notes
    notes?: string;

    // Timestamps
    createdAt: string;
    updatedAt: string;
}

/**
 * A task assigned to a vendor for a specific function.
 */
export interface VendorTask {
    id: string;
    title: string;
    description?: string;
    dueTime?: string;           // Time by which task should be done
    status: 'pending' | 'in_progress' | 'completed';
    proofUrl?: string;          // Photo proof of work
    completedAt?: string;
}

// ============================================
// INTAKE DOMAIN (Unified Capture API)
// ============================================

export type IntakeStatus =
    | 'draft'       // Created, not yet filled
    | 'in_progress' // Partially filled
    | 'submitted'   // Completed and submitted
    | 'converted';  // Converted to Event

export type IntakeCreator = 'planner' | 'client';

export type IntakeSource =
    | 'whatsapp'
    | 'instagram'
    | 'phone'
    | 'referral'
    | 'website'
    | 'walk_in'
    | 'other';

/**
 * Unified Intake Entity
 * 
 * Captures client requirements from both:
 * - Planner (on-site capture via /capture)
 * - Client (self-service via /intake/[token])
 * 
 * Access patterns:
 * - By ID: /planner/intakes/[id] (internal)
 * - By Token: /intake/[token] (external)
 */
export interface Intake {
    id: string;
    token: string;  // Public token for client access

    // Ownership & Creation
    createdBy: IntakeCreator;
    plannerId?: string;

    // Status
    status: IntakeStatus;
    convertedEventId?: string;
    currentTab: number;

    // Client details
    clientName: string;
    phone: string;
    email?: string;
    source?: IntakeSource;

    // Event basics
    eventType?: EventType;
    eventDate?: string;
    eventEndDate?: string;
    isDateFlexible: boolean;
    guestCount: number;
    budgetMin: number;
    budgetMax: number;
    city?: string;
    venueType?: VenueType;

    // Personal venue (if applicable)
    personalVenue: {
        name: string;
        address: string;
        capacity: number;
        type: 'indoor' | 'outdoor' | 'both' | '';
        parking: 'yes' | 'limited' | 'no' | '';
        photos: string[];
        photosSkipped: boolean;
    };

    // Preferences (from tabs)
    food: {
        cuisines: string[];
        dietary: string[];
        servingStyle: string;
        budgetLevel: string;
        specialRequests: string;
        likedVendors: string[];
    };

    decor: {
        style: string;
        colorMood: string;
        intensity: string;
        lighting: string;
        flowers: string[];
        specialRequests: string;
        likedVendors: string[];
    };

    entertainment: {
        type: string;
        genres: string[];
        specialRequests: string;
        likedVendors: string[];
    };

    photography: {
        package: string;
        drone: boolean;
        preWedding: boolean;
        specialRequests: string;
        likedVendors: string[];
    };

    services: {
        makeup: boolean;
        mehendi: boolean;
        anchor: boolean;
        valet: boolean;
        pandit: boolean;
        specialRequests: string;
    };

    // All liked vendors
    likedVendors: string[];
    specialRequests: string;

    // Signature
    signature?: {
        data: string;
        timestamp: string;
    };

    // Timestamps
    createdAt: string;
    updatedAt: string;
    submittedAt?: string;
}

// Backward compatibility alias
export type ClientSubmission = Intake;

// ============================================
// VENDOR DOMAIN
// ============================================

export type VendorCategory =
    | 'venue'
    | 'catering'
    | 'decor'
    | 'photography'
    | 'videography'
    | 'music'
    | 'makeup'
    | 'mehendi'
    | 'anchor'
    | 'pandit'
    | 'transportation';

export interface Vendor {
    id: string;
    userId?: string;  // If vendor has login

    // Profile
    name: string;
    category: VendorCategory;
    description: string;

    // Contact
    phone: string;
    email: string;
    website?: string;
    instagram?: string;

    // Location
    city: string;
    serviceAreas: string[];

    // Payment & Socials
    paymentDetails?: {
        bankName?: string
        accountNumber?: string
        ifsc?: string
        upiId?: string
    };

    // Pricing
    basePrice: number;
    priceRange: 'budget' | 'mid' | 'premium' | 'luxury';
    currency: string;

    // Rating
    rating: number;
    reviewCount: number;

    // Media
    images: string[];
    portfolio: string[]; // Mapped from portfolio_urls
    portfolioUrl?: string; // Legacy field?


    // Status
    isVerified: boolean;
    isActive: boolean;

    // Timestamps
    createdAt: string;
    updatedAt: string;
}

export interface VendorPackage {
    id: string;
    vendorId: string;
    name: string;
    description?: string;
    price: number;
    duration?: string;
    inclusions: string[];
    isPopular: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface VendorAvailability {
    id: string;
    vendorId: string;
    date: string;
    status: 'available' | 'busy' | 'tentative';
    eventId?: string;  // If booked
    notes?: string;
}

// ============================================
// EVENT VENDOR (Junction)
// ============================================

export interface EventVendor {
    id: string;
    eventId: string;
    vendorId: string;
    category: VendorCategory;
    status: 'shortlisted' | 'contacted' | 'confirmed' | 'rejected';
    price?: number;
    notes?: string;
    addedAt: string;
    // Joined fields from repository
    vendorName?: string;
    vendorCategory?: string;
    vendorPhone?: string;
    agreedAmount?: number;
}

// ============================================
// TASK DOMAIN
// ============================================

export type TaskStatus =
    | 'pending'      // Created, not sent
    | 'sent'         // Sent to vendor
    | 'accepted'     // Vendor accepted
    | 'rejected'     // Vendor rejected
    | 'in_progress'  // Work started
    | 'completed'    // Work done
    | 'verified';    // Planner approved

export interface Task {
    id: string;
    eventId: string;
    vendorId: string;

    // Details
    title: string;
    description: string;
    category: VendorCategory;

    // Timing
    dueDate: string;
    startTime?: string;
    endTime?: string;

    // Status
    status: TaskStatus;

    // Assignment
    assignedAt?: string;
    acceptedAt?: string;
    completedAt?: string;

    // Proof
    proofUrls: string[];
    proofNotes?: string;

    // Metadata
    priority: 'low' | 'medium' | 'high' | 'critical';

    createdAt: string;
    updatedAt: string;
}

// ============================================
// PROPOSAL DOMAIN
// ============================================

export type ProposalStatus =
    | 'draft'
    | 'sent'
    | 'viewed'
    | 'approved'
    | 'rejected'
    | 'expired';

export interface Proposal {
    id: string;
    eventId: string;
    version: number;

    // Status
    status: ProposalStatus;

    // Package Tier
    tier?: 'silver' | 'gold' | 'platinum' | 'custom';

    // Content
    title: string;
    description?: string;

    // Pricing
    subtotal: number;
    discount: number;
    tax: number;
    total: number;

    // Line items
    items: ProposalItem[];

    // Client access
    token: string;
    viewedAt?: string;
    respondedAt?: string;
    clientNotes?: string;

    // Validity
    validUntil: string;

    createdAt: string;
    updatedAt: string;
}

export interface ProposalItem {
    id: string;
    proposalId: string;
    vendorId: string;
    category: VendorCategory;

    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

// ============================================
// USER & AUTH DOMAIN
// ============================================

export type UserRole = 'planner' | 'client' | 'vendor' | 'admin';

export interface User {
    id: string;
    email: string;
    role: UserRole;

    // Profile
    name: string;
    phone?: string;
    avatar?: string;

    // Settings
    preferences?: Record<string, any>;

    // Status
    isActive: boolean;
    emailVerified: boolean;

    createdAt: string;
    updatedAt: string;
}

// ============================================
// API TYPES
// ============================================

export interface ApiResponse<T> {
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

export type ActionResult<T = void> =
    | { success: true; data: T }
    | { success: false; error: string; code?: string };
