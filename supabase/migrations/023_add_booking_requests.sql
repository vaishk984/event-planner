-- Migration: Add missing Vendor and Booking tables
-- Fixes "Could not find the table 'public.booking_requests'" error

-- ============================================================================
-- 1. BOOKING REQUESTS TABLE
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
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'booking_requests' AND policyname = 'Planners can manage their booking requests') THEN
        CREATE POLICY "Planners can manage their booking requests"
            ON booking_requests
            FOR ALL
            USING (planner_id = auth.uid())
            WITH CHECK (planner_id = auth.uid());
    END IF;
END $$;

-- Vendors can view and respond to their booking requests
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'booking_requests' AND policyname = 'Vendors can view their booking requests') THEN
        CREATE POLICY "Vendors can view their booking requests"
            ON booking_requests
            FOR SELECT
            USING (
                vendor_id IN (
                    SELECT id FROM vendors WHERE user_id = auth.uid()
                )
            );
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'booking_requests' AND policyname = 'Vendors can update their booking requests') THEN
        CREATE POLICY "Vendors can update their booking requests"
            ON booking_requests
            FOR UPDATE
            USING (
                vendor_id IN (
                    SELECT id FROM vendors WHERE user_id = auth.uid()
                )
            );
    END IF;
END $$;

-- ============================================================================
-- 2. PACKAGES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(15, 2) NOT NULL,
    price_unit TEXT DEFAULT 'per_event', -- per_event, per_hour, per_person
    
    includes TEXT[], -- Array of included items
    
    is_customizable BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

-- Vendors can manage their packages
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'packages' AND policyname = 'Vendors can manage their packages') THEN
        CREATE POLICY "Vendors can manage their packages"
            ON packages
            FOR ALL
            USING (
                vendor_id IN (
                    SELECT id FROM vendors WHERE user_id = auth.uid()
                )
            );
    END IF;
END $$;

-- Public read access for packages
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'packages' AND policyname = 'Public read access for packages') THEN
        CREATE POLICY "Public read access for packages"
            ON packages FOR SELECT USING (true);
    END IF;
END $$;

-- ============================================================================
-- 3. PACKAGE ITEMS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS package_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL,
    description TEXT,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(15, 2),
    
    is_optional BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE package_items ENABLE ROW LEVEL SECURITY;

-- Vendors can manage their package items
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'package_items' AND policyname = 'Vendors can manage their package items') THEN
        CREATE POLICY "Vendors can manage their package items"
            ON package_items
            FOR ALL
            USING (
                package_id IN (
                    SELECT id FROM packages 
                    WHERE vendor_id IN (
                        SELECT id FROM vendors WHERE user_id = auth.uid()
                    )
                )
            );
    END IF;
END $$;

-- Public read access for package items
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'package_items' AND policyname = 'Public read access for package items') THEN
        CREATE POLICY "Public read access for package items"
            ON package_items FOR SELECT USING (true);
    END IF;
END $$;

-- ============================================================================
-- 4. INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_booking_requests_event ON booking_requests(event_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_vendor ON booking_requests(vendor_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_planner ON booking_requests(planner_id);
CREATE INDEX IF NOT EXISTS idx_packages_vendor ON packages(vendor_id);
CREATE INDEX IF NOT EXISTS idx_package_items_package ON package_items(package_id);

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

DROP TRIGGER IF EXISTS update_booking_requests_updated_at ON booking_requests;
CREATE TRIGGER update_booking_requests_updated_at
    BEFORE UPDATE ON booking_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_packages_updated_at ON packages;
CREATE TRIGGER update_packages_updated_at
    BEFORE UPDATE ON packages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
