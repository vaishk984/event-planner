-- Migration: Add missing columns to booking_requests
-- The booking service tries to insert 'notes', 'payment_schedule',
-- 'agreed_amount', and 'service_details' but those columns never existed.

ALTER TABLE booking_requests
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS service_details TEXT,
    ADD COLUMN IF NOT EXISTS agreed_amount DECIMAL(15, 2),
    ADD COLUMN IF NOT EXISTS payment_schedule TEXT DEFAULT '[]';
