-- Migration: Event Day Updates
-- Adds vendor_updates table for real-time D-day photo/status updates

-- ============================================================================
-- 1. VENDOR_UPDATES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS vendor_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    booking_request_id UUID REFERENCES booking_requests(id) ON DELETE SET NULL,

    -- Update content
    update_type TEXT NOT NULL CHECK (update_type IN ('photo', 'status', 'note', 'arrival')),
    message TEXT,
    photo_url TEXT,
    status_tag TEXT CHECK (status_tag IS NULL OR status_tag IN (
        'arrived', 'setup_started', 'setup_complete', 'in_progress', 'completed', 'issue', 'departed'
    )),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vendor_updates_event ON vendor_updates(event_id);
CREATE INDEX IF NOT EXISTS idx_vendor_updates_vendor ON vendor_updates(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_updates_created ON vendor_updates(created_at DESC);

-- Enable RLS
ALTER TABLE vendor_updates ENABLE ROW LEVEL SECURITY;

-- Vendors can insert their own updates
DROP POLICY IF EXISTS "Vendors can insert own updates" ON vendor_updates;
CREATE POLICY "Vendors can insert own updates"
    ON vendor_updates FOR INSERT
    WITH CHECK (
        vendor_id IN (
            SELECT id FROM vendors WHERE user_id = auth.uid()
        )
    );

-- Vendors can view their own updates
DROP POLICY IF EXISTS "Vendors can view own updates" ON vendor_updates;
CREATE POLICY "Vendors can view own updates"
    ON vendor_updates FOR SELECT
    USING (
        vendor_id IN (
            SELECT id FROM vendors WHERE user_id = auth.uid()
        )
    );

-- Planners can view updates for their events
DROP POLICY IF EXISTS "Planners can view event updates" ON vendor_updates;
CREATE POLICY "Planners can view event updates"
    ON vendor_updates FOR SELECT
    USING (
        event_id IN (
            SELECT id FROM events WHERE planner_id = auth.uid()
        )
    );

-- ============================================================================
-- 2. ADD arrival_status TO vendor_assignments
-- ============================================================================

ALTER TABLE vendor_assignments 
    ADD COLUMN IF NOT EXISTS arrival_status TEXT DEFAULT 'pending' 
    CHECK (arrival_status IS NULL OR arrival_status IN ('pending', 'arrived', 'departed'));

-- Enable Realtime for vendor_updates 
ALTER PUBLICATION supabase_realtime ADD TABLE vendor_updates;
