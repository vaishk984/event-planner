-- Migration: Add 'draft' status to booking_requests
-- Purpose: Allow saving vendor selections in Proposal Builder without sending them

ALTER TABLE booking_requests DROP CONSTRAINT IF EXISTS booking_requests_status_check;

ALTER TABLE booking_requests ADD CONSTRAINT booking_requests_status_check 
CHECK (status IN ('draft', 'pending', 'quoted', 'accepted', 'declined', 'completed', 'cancelled'));
