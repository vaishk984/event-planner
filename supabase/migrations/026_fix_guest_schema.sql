-- Migration: Fix Guests Table Schema
-- Adds missing columns required by the application

-- Use DO block to safely add columns if they don't exist
DO $$ 
BEGIN
    -- category
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'guests' AND column_name = 'category') THEN
        ALTER TABLE guests ADD COLUMN category TEXT DEFAULT 'other';
    END IF;

    -- rsvp_status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'guests' AND column_name = 'rsvp_status') THEN
        ALTER TABLE guests ADD COLUMN rsvp_status TEXT DEFAULT 'pending' CHECK (rsvp_status IN ('pending', 'confirmed', 'declined', 'maybe'));
    END IF;

    -- dietary_preferences
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'guests' AND column_name = 'dietary_preferences') THEN
        ALTER TABLE guests ADD COLUMN dietary_preferences TEXT;
    END IF;

    -- plus_one
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'guests' AND column_name = 'plus_one') THEN
        ALTER TABLE guests ADD COLUMN plus_one BOOLEAN DEFAULT FALSE;
    END IF;

    -- plus_one_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'guests' AND column_name = 'plus_one_name') THEN
        ALTER TABLE guests ADD COLUMN plus_one_name TEXT;
    END IF;

    -- table_number
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'guests' AND column_name = 'table_number') THEN
        ALTER TABLE guests ADD COLUMN table_number INTEGER;
    END IF;
    
    -- email (in case it's missing too)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'guests' AND column_name = 'email') THEN
        ALTER TABLE guests ADD COLUMN email TEXT;
    END IF;

    -- phone (in case it's missing too)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'guests' AND column_name = 'phone') THEN
        ALTER TABLE guests ADD COLUMN phone TEXT;
    END IF;

END $$;

-- Ensure RLS is enabled and policies exist
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'guests' AND policyname = 'Users can manage their guests') THEN
        CREATE POLICY "Users can manage their guests"
            ON guests
            FOR ALL
            USING (
                event_id IN (
                    SELECT id FROM events WHERE planner_id = auth.uid()
                )
            );
    END IF;
END $$;
