-- Add Client Portal columns to Events table
-- Required for public access link and proposal tracking

ALTER TABLE events ADD COLUMN IF NOT EXISTS public_token TEXT UNIQUE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS proposal_status VARCHAR(50) DEFAULT 'draft';
ALTER TABLE events ADD COLUMN IF NOT EXISTS proposal_version INTEGER DEFAULT 1;
ALTER TABLE events ADD COLUMN IF NOT EXISTS proposal_locked BOOLEAN DEFAULT false;

-- Index for faster lookup by token
CREATE INDEX IF NOT EXISTS idx_events_public_token ON events(public_token);
