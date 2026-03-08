-- Migration: Add Tasks table and enhance Clients for Leads
-- Created: 2026-02-03

-- ============================================================================
-- TASKS TABLE (Event Tasks associated with vendors)
-- ============================================================================

CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES vendors(id), -- Optional, can be internal task
    
    -- Task Details
    title TEXT NOT NULL,
    description TEXT,
    
    -- Status & Priority
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'in_progress', 'completed', 'verified')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    -- Timing
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Proof (for vendors)
    proof_urls TEXT[] DEFAULT '{}',
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Planners can manage tasks for their events
CREATE POLICY "Planners can manage tasks"
    ON tasks FOR ALL
    USING (
        event_id IN (
            SELECT id FROM events WHERE planner_id = auth.uid()
        )
    );

-- Vendors can view and update assigned tasks
CREATE POLICY "Vendors can view assigned tasks"
    ON tasks FOR SELECT
    USING (
        vendor_id IN (
            SELECT id FROM vendors WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Vendors can update assigned tasks"
    ON tasks FOR UPDATE
    USING (
        vendor_id IN (
            SELECT id FROM vendors WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        vendor_id IN (
            SELECT id FROM vendors WHERE user_id = auth.uid()
        )
    );

-- Trigger for updated_at
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tasks_event ON tasks(event_id);
CREATE INDEX IF NOT EXISTS idx_tasks_vendor ON tasks(vendor_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);


-- ============================================================================
-- ENHANCE CLIENTS TABLE FOR LEADS
-- ============================================================================

-- Add columns to support Lead management if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'event_type') THEN
        ALTER TABLE clients ADD COLUMN event_type TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'event_date') THEN
        ALTER TABLE clients ADD COLUMN event_date DATE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'score') THEN
        ALTER TABLE clients ADD COLUMN score INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'budget_range') THEN
        ALTER TABLE clients ADD COLUMN budget_range TEXT;
    END IF;
END $$;
