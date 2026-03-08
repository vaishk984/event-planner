-- Client Portal RPC Functions
-- These functions allow public access to specific event data via the secure public_token

-- 1. Get Public Event (and mark as viewed)
CREATE OR REPLACE FUNCTION get_public_event(token_input text)
RETURNS SETOF events
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Optional: Mark as viewed if it was 'sent'
    UPDATE events 
    SET proposal_status = 'viewed' 
    WHERE public_token = token_input AND proposal_status = 'sent';

    RETURN QUERY 
    SELECT * FROM events WHERE public_token = token_input LIMIT 1;
END;
$$;

-- 2. Get Public Timeline
-- Returns timeline items for the event associated with the token
CREATE OR REPLACE FUNCTION get_public_timeline(token_input text)
RETURNS SETOF timeline_items
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT ti.*
    FROM timeline_items ti
    JOIN events e ON ti.event_id = e.id
    WHERE e.public_token = token_input
    ORDER BY ti.start_time ASC;
$$;

-- 3. Get Public Functions
-- Returns event functions (days/ceremonies) for the event
CREATE OR REPLACE FUNCTION get_public_functions(token_input text)
RETURNS SETOF event_functions
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT ef.*
    FROM event_functions ef
    JOIN events e ON ef.event_id = e.id
    WHERE e.public_token = token_input
    ORDER BY ef.date ASC, ef.start_time ASC;
$$;

-- 4. Get Public Budget
-- Returns calculated totals for the event
CREATE OR REPLACE FUNCTION get_public_budget(token_input text)
RETURNS TABLE("totalEstimated" numeric, "totalSpent" numeric, "totalPaid" numeric)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    target_event_id uuid;
BEGIN
    SELECT id INTO target_event_id FROM events WHERE public_token = token_input;

    RETURN QUERY
    WITH budget_total AS (
        SELECT COALESCE(SUM(estimated_amount), 0) as est, COALESCE(SUM(actual_amount), 0) as act, COALESCE(SUM(paid_amount), 0) as pd
        FROM budget_items WHERE event_id = target_event_id
    ),
    bookings_total AS (
        SELECT COALESCE(SUM(quoted_amount), 0) as est, COALESCE(SUM(quoted_amount), 0) as act, 0 as pd
        FROM booking_requests WHERE event_id = target_event_id AND status IN ('accepted', 'confirmed', 'completed', 'quoted')
    )
    SELECT
        (SELECT est FROM budget_total) + (SELECT est FROM bookings_total) as "totalEstimated",
        (SELECT act FROM budget_total) + (SELECT act FROM bookings_total) as "totalSpent",
        (SELECT pd FROM budget_total) + (SELECT pd FROM bookings_total) as "totalPaid";
END;
$$;

-- 5. Update Proposal Status
-- Allows client to Approve or Decline
CREATE OR REPLACE FUNCTION update_proposal_status(token_input text, status_input text)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE events 
    SET 
        proposal_status = status_input,
        proposal_locked = (CASE WHEN status_input = 'approved' THEN true ELSE proposal_locked END)
    WHERE public_token = token_input;
END;
$$;
