-- Migration: Fix booking_requests status constraint to match UI values
-- The UI uses descriptive statuses not covered by the old constraint

ALTER TABLE booking_requests DROP CONSTRAINT IF EXISTS booking_requests_status_check;

ALTER TABLE booking_requests ADD CONSTRAINT booking_requests_status_check
CHECK (status IN (
    'draft',            -- saved but not sent
    'pending',          -- sent, awaiting response
    'quote_requested',  -- planner asked for a quote
    'quote_received',   -- vendor sent a quote back
    'quoted',           -- alias for quote_received (legacy)
    'negotiating',      -- in negotiation
    'accepted',         -- vendor accepted (legacy alias for confirmed)
    'confirmed',        -- booking confirmed
    'deposit_paid',     -- deposit has been paid
    'completed',        -- event done
    'declined',         -- vendor declined
    'cancelled'         -- cancelled by either party
));
