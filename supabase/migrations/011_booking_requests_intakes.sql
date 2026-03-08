-- PlannerOS Extended Schema
-- Migration: Booking Requests and Message Tables
-- Created: 2026-02-01

-- ============================================================================
-- BOOKING REQUESTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS booking_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    planner_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Event details (denormalized for quick access)
    event_name TEXT NOT NULL,
    event_date DATE NOT NULL,
    city TEXT,
    venue TEXT,
    guest_count INTEGER,
    
    -- Service details
    service TEXT NOT NULL, -- Photography, Catering, etc.
    requirements TEXT,
    
    -- Pricing
    budget DECIMAL(15, 2),
    quoted_amount DECIMAL(15, 2),
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'quoted', 'accepted', 'declined', 'completed', 'cancelled'
    )),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    quoted_at TIMESTAMPTZ,
    responded_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;

-- Planners can create and view their booking requests
CREATE POLICY "Planners can manage their booking requests"
    ON booking_requests
    FOR ALL
    USING (planner_id = auth.uid())
    WITH CHECK (planner_id = auth.uid());

-- Vendors can view and respond to their booking requests
CREATE POLICY "Vendors can view their booking requests"
    ON booking_requests
    FOR SELECT
    USING (
        vendor_id IN (
            SELECT id FROM vendors WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Vendors can update their booking requests"
    ON booking_requests
    FOR UPDATE
    USING (
        vendor_id IN (
            SELECT id FROM vendors WHERE user_id = auth.uid()
        )
    );

-- ============================================================================
-- INTAKES TABLE (Unified Client Submissions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS intakes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    access_token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
    
    -- Ownership
    created_by TEXT NOT NULL DEFAULT 'planner' CHECK (created_by IN ('planner', 'client')),
    planner_id UUID REFERENCES user_profiles(id),
    
    -- Status
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'in_progress', 'submitted', 'converted'
    )),
    converted_event_id UUID REFERENCES events(id),
    current_tab INTEGER DEFAULT 0,
    
    -- Client details
    client_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    source TEXT,
    
    -- Event basics
    event_type TEXT,
    event_date DATE,
    event_end_date DATE,
    is_date_flexible BOOLEAN DEFAULT FALSE,
    guest_count INTEGER DEFAULT 100,
    budget_min DECIMAL(15, 2) DEFAULT 0,
    budget_max DECIMAL(15, 2) DEFAULT 0,
    city TEXT,
    venue_type TEXT,
    
    -- Preferences (stored as JSONB)
    personal_venue JSONB DEFAULT '{}',
    food_preferences JSONB DEFAULT '{}',
    decor_preferences JSONB DEFAULT '{}',
    entertainment_preferences JSONB DEFAULT '{}',
    photography_preferences JSONB DEFAULT '{}',
    services_preferences JSONB DEFAULT '{}',
    
    -- Liked vendors
    liked_vendors TEXT[] DEFAULT '{}',
    special_requests TEXT,
    
    -- Signature
    signature JSONB,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE intakes ENABLE ROW LEVEL SECURITY;

-- Planners can manage their intakes
CREATE POLICY "Planners can manage their intakes"
    ON intakes
    FOR ALL
    USING (planner_id = auth.uid())
    WITH CHECK (planner_id = auth.uid());

-- Public access via token (for client portal)
CREATE POLICY "Public can access intake via token"
    ON intakes
    FOR SELECT
    USING (true); -- Token validation happens in application layer

CREATE POLICY "Public can update intake via token"
    ON intakes
    FOR UPDATE
    USING (true); -- Token validation happens in application layer

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_booking_requests_event ON booking_requests(event_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_vendor ON booking_requests(vendor_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_planner ON booking_requests(planner_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_status ON booking_requests(status);

CREATE INDEX IF NOT EXISTS idx_intakes_planner ON intakes(planner_id);
CREATE INDEX IF NOT EXISTS idx_intakes_status ON intakes(status);
CREATE INDEX IF NOT EXISTS idx_intakes_token ON intakes(access_token);

-- ============================================================================
-- UPDATE TRIGGERS
-- ============================================================================

CREATE TRIGGER update_booking_requests_updated_at
    BEFORE UPDATE ON booking_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_intakes_updated_at
    BEFORE UPDATE ON intakes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
