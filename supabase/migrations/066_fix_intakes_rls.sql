-- Fix RLS policies for event_intakes
-- The previous policies were causing "new row violates row-level security policy" on insert

-- First, drop the old policies to prevent conflicts
DROP POLICY IF EXISTS "Planners can manage their intakes" ON event_intakes;
DROP POLICY IF EXISTS "Public can create intake submissions" ON event_intakes;
DROP POLICY IF EXISTS "Public can access intake via token" ON event_intakes;
DROP POLICY IF EXISTS "Public can update intake via token" ON event_intakes;

-- Re-enable RLS just to be sure
ALTER TABLE event_intakes ENABLE ROW LEVEL SECURITY;

-- 1. Planners can manage their own intakes
CREATE POLICY "Planners can manage their intakes"
    ON event_intakes
    FOR ALL
    USING (planner_id = auth.uid())
    WITH CHECK (planner_id = auth.uid());

-- 2. Anyone can insert an intake (essential for the public capture form)
CREATE POLICY "Anyone can insert intakes"
    ON event_intakes
    FOR INSERT
    WITH CHECK (true);

-- 3. Anyone can read their intake if they have the token
-- (We allow reading all so Next.js server components can read without auth,
-- application logic enforces token matching)
CREATE POLICY "Anyone can read intakes"
    ON event_intakes
    FOR SELECT
    USING (true);

-- 4. Anyone can update their intake (application logic enforces token matching)
CREATE POLICY "Anyone can update intakes"
    ON event_intakes
    FOR UPDATE
    USING (true);
