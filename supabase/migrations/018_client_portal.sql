-- Add public token and proposal status
ALTER TABLE events ADD COLUMN IF NOT EXISTS public_token UUID DEFAULT gen_random_uuid();
ALTER TABLE events ADD COLUMN IF NOT EXISTS proposal_status TEXT DEFAULT 'draft' CHECK (proposal_status IN ('draft', 'sent', 'approved', 'declined'));

CREATE UNIQUE INDEX IF NOT EXISTS events_public_token_idx ON events(public_token);

-- RPC to get event by token (Public access)
CREATE OR REPLACE FUNCTION get_public_event(token_input UUID)
RETURNS SETOF events
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM events WHERE public_token = token_input;
$$;

-- RPC to update proposal status (Public access)
CREATE OR REPLACE FUNCTION update_proposal_status(token_input UUID, status_input TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_event_id UUID;
BEGIN
  SELECT id INTO v_event_id FROM events WHERE public_token = token_input;
  
  IF v_event_id IS NULL THEN
    RETURN FALSE;
  END IF;

  UPDATE events SET proposal_status = status_input WHERE id = v_event_id;
  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION get_public_event(UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION update_proposal_status(UUID, TEXT) TO anon, authenticated, service_role;

-- get_public_timeline(token)
CREATE OR REPLACE FUNCTION get_public_timeline(token_input UUID)
RETURNS TABLE (
  id UUID,
  event_id UUID,
  function_id UUID,
  title TEXT,
  description TEXT,
  start_time TEXT,
  end_time TEXT,
  location TEXT,
  status TEXT,
  sort_order INTEGER,
  vendor_company_name TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id, t.event_id, t.function_id, t.title, t.description, t.start_time, t.end_time, t.location, t.status, t.sort_order,
    v.company_name as vendor_company_name
  FROM timeline_items t
  JOIN events e ON t.event_id = e.id
  LEFT JOIN vendors v ON t.vendor_id = v.id
  WHERE e.public_token = token_input
  ORDER BY t.start_time ASC, t.sort_order ASC;
END;
$$;

-- get_public_functions(token)
CREATE OR REPLACE FUNCTION get_public_functions(token_input UUID)
RETURNS SETOF event_functions
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT f.*
  FROM event_functions f
  JOIN events e ON f.event_id = e.id
  WHERE e.public_token = token_input
  ORDER BY f.date ASC, f.start_time ASC;
END;
$$;

-- get_public_budget(token)
CREATE OR REPLACE FUNCTION get_public_budget(token_input UUID)
RETURNS TABLE (
  total_estimated NUMERIC,
  total_spent NUMERIC,
  total_paid NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_event_id UUID;
BEGIN
  SELECT id INTO v_event_id FROM events WHERE public_token = token_input;
  
  -- Return sum
  RETURN QUERY
  SELECT 
    COALESCE(SUM(b.estimated_amount), 0) as total_estimated,
    COALESCE(SUM(b.actual_amount), 0) as total_spent,
    COALESCE(SUM(b.paid_amount), 0) as total_paid
  FROM budget_items b
  WHERE b.event_id = v_event_id;
END;
$$;

GRANT EXECUTE ON FUNCTION get_public_timeline(UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_public_functions(UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_public_budget(UUID) TO anon, authenticated, service_role;


