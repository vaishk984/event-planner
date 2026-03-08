-- Migration: Client Portal
-- Adds client_token to events and client_messages table
-- Adds RLS policies for anonymous portal access

-- ============================================================================
-- 1. ADD client_token TO EVENTS
-- ============================================================================

ALTER TABLE events ADD COLUMN IF NOT EXISTS client_token UUID DEFAULT gen_random_uuid() UNIQUE;

-- Index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_events_client_token ON events(client_token);

-- Allow anonymous access to events via client_token (portal visitors are unauthenticated)
DROP POLICY IF EXISTS "Anyone can read events by client_token" ON events;
CREATE POLICY "Anyone can read events by client_token"
    ON events FOR SELECT
    USING (client_token IS NOT NULL);

-- ============================================================================
-- 2. CLIENT_MESSAGES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS client_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('client', 'planner')),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_messages_event ON client_messages(event_id);
CREATE INDEX IF NOT EXISTS idx_client_messages_created ON client_messages(created_at DESC);

-- RLS
ALTER TABLE client_messages ENABLE ROW LEVEL SECURITY;

-- Planners can manage messages for their events
DROP POLICY IF EXISTS "Planners can manage client messages" ON client_messages;
CREATE POLICY "Planners can manage client messages"
    ON client_messages FOR ALL
    USING (
        event_id IN (SELECT id FROM events WHERE planner_id = auth.uid())
    );

-- Allow anonymous inserts for client messages (authenticated by token in app logic)
DROP POLICY IF EXISTS "Anyone can insert client messages" ON client_messages;
CREATE POLICY "Anyone can insert client messages"
    ON client_messages FOR INSERT
    WITH CHECK (sender_type = 'client');

-- Allow anonymous reads for client messages (token validated in app logic)
DROP POLICY IF EXISTS "Anyone can read client messages" ON client_messages;
CREATE POLICY "Anyone can read client messages"
    ON client_messages FOR SELECT
    USING (true);

-- ============================================================================
-- 3. RLS POLICIES FOR PORTAL READ ACCESS
-- These allow anonymous portal visitors to read related data
-- ============================================================================

-- booking_requests: allow anonymous reads (portal shows anonymized services)
DROP POLICY IF EXISTS "Anyone can read booking requests" ON booking_requests;
CREATE POLICY "Anyone can read booking requests"
    ON booking_requests FOR SELECT
    USING (true);

-- timeline_items: allow anonymous reads (portal shows event schedule)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'timeline_items') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Anyone can read timeline items" ON timeline_items';
        EXECUTE 'CREATE POLICY "Anyone can read timeline items" ON timeline_items FOR SELECT USING (true)';
    END IF;
END $$;

-- event_day_updates: allow anonymous reads (portal shows live updates)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'event_day_updates') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Anyone can read event day updates" ON event_day_updates';
        EXECUTE 'CREATE POLICY "Anyone can read event day updates" ON event_day_updates FOR SELECT USING (true)';
    END IF;
END $$;

-- event_specs: allow anonymous reads (portal shows client requirements)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'event_specs') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Anyone can read event specs" ON event_specs';
        EXECUTE 'CREATE POLICY "Anyone can read event specs" ON event_specs FOR SELECT USING (true)';
    END IF;
END $$;

-- intakes: allow anonymous reads (portal shows requirements from intake)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'intakes') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Anyone can read intakes" ON intakes';
        EXECUTE 'CREATE POLICY "Anyone can read intakes" ON intakes FOR SELECT USING (true)';
    END IF;
END $$;

-- vendors: allow anonymous reads (portal needs vendor category for service labels)
DROP POLICY IF EXISTS "Anyone can read vendors" ON vendors;
CREATE POLICY "Anyone can read vendors"
    ON vendors FOR SELECT
    USING (true);
