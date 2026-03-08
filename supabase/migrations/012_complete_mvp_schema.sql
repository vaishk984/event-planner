-- PlannerOS Complete Schema
-- Migration: All core tables for MVP
-- Created: 2026-02-01

-- ============================================================================
-- HELPER FUNCTION FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CLIENTS TABLE (CRM)
-- ============================================================================

CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    planner_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Basic info
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    
    -- Additional info
    address TEXT,
    city TEXT,
    notes TEXT,
    
    -- Relationship
    source TEXT, -- How they found you
    referred_by TEXT,
    tags TEXT[] DEFAULT '{}',
    
    -- Stats
    total_events INTEGER DEFAULT 0,
    total_spend DECIMAL(15, 2) DEFAULT 0,
    last_event_date DATE,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'vip')),
    
    -- Preferences (JSONB)
    preferences JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Planners can manage their clients
CREATE POLICY "Planners can manage their clients"
    ON clients FOR ALL
    USING (planner_id = auth.uid())
    WITH CHECK (planner_id = auth.uid());

-- ============================================================================
-- EVENT FUNCTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS event_functions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    
    -- Identity
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN (
        'mehendi', 'haldi', 'sangeet', 'wedding', 'reception',
        'cocktail', 'after_party', 'brunch', 'custom'
    )),
    day INTEGER NOT NULL DEFAULT 1,
    
    -- Schedule
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    
    -- Venue (can differ per function)
    venue_name TEXT,
    venue_address TEXT,
    venue_type TEXT CHECK (venue_type IN ('personal', 'showroom')),
    
    -- Capacity & Budget
    guest_count INTEGER DEFAULT 100,
    budget DECIMAL(15, 2) DEFAULT 0,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'confirmed', 'completed')),
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE event_functions ENABLE ROW LEVEL SECURITY;

-- Users can manage functions for their events
CREATE POLICY "Users can manage their event functions"
    ON event_functions FOR ALL
    USING (
        event_id IN (
            SELECT id FROM events WHERE planner_id = auth.uid()
        )
    );

-- ============================================================================
-- BUDGET ITEMS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS budget_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    
    -- Category
    category TEXT NOT NULL CHECK (category IN (
        'venue', 'food', 'decor', 'entertainment', 'photography',
        'bridal', 'logistics', 'guest', 'misc'
    )),
    
    -- Amounts
    allocated_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    spent_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    allocated_percent DECIMAL(5, 2) DEFAULT 0,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'under' CHECK (status IN ('under', 'on_track', 'warning', 'over')),
    
    -- Notes
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint on event + category
    UNIQUE (event_id, category)
);

-- Enable RLS
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;

-- Users can manage budget items for their events
CREATE POLICY "Users can manage their budget items"
    ON budget_items FOR ALL
    USING (
        event_id IN (
            SELECT id FROM events WHERE planner_id = auth.uid()
        )
    );

-- ============================================================================
-- TIMELINE ITEMS TABLE (Run Sheet)
-- ============================================================================

CREATE TABLE IF NOT EXISTS timeline_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    function_id UUID REFERENCES event_functions(id) ON DELETE CASCADE,
    
    -- Timing
    start_time TIME NOT NULL,
    end_time TIME,
    duration INTEGER, -- minutes
    
    -- Details
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    
    -- Responsibility
    owner TEXT,
    owner_phone TEXT,
    vendor_id UUID REFERENCES vendors(id),
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'in_progress', 'completed', 'delayed', 'cancelled'
    )),
    actual_start_time TIME,
    actual_end_time TIME,
    notes TEXT,
    
    -- Dependencies
    depends_on UUID[],
    
    -- Order
    sort_order INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE timeline_items ENABLE ROW LEVEL SECURITY;

-- Users can manage timeline items for their events
CREATE POLICY "Users can manage their timeline items"
    ON timeline_items FOR ALL
    USING (
        event_id IN (
            SELECT id FROM events WHERE planner_id = auth.uid()
        )
    );

-- ============================================================================
-- VENDOR ASSIGNMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS vendor_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    function_id UUID REFERENCES event_functions(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    
    -- Vendor details (denormalized)
    vendor_name TEXT NOT NULL,
    vendor_category TEXT NOT NULL,
    vendor_phone TEXT,
    
    -- Assignment details
    budget_category TEXT,
    agreed_amount DECIMAL(15, 2) DEFAULT 0,
    paid_amount DECIMAL(15, 2) DEFAULT 0,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN (
        'requested', 'confirmed', 'declined', 'completed', 'cancelled'
    )),
    
    -- Event day
    arrival_time TIME,
    arrived_at TIMESTAMPTZ,
    departed_at TIMESTAMPTZ,
    
    -- Notes
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE vendor_assignments ENABLE ROW LEVEL SECURITY;

-- Planners can manage vendor assignments for their events
CREATE POLICY "Planners can manage vendor assignments"
    ON vendor_assignments FOR ALL
    USING (
        event_id IN (
            SELECT id FROM events WHERE planner_id = auth.uid()
        )
    );

-- Vendors can view their assignments
CREATE POLICY "Vendors can view their assignments"
    ON vendor_assignments FOR SELECT
    USING (
        vendor_id IN (
            SELECT id FROM vendors WHERE user_id = auth.uid()
        )
    );

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_clients_planner ON clients(planner_id);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);
CREATE INDEX IF NOT EXISTS idx_event_functions_event ON event_functions(event_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_event ON budget_items(event_id);
CREATE INDEX IF NOT EXISTS idx_timeline_items_event ON timeline_items(event_id);
CREATE INDEX IF NOT EXISTS idx_timeline_items_function ON timeline_items(function_id);
CREATE INDEX IF NOT EXISTS idx_vendor_assignments_event ON vendor_assignments(event_id);
CREATE INDEX IF NOT EXISTS idx_vendor_assignments_vendor ON vendor_assignments(vendor_id);

-- ============================================================================
-- UPDATE TRIGGERS
-- ============================================================================

CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_functions_updated_at
    BEFORE UPDATE ON event_functions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_items_updated_at
    BEFORE UPDATE ON budget_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timeline_items_updated_at
    BEFORE UPDATE ON timeline_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_assignments_updated_at
    BEFORE UPDATE ON vendor_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
