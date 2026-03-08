-- Fix RLS policy for vendor signup
-- Allow users to create their own vendor records during signup

-- Add policy to allow users to insert their own vendor record
DROP POLICY IF EXISTS "Users can insert own vendor record" ON vendors;
CREATE POLICY "Users can insert own vendor record"
    ON vendors FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Add policy to allow users to view their own vendor record
DROP POLICY IF EXISTS "Users can view own vendor record" ON vendors;
CREATE POLICY "Users can view own vendor record"
    ON vendors FOR SELECT
    USING (auth.uid() = user_id);

-- Add policy to allow users to update their own vendor record
DROP POLICY IF EXISTS "Users can update own vendor record" ON vendors;
CREATE POLICY "Users can update own vendor record"
    ON vendors FOR UPDATE
    USING (auth.uid() = user_id);
