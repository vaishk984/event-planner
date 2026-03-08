-- Migration: Make denormalized columns nullable in booking_requests
-- event_name, event_date, city, venue, guest_count are denormalized copies
-- of event data. Since event_id (FK) already links to the events table,
-- these NOT NULL constraints are unnecessary and block inserts from the service.

ALTER TABLE booking_requests
    ALTER COLUMN event_name DROP NOT NULL,
    ALTER COLUMN event_date DROP NOT NULL;
