-- Migration: Create event_intakes table
-- This formalizes the table structure that the application code expects
-- Created: 2026-02-05

-- ============================================================================
-- EVENT_INTAKES TABLE
-- ============================================================================

-- Drop if exists (in case of manual creation)
DROP TABLE IF EXISTS event_intakes CASCADE;

CREATE TABLE event_intakes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Ownership & Status
    planner_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'in_progress', 'submitted', 'converted'
    )),
    converted_event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    
    -- Client Details (denormalized for query performance)
    client_name TEXT NOT NULL,
    client_email TEXT,
    client_phone TEXT NOT NULL,
    
    -- All other intake data stored as JSONB
    requirements JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE event_intakes ENABLE ROW LEVEL SECURITY;

-- Planners can manage their intakes
CREATE POLICY "Planners can manage their intakes"
    ON event_intakes
    FOR ALL
    USING (planner_id = auth.uid())
    WITH CHECK (planner_id = auth.uid());

-- Public can insert (for client self-service forms)
CREATE POLICY "Public can create intake submissions"
    ON event_intakes
    FOR INSERT
    WITH CHECK (true);

-- Public can read/update via token (application validates token)
CREATE POLICY "Public can access intake via token"
    ON event_intakes
    FOR SELECT
    USING (true);

CREATE POLICY "Public can update intake via token"
    ON event_intakes
    FOR UPDATE
    USING (true);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_event_intakes_planner ON event_intakes(planner_id);
CREATE INDEX IF NOT EXISTS idx_event_intakes_status ON event_intakes(status);
CREATE INDEX IF NOT EXISTS idx_event_intakes_created ON event_intakes(created_at DESC);

-- ============================================================================
-- UPDATE TRIGGER
-- ============================================================================

CREATE TRIGGER update_event_intakes_updated_at
    BEFORE UPDATE ON event_intakes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
