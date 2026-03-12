-- Restrict proposal snapshot reads to planner-owned events only.
-- The previous public SELECT policy used USING (true), which exposed all
-- proposal snapshots to any authenticated planner query unless the app added
-- its own filter.

DROP POLICY IF EXISTS "Public can view snapshots by token" ON proposal_snapshots;
