-- Fix RLS Policies for Events Table
-- Allow planners to read their own events

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "events_select" ON events;
DROP POLICY IF EXISTS "events_insert" ON events;
DROP POLICY IF EXISTS "events_update" ON events;
DROP POLICY IF EXISTS "events_delete" ON events;

DROP POLICY IF EXISTS "Planners can view their events" ON events;
DROP POLICY IF EXISTS "Planners can create events" ON events;
DROP POLICY IF EXISTS "Planners can update their events" ON events;

-- Create new, simple policies
CREATE POLICY "Planners can manage their events"
    ON events
    FOR ALL
    USING (planner_id = auth.uid())
    WITH CHECK (planner_id = auth.uid());
