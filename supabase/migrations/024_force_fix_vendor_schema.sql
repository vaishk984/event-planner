-- Migration: FORCE Fix Vendor and Booking tables
-- Fixes "column vendor_id does not exist" error by recreating tables from scratch.

-- ⚠️ WARNING: This will delete data in booking_requests and packages tables. 
-- Since you are setting this up for the first time, this should be safe.

DROP TABLE IF EXISTS booking_requests CASCADE;
DROP TABLE IF EXISTS package_items CASCADE;
DROP TABLE IF EXISTS packages CASCADE;

-- ============================================================================
-- 1. BOOKING REQUESTS TABLE
-- ============================================================================

CREATE TABLE booking_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    planner_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Event details
    event_name TEXT NOT NULL,
    event_date DATE NOT NULL,
    city TEXT,
    venue TEXT,
    guest_count INTEGER,
    
    -- Service details
    service TEXT NOT NULL,
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

ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Planners can manage their booking_requests" ON booking_requests
    FOR ALL USING (planner_id = auth.uid());

CREATE POLICY "Vendors can view their booking_requests" ON booking_requests
    FOR SELECT USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can update their booking_requests" ON booking_requests
    FOR UPDATE USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

-- ============================================================================
-- 2. PACKAGES TABLE
-- ============================================================================

CREATE TABLE packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(15, 2) NOT NULL,
    price_unit TEXT DEFAULT 'per_event',
    
    includes TEXT[],
    
    is_customizable BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can manage their packages" ON packages
    FOR ALL USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Public read access for packages" ON packages
    FOR SELECT USING (true);

-- ============================================================================
-- 3. PACKAGE ITEMS TABLE
-- ============================================================================

CREATE TABLE package_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL,
    description TEXT,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(15, 2),
    
    is_optional BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE package_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can manage their package_items" ON package_items
    FOR ALL USING (
        package_id IN (
            SELECT id FROM packages 
            WHERE vendor_id IN (
                SELECT id FROM vendors WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Public read access for package_items" ON package_items
    FOR SELECT USING (true);


-- ============================================================================
-- 4. UPDATE TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_booking_requests_updated_at
    BEFORE UPDATE ON booking_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packages_updated_at
    BEFORE UPDATE ON packages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

