-- Migration: Add client feedback to events and update RPC
-- Adds a column to store client feedback on proposals and updates the RPC to accept it

ALTER TABLE events ADD COLUMN IF NOT EXISTS client_feedback TEXT;

-- Update the RPC to accept an optional feedback parameter
DROP FUNCTION IF EXISTS update_proposal_status(text, text);

CREATE OR REPLACE FUNCTION update_proposal_status(token_input text, status_input text, feedback_input text DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE events 
    SET 
        proposal_status = status_input,
        proposal_locked = (CASE WHEN status_input = 'approved' THEN true ELSE proposal_locked END),
        client_feedback = COALESCE(feedback_input, client_feedback)
    WHERE public_token = token_input;
END;
$$;
