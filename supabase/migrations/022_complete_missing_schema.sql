-- Migration: Add missing tables for MVP (Budget, Clients, Vendors)
-- Fixes "Could not find the table 'public.budget_items'" error

-- ============================================================================
-- 1. BUDGET ITEMS TABLE
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
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'budget_items' AND policyname = 'Users can manage their budget items') THEN
        CREATE POLICY "Users can manage their budget items"
            ON budget_items FOR ALL
            USING (
                event_id IN (
                    SELECT id FROM events WHERE planner_id = auth.uid()
                )
            );
    END IF;
END $$;

-- ============================================================================
-- 2. CLIENTS TABLE (CRM)
-- ============================================================================

CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    planner_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE, -- if user_profiles exists, likely auth.users reference better but keeping consistent with other migrations
    
    -- Basic info
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    
    -- Additional info
    address TEXT,
    city TEXT,
    notes TEXT,
    
    -- Relationship
    source TEXT,
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
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'Planners can manage their clients') THEN
        CREATE POLICY "Planners can manage their clients"
            ON clients FOR ALL
            USING (planner_id = auth.uid())
            WITH CHECK (planner_id = auth.uid());
    END IF;
END $$;

-- ============================================================================
-- 3. VENDOR ASSIGNMENTS TABLE
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
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vendor_assignments' AND policyname = 'Planners can manage vendor assignments') THEN
        CREATE POLICY "Planners can manage vendor assignments"
            ON vendor_assignments FOR ALL
            USING (
                event_id IN (
                    SELECT id FROM events WHERE planner_id = auth.uid()
                )
            );
    END IF;
END $$;

-- ============================================================================
-- 4. INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_budget_items_event ON budget_items(event_id);
CREATE INDEX IF NOT EXISTS idx_clients_planner ON clients(planner_id);
CREATE INDEX IF NOT EXISTS idx_vendor_assignments_event ON vendor_assignments(event_id);

-- ============================================================================
-- 5. UPDATE TRIGGERS
-- ============================================================================

-- Re-create the function just in case
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_budget_items_updated_at ON budget_items;
CREATE TRIGGER update_budget_items_updated_at
    BEFORE UPDATE ON budget_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vendor_assignments_updated_at ON vendor_assignments;
CREATE TRIGGER update_vendor_assignments_updated_at
    BEFORE UPDATE ON vendor_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
