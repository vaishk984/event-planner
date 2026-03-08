-- Migration: Create proposal_snapshots table for frozen final proposals
-- When a planner sends a "Final Proposal", the current state is captured here

CREATE TABLE IF NOT EXISTS proposal_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1,
    snapshot_data JSONB NOT NULL, -- Full proposal data frozen at send time
    token TEXT UNIQUE NOT NULL, -- Separate token for final proposal link
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'viewed', 'approved', 'declined', 'changes_requested')),
    client_feedback TEXT,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add final_proposal_token to events for quick lookup
ALTER TABLE events ADD COLUMN IF NOT EXISTS final_proposal_token TEXT;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_proposal_snapshots_event ON proposal_snapshots(event_id);
CREATE INDEX IF NOT EXISTS idx_proposal_snapshots_token ON proposal_snapshots(token);

-- RLS
ALTER TABLE proposal_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Planners can manage proposal snapshots"
    ON proposal_snapshots FOR ALL
    USING (
        event_id IN (SELECT id FROM events WHERE planner_id = auth.uid())
    );

-- Public read access via token (for client viewing)
CREATE POLICY "Public can view snapshots by token"
    ON proposal_snapshots FOR SELECT
    USING (true);
